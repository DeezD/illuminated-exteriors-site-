// "Every Occasion" (7:00 PM -> the whole year).
//
// Each scene is a short seamless loop of the same house from the same locked
// camera (Higgsfield brief, section 3). Choosing a scene crossfades loops over
// 1.2s; only the visible loop (plus the one fading out and one warmed on hover)
// is ever loaded.
//
// Three ways in, all equivalent:
//   - scene chips
//   - inline scene words in the body copy: write [Game Day] to make it a control
//   - scroll: on desktop the seasons advance as the section scrolls past, until
//     the visitor picks one themselves (their choice is never overwritten)
// The choice goes to the shared store, which personalizes every CTA and
// pre-fills the booking form.

import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { color, font, cssEase, monoLabel } from "./tokens.tsx"
import { useDeviceTier } from "./useDeviceTier.tsx"
import { useStore, setState } from "./store.tsx"
import MagneticButton from "./MagneticButton.tsx"

type Img = { src: string; srcSet?: string; alt?: string }
type Scene = { label: string; video?: string; poster?: Img; swatch: string; note: string }

type Props = {
    anchorId: string
    eyebrow: string
    heading: string
    body: string
    scenes: Scene[]
    scrollCycle: boolean
    ctaLabel: string
    ctaLink: string
    ctaTemplate: string
    style?: CSSProperties
}

const CSS = `
.ie-occ{position:relative;background:${color.night};color:${color.moonstone}}
.ie-occ__stage{position:relative;height:min(100svh,940px);min-height:620px;overflow:hidden}
.ie-occ.is-sticky .ie-occ__stage{position:sticky;top:0;height:100svh}
.ie-occ__media{position:absolute;inset:0}
.ie-occ__layer{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;
  transition:opacity 1.2s ${cssEase.dusk}}
.ie-occ__layer.is-on{opacity:1}
.ie-occ__scrim{position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(90deg,rgba(5,7,11,.92) 0%,rgba(5,7,11,.72) 34%,rgba(5,7,11,0) 62%)}
.ie-occ__content{position:absolute;inset:0;display:flex;align-items:center;
  padding:96px max(24px,env(safe-area-inset-right,0px)) 64px max(24px,env(safe-area-inset-left,0px))}
.ie-occ__inner{width:100%;max-width:1320px;margin:0 auto}
.ie-occ__copy{max-width:470px}
.ie-occ__eyebrow{display:flex;align-items:center;gap:12px;margin:0 0 16px}
.ie-occ__eyebrow::before{content:"";width:28px;height:1px;background:var(--ie-accent);box-shadow:0 0 8px var(--ie-accent);
  transition:background 1.2s ${cssEase.dusk},box-shadow 1.2s ${cssEase.dusk}}
.ie-occ__title{font-family:${font.display};font-weight:400;font-size:clamp(38px,4.6vw,68px);line-height:1;
  letter-spacing:-.01em;margin:0 0 18px;color:#EEF1F4;text-wrap:balance}
.ie-occ__body{font-family:${font.body};font-size:16px;line-height:1.65;margin:0 0 26px}
.ie-occ__word{font:inherit;color:${color.goldBright};background:none;border:0;padding:0;cursor:pointer;
  text-decoration:underline dotted;text-underline-offset:4px;text-decoration-color:rgba(242,213,154,.6)}
.ie-occ__word[aria-pressed="true"]{text-decoration-style:solid}
.ie-occ__word:focus-visible,.ie-occ__chip:focus-visible{outline:2px solid ${color.goldBright};outline-offset:3px}
.ie-occ__chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px;padding:0;list-style:none}
.ie-occ__chip{font-family:${font.body};font-size:13.5px;font-weight:500;color:${color.moonstone};
  background:rgba(5,7,11,.55);border:1px solid ${color.line};border-radius:999px;min-height:44px;
  padding:0 15px 0 12px;display:inline-flex;align-items:center;gap:9px;cursor:pointer;
  transition:border-color .2s ${cssEase.switch},background .2s ${cssEase.switch}}
.ie-occ__chip:hover{border-color:rgba(242,213,154,.5)}
.ie-occ__chip[aria-pressed="true"]{border-color:${color.goldBright};background:rgba(217,180,106,.1);color:#fff}
.ie-occ__dots{display:inline-flex;gap:2px}
.ie-occ__dots i{width:6px;height:6px;border-radius:50%;display:block}
.ie-occ__chip[aria-pressed="true"] .ie-occ__dots{animation:ie-pulse .4s ${cssEase.ignite}}
@keyframes ie-pulse{50%{transform:scale(1.3)}}
.ie-occ__readout{margin:0 0 26px;min-height:1.6em}
@media (max-width:809px){
  .ie-occ__stage{height:auto;min-height:0}
  .ie-occ__media{position:relative;aspect-ratio:4/5;max-height:62svh;width:100%}
  .ie-occ__scrim{background:linear-gradient(180deg,rgba(5,7,11,0) 60%,${color.night} 100%)}
  .ie-occ__content{position:relative;padding:8px max(20px,env(safe-area-inset-right,0px)) 56px max(20px,env(safe-area-inset-left,0px))}
  .ie-occ__copy{max-width:none}
}
@media (prefers-reduced-motion:reduce){.ie-occ__layer,.ie-occ__chip,.ie-occ__eyebrow::before{transition:none}
  .ie-occ__chip[aria-pressed="true"] .ie-occ__dots{animation:none}}
`

