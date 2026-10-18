// "Lumen": a soft warm halo that follows a mouse over the night imagery only.
// The system cursor always stays. Place one instance per page (any size; it
// renders a fixed, click-through overlay).
//
// Shows over elements marked data-lumen (the hero, scene loops, day/night
// slider set it themselves). A non-empty value becomes a small label, e.g.
// data-lumen="Drag". Hidden over text and controls, for touch and keyboard
// users, with reduced motion, and while motion is paused.

import { useEffect, useRef, type CSSProperties } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { font } from "./tokens.tsx"
import { useDeviceTier } from "./useDeviceTier.tsx"
import { useStore } from "./store.tsx"

type Props = { size: number; strength: number; extraSelector: string; style?: CSSProperties }

const QUIET = "a,button,input,textarea,select,label,p,h1,h2,h3,h4,li,figcaption,[role=button]"

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function LumenCursor({ size, strength, extraSelector }: Props) {
    const { finePointer, reducedMotion } = useDeviceTier()
    const paused = useStore((s) => s.motionPaused)
    const halo = useRef<HTMLDivElement>(null)
    const label = useRef<HTMLSpanElement>(null)
    const enabled = finePointer && !reducedMotion && !paused && RenderTarget.current() !== RenderTarget.canvas

    useEffect(() => {
        if (!enabled) return
        const h = halo.current!
        const l = label.current!
        const selector = ["[data-lumen]", extraSelector].filter(Boolean).join(",")
        let tx = 0
        let ty = 0
        let x = 0
        let y = 0
        let raf = 0
        let shown = false
        let scale = 1

        const setShown = (on: boolean) => {
            if (on === shown) return
            shown = on
            h.style.opacity = on ? "1" : "0"
            h.style.transitionDuration = on ? "300ms" : "250ms"
        }
        const loop = () => {
            x += (tx - x) * 0.15
            y += (ty - y) * 0.15
            h.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0) scale(${scale})`
            raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(loop) : 0
        }
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return setShown(false)
            tx = e.clientX
            ty = e.clientY
            const t = e.target as Element | null
            const zone = t?.closest?.(selector) as HTMLElement | null
            const quiet = t?.closest?.(QUIET)
            if (!shown) {
                x = tx
                y = ty
            }
            setShown(!!zone && !quiet)
            const text = zone?.getAttribute("data-lumen") || ""
            if (l.textContent !== text) l.textContent = text
            l.style.opacity = text && zone && !quiet ? "1" : "0"
            if (!raf) raf = requestAnimationFrame(loop)
        }
        const onDown = () => {
            scale = 0.8
            if (!raf) raf = requestAnimationFrame(loop)
        }
        const onUp = () => {
            scale = 1
            if (!raf) raf = requestAnimationFrame(loop)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Tab") setShown(false)
        }
        const onLeave = () => setShown(false)

        window.addEventListener("pointermove", onMove, { passive: true })
        window.addEventListener("pointerdown", onDown, { passive: true })
        window.addEventListener("pointerup", onUp, { passive: true })
        window.addEventListener("keydown", onKey)
        document.documentElement.addEventListener("pointerleave", onLeave)
        return () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerdown", onDown)
            window.removeEventListener("pointerup", onUp)
            window.removeEventListener("keydown", onKey)
            document.documentElement.removeEventListener("pointerleave", onLeave)
            if (raf) cancelAnimationFrame(raf)
        }
    }, [enabled, size, extraSelector])

    if (!enabled) return null
    return (
        <div
            ref={halo}
            aria-hidden="true"
            style={{
                position: "fixed",
                left: 0,
                top: 0,
                width: size,
                height: size,
                zIndex: 9999,
                pointerEvents: "none",
                opacity: 0,
                transition: "opacity 300ms cubic-bezier(0.16, 1, 0.3, 1)",
                borderRadius: "50%",
                mixBlendMode: "screen",
                background: `radial-gradient(circle, rgba(255,205,140,${strength}) 0%, rgba(255,190,120,${strength * 0.35}) 38%, rgba(255,180,110,0) 70%)`,
                willChange: "transform",
            }}
        >
            <span
                ref={label}
                style={{
                    position: "absolute",
                    left: size / 2 + 16,
                    top: size / 2 - 10,
                    padding: "4px 8px",
                    borderRadius: 999,
                    background: "rgba(5,7,11,.7)",
                    color: "#F2D59A",
                    font: `500 10.5px/1.2 ${font.mono}`,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    opacity: 0,
                    transition: "opacity 150ms",
                    whiteSpace: "nowrap",
                }}
            />
        </div>
    )
}

LumenCursor.defaultProps = { size: 120, strength: 0.22, extraSelector: "" }

addPropertyControls(LumenCursor, {
    size: { type: ControlType.Number, title: "Size", min: 60, max: 240, step: 4 },
    strength: { type: ControlType.Number, title: "Strength", min: 0.05, max: 0.5, step: 0.01 },
    extraSelector: {
        type: ControlType.String,
        title: "Also over",
        placeholder: ".project-card",
        description: "Optional CSS selector for native Framer layers, e.g. project cards.",
    },
})
