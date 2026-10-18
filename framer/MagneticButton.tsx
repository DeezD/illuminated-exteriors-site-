// The site's one button component.
//   primary   - gold "Free Design" CTA; the only magnetic element on the site (6px max)
//   secondary - outlined
//   text      - link with the gold underline that draws in on hover
// With `personalize` on, the label rewrites itself after the visitor picks a
// lighting scene ("Put Game Day on my house").

import { useRef, type CSSProperties, type PointerEvent } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { color, font, cssEase, dur, ease } from "./tokens.tsx"
import { useStore } from "./store.tsx"
import { useDeviceTier } from "./useDeviceTier.tsx"

type Variant = "primary" | "secondary" | "text"

type Props = {
    label: string
    link: string
    newTab: boolean
    variant: Variant
    magnetic: boolean
    strength: number
    personalize: boolean
    personalizedTemplate: string
    style?: CSSProperties
}

const CSS = `
.ie-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:10px;
  text-decoration:none;cursor:pointer;white-space:nowrap;-webkit-tap-highlight-color:transparent;
  font-family:${font.body};font-size:15px;line-height:1;outline:none}
.ie-btn--primary{color:#1A1209;background:${color.gold};font-weight:600;padding:16px 28px;border-radius:999px;
  box-shadow:0 0 0 1px rgba(242,213,154,.55),0 0 26px rgba(217,180,106,.42),0 0 80px rgba(217,180,106,.16);
  transition:box-shadow ${dur.quick}s ${cssEase.switch}}
.ie-btn--primary:hover{box-shadow:0 0 0 1px rgba(242,213,154,.85),0 0 36px rgba(217,180,106,.7),0 0 110px rgba(217,180,106,.28)}
.ie-btn--secondary{color:${color.moonstone};background:transparent;font-weight:500;padding:15px 24px;border-radius:999px;
  border:1px solid ${color.line};transition:border-color ${dur.quick}s ${cssEase.switch},color ${dur.quick}s ${cssEase.switch}}
.ie-btn--secondary:hover{border-color:${color.gold};color:${color.goldBright}}
.ie-btn--text{color:${color.moonstone};font-weight:500;padding:8px 0;
  background-image:linear-gradient(${color.gold},${color.gold});background-size:0% 1px;background-repeat:no-repeat;
  background-position:100% 100%;transition:background-size .25s ${cssEase.fade},color .2s}
.ie-btn--text:hover{background-size:100% 1px;background-position:0 100%;transition:background-size .35s ${cssEase.ignite},color .2s;color:${color.goldBright}}
.ie-btn:focus-visible{box-shadow:0 0 0 2px ${color.night},0 0 0 4px ${color.goldBright}}
@media (prefers-reduced-motion: reduce){.ie-btn{transition:none!important}}
`

export default function MagneticButton(props: Props) {
    const { label, link, newTab, variant, magnetic, strength, personalize, personalizedTemplate, style } = props
    const ref = useRef<HTMLAnchorElement>(null)
    const { finePointer, reducedMotion } = useDeviceTier()
    const paused = useStore((s) => s.motionPaused)
    const scene = useStore((s) => s.scene)
    const interacted = useStore((s) => s.interacted)

    const pullOn = variant === "primary" && magnetic && finePointer && !reducedMotion && !paused
    const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 22, mass: 0.6 })
    const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 22, mass: 0.6 })
    const lx = useSpring(useMotionValue(0), { stiffness: 220, damping: 22, mass: 0.6 })
    const ly = useSpring(useMotionValue(0), { stiffness: 220, damping: 22, mass: 0.6 })
    const pressed = useRef(false)

    const onMove = (e: PointerEvent) => {
        if (!pullOn || pressed.current || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.65)))
        const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.65)))
        x.set(dx * strength)
        y.set(dy * strength)
        lx.set(dx * strength * 0.5)
        ly.set(dy * strength * 0.5)
    }
    const reset = () => {
        pressed.current = false
        x.set(0)
        y.set(0)
        lx.set(0)
        ly.set(0)
    }

    const text = personalize && interacted && scene ? personalizedTemplate.replace("{scene}", scene) : label

    return (
        // The padded wrapper widens the magnetic field to ~1.3x the button without changing layout.
        <span
            style={{ display: "inline-block", padding: pullOn ? 14 : 0, margin: pullOn ? -14 : 0, ...style }}
            onPointerMove={onMove}
            onPointerLeave={reset}
        >
            <style>{CSS}</style>
            <motion.a
                ref={ref}
                href={link}
                target={newTab ? "_blank" : undefined}
                rel={newTab ? "noopener" : undefined}
                className={`ie-btn ie-btn--${variant}`}
                style={{ x, y }}
                layout={reducedMotion ? false : "size"}
                transition={{ layout: { duration: dur.base, ease: ease.ignite } }}
                whileTap={reducedMotion ? undefined : { scale: 0.98, transition: { duration: dur.tap } }}
                onPointerDown={() => (pressed.current = true)}
                onPointerUp={() => (pressed.current = false)}
            >
                {/* Outer span: label parallax (half the button's pull). Inner span: text swap. */}
                <motion.span style={{ x: lx, y: ly, display: "inline-block" }}>
                    <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                            key={text}
                            style={{ display: "inline-block" }}
                            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.3, ease: ease.ignite }}
                        >
                            {text}
                        </motion.span>
                    </AnimatePresence>
                </motion.span>
                {variant === "text" ? <span aria-hidden="true">→</span> : null}
            </motion.a>
        </span>
    )
}

MagneticButton.defaultProps = {
    label: "Get a Free Design",
    link: "/free-design",
    newTab: false,
    variant: "primary",
    magnetic: true,
    strength: 6,
    personalize: false,
    personalizedTemplate: "Put {scene} on my house",
}

addPropertyControls(MagneticButton, {
    label: { type: ControlType.String, title: "Label" },
    link: { type: ControlType.Link, title: "Link" },
    newTab: { type: ControlType.Boolean, title: "New tab" },
    variant: {
        type: ControlType.Enum,
        title: "Variant",
        options: ["primary", "secondary", "text"],
        optionTitles: ["Primary (gold)", "Secondary", "Text link"],
    },
    magnetic: { type: ControlType.Boolean, title: "Magnetic", hidden: (p: Props) => p.variant !== "primary" },
    strength: {
        type: ControlType.Number,
        title: "Pull (px)",
        min: 0,
        max: 8,
        step: 1,
        hidden: (p: Props) => p.variant !== "primary" || !p.magnetic,
    },
    personalize: { type: ControlType.Boolean, title: "Personalize" },
    personalizedTemplate: {
        type: ControlType.String,
        title: "Template",
        hidden: (p: Props) => !p.personalize,
    },
})