const swatchList = (s: string) =>
    s
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function OccasionScenes(props: Props) {
    const { anchorId, eyebrow, heading, body, scenes, scrollCycle, ctaLabel, ctaLink, ctaTemplate, style } = props
    const isEditor = RenderTarget.current() === RenderTarget.canvas
    const device = useDeviceTier()
    const paused = useStore((s) => s.motionPaused)
    const storeScene = useStore((s) => s.scene)
    const interacted = useStore((s) => s.interacted)

    const initial = Math.max(
        0,
        scenes.findIndex((s) => s.label === storeScene),
    )
    const [active, setActive] = useState(interacted ? initial : 0)
    const [previous, setPrevious] = useState<number | null>(null)
    const [warm, setWarm] = useState<number | null>(null)
    const [inView, setInView] = useState(false)
    const sectionRef = useRef<HTMLElement>(null)
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

    const playVideo = !isEditor && !paused && device.tier !== "still" && device.tier !== "low"
    const sticky = scrollCycle && !isEditor && !device.narrow && device.tier !== "still" && scenes.length > 1

    const show = (i: number) => {
        if (i === active || i < 0 || i >= scenes.length) return
        setPrevious(active)
        setActive(i)
    }
    const choose = (i: number) => {
        show(i)
        setState({ scene: scenes[i].label, interacted: true })
    }

    // Drop the outgoing layer once its fade has finished.
    useEffect(() => {
        if (previous === null) return
        const t = setTimeout(() => setPrevious(null), 1300)
        return () => clearTimeout(t)
    }, [previous, active])

    // Pause loops off screen; play the visible one when allowed.
    useEffect(() => {
        const el = sectionRef.current
        if (!el) return
        const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "200px" })
        io.observe(el)
        return () => io.disconnect()
    }, [])
    useEffect(() => {
        videoRefs.current.forEach((v, i) => {
            if (!v) return
            if (playVideo && inView && (i === active || i === previous)) v.play().catch(() => {})
            else v.pause()
        })
    }, [active, previous, playVideo, inView])

    // Scroll-driven seasons (desktop), stopped by the visitor's own choice.
    const live = useRef({ interacted, active })
    live.current = { interacted, active }
    useEffect(() => {
        if (!sticky) return
        const el = sectionRef.current
        if (!el) return
        const onScroll = () => {
            if (live.current.interacted) return
            const r = el.getBoundingClientRect()
            const span = r.height - window.innerHeight
            if (span <= 0) return
            const prog = Math.max(0, Math.min(0.999, -r.top / span))
            const i = Math.floor(prog * scenes.length)
            if (i !== live.current.active) {
                setPrevious(live.current.active)
                setActive(i)
            }
        }
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [sticky, scenes.length])

    const scene = scenes[active] ?? scenes[0]
    const accent = swatchList(scene?.swatch ?? "")[0] ?? color.gold

    // Body copy: [Label] becomes an inline control for the scene with that label.
    const bodyParts = useMemo(() => body.split(/(\[[^\]]+\])/g), [body])

    const mountedLayers = new Set([active, previous, warm].filter((i): i is number => i !== null))

    return (
        <section
            ref={sectionRef}
            id={anchorId || undefined}
            className={`ie-occ${sticky ? " is-sticky" : ""}`}
            aria-labelledby={`${anchorId}-title`}
            style={{
                height: sticky ? `${100 + scenes.length * 45}svh` : undefined,
                ["--ie-accent" as string]: accent,
                ...style,
            }}
        >
            <style>{CSS}</style>
            <div className="ie-occ__stage">
                <div className="ie-occ__media" data-lumen="" aria-hidden="true">
                    {scenes.map((s, i) => {
                        const on = i === active
                        if (!mountedLayers.has(i)) return null
                        return playVideo && s.video ? (
                            <video
                                key={i}
                                ref={(v) => {
                                    videoRefs.current[i] = v
                                }}
                                className={`ie-occ__layer${on ? " is-on" : ""}`}
                                src={s.video}
                                poster={s.poster?.src}
                                muted
                                loop
                                playsInline
                                preload={on ? "auto" : "metadata"}
                            />
                        ) : s.poster?.src ? (
                            <img
                                key={i}
                                className={`ie-occ__layer${on ? " is-on" : ""}`}
                                src={s.poster.src}
                                srcSet={s.poster.srcSet}
                                alt=""
                                loading={i === 0 ? "eager" : "lazy"}
                            />
                        ) : null
                    })}
                    <div className="ie-occ__scrim" />
                </div>

                <div className="ie-occ__content">
                    <div className="ie-occ__inner">
                        <div className="ie-occ__copy">
                            <p className="ie-occ__eyebrow" style={{ ...monoLabel, color: color.goldBright }}>
                                {eyebrow}
                            </p>
                            <h2 id={`${anchorId}-title`} className="ie-occ__title">
                                {heading}
                            </h2>
                            <p className="ie-occ__body">
                                {bodyParts.map((part, k) => {
                                    const m = part.match(/^\[([^\]]+)\]$/)
                                    if (!m) return <Fragment key={k}>{part}</Fragment>
                                    const idx = scenes.findIndex((s) => s.label.toLowerCase() === m[1].toLowerCase())
                                    if (idx < 0) return <Fragment key={k}>{m[1]}</Fragment>
                                    return (
                                        <button
                                            key={k}
                                            type="button"
                                            className="ie-occ__word"
                                            aria-pressed={idx === active}
                                            onClick={() => choose(idx)}
                                            onPointerEnter={() => device.finePointer && setWarm(idx)}
                                        >
                                            {m[1]}
                                        </button>
                                    )
                                })}
                            </p>

                            <ul className="ie-occ__chips" aria-label="Lighting scenes">
                                {scenes.map((s, i) => (
                                    <li key={s.label}>
                                        <button
                                            type="button"
                                            className="ie-occ__chip"
                                            aria-pressed={i === active}
                                            onClick={() => choose(i)}
                                            onPointerEnter={() => device.finePointer && setWarm(i)}
                                            onFocus={() => setWarm(i)}
                                        >
                                            <span className="ie-occ__dots" aria-hidden="true">
                                                {swatchList(s.swatch).map((c) => (
                                                    <i key={c} style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
                                                ))}
                                            </span>
                                            {s.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <p className="ie-occ__readout" style={monoLabel} aria-live="polite">
                                <span style={{ color: color.goldBright }}>{scene?.label}</span>
                                {scene?.note ? ` · ${scene.note}` : ""}
                            </p>

                            <MagneticButton
                                {...MagneticButton.defaultProps}
                                label={ctaLabel}
                                link={ctaLink}
                                variant="primary"
                                personalize
                                personalizedTemplate={ctaTemplate}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

OccasionScenes.defaultProps = {
    anchorId: "occasions",
    eyebrow: "Every occasion",
    heading: "365 nights. One install.",
    body: "Warm white for an ordinary Tuesday. [Red & White Game Day] on Saturdays, [Blue & White Game Day] for hoops season, a light show for the [Birthday], then [Halloween], [Christmas] and every night in between, all from your phone.",
    scrollCycle: true,
    ctaLabel: "Get a Free Design",
    ctaLink: "/free-design",
    ctaTemplate: "Put {scene} on my house",
    scenes: [
        { label: "Everyday", swatch: "#FFC27A", note: "Warm white · Steady" },
        { label: "Red & White Game Day", swatch: "#E41C38,#F5F1E7", note: "Scarlet and cream · Chase" },
        { label: "Blue & White Game Day", swatch: "#005CA9,#F2F4FF", note: "Royal blue and white · Wave" },
        { label: "Birthday", swatch: "#FF5FA2,#5FE0FF,#FFD84D", note: "Confetti · Chase" },
        { label: "July 4th", swatch: "#FF3347,#F2F4FF,#2F5BFF", note: "Red, white and blue · Wave" },
        { label: "Halloween", swatch: "#FF7417,#8B3DFF", note: "Ember flicker · Twinkle" },
        { label: "Christmas", swatch: "#FF2B3A,#25C25A,#FFD7A0", note: "Classic · Twinkle" },
    ],
}

addPropertyControls(OccasionScenes, {
    anchorId: { type: ControlType.String, title: "Anchor ID" },
    eyebrow: { type: ControlType.String, title: "Eyebrow" },
    heading: { type: ControlType.String, title: "Heading" },
    body: {
        type: ControlType.String,
        title: "Body",
        displayTextArea: true,
        description: "Wrap a scene name in [brackets] to make it a control.",
    },
    scenes: {
        type: ControlType.Array,
        title: "Scenes",
        maxCount: 9,
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, title: "Label" },
                video: { type: ControlType.File, title: "Loop", allowedFileTypes: ["mp4", "webm"] },
                poster: { type: ControlType.ResponsiveImage, title: "Still" },
                swatch: { type: ControlType.String, title: "Colors", placeholder: "#FF7417,#8B3DFF" },
                note: { type: ControlType.String, title: "Readout" },
            },
        },
    },
    scrollCycle: { type: ControlType.Boolean, title: "Scroll seasons", description: "Desktop only." },
    ctaLabel: { type: ControlType.String, title: "CTA" },
    ctaLink: { type: ControlType.Link, title: "CTA link" },
    ctaTemplate: { type: ControlType.String, title: "After choice" },
})
