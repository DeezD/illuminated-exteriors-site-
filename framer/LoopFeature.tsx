// A feature band: one short seamless loop beside a label, title and body.
// Used for the product-story loops (Invisible by day, Warm to cool, Zones,
// Light show, The pixel). Plays only while on screen; shows the still for
// reduced motion, slow connections, the editor canvas and when motion is paused.

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { color, font, monoLabel } from "./tokens.tsx"
import { useDeviceTier } from "./useDeviceTier.tsx"
import { useStore } from "./store.tsx"

type Img = { src: string; srcSet?: string; alt?: string }

type Props = {
    video: string
    still?: Img
    label: string
    title: string
    body: string
    mediaSide: "left" | "right"
    aspect: string
    style?: CSSProperties
}

const CSS = `
.ie-loop{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:clamp(24px,5vw,72px);align-items:center;
  color:${color.moonstone}}
.ie-loop.is-left .ie-loop__media{order:0}.ie-loop.is-right .ie-loop__media{order:2}
.ie-loop__media{position:relative;overflow:hidden;border-radius:6px;background:${color.blueHour};aspect-ratio:var(--ie-aspect)}
.ie-loop__media video,.ie-loop__media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ie-loop__copy{order:1;max-width:460px}
.ie-loop__label{display:flex;align-items:center;gap:12px;margin:0 0 14px;color:${color.goldBright}}
.ie-loop__label::before{content:"";width:28px;height:1px;background:${color.gold};box-shadow:0 0 8px ${color.gold}}
.ie-loop__title{font-family:${font.display};font-weight:400;font-size:clamp(32px,3.6vw,52px);line-height:1.02;
  margin:0 0 14px;color:#EEF1F4;text-wrap:balance}
.ie-loop__body{font-family:${font.body};font-size:16px;line-height:1.65;margin:0}
@media (max-width:809px){.ie-loop{grid-template-columns:minmax(0,1fr)}.ie-loop .ie-loop__media{order:0}.ie-loop__copy{order:1}}
`

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function LoopFeature({ video, still, label, title, body, mediaSide, aspect, style }: Props) {
    const isEditor = RenderTarget.current() === RenderTarget.canvas
    const { tier } = useDeviceTier()
    const paused = useStore((s) => s.motionPaused)
    const ref = useRef<HTMLDivElement>(null)
    const vid = useRef<HTMLVideoElement>(null)
    const [inView, setInView] = useState(false)
    const play = !!video && !isEditor && !paused && tier !== "still" && tier !== "low"

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "150px" })
        io.observe(el)
        return () => io.disconnect()
    }, [])
    useEffect(() => {
        const v = vid.current
        if (!v) return
        if (inView) v.play().catch(() => {})
        else v.pause()
    }, [inView, play])

    return (
        <section className={`ie-loop is-${mediaSide}`} style={style}>
            <style>{CSS}</style>
            <div ref={ref} className="ie-loop__media" style={{ ["--ie-aspect" as string]: aspect }} data-lumen="">
                {play && inView ? (
                    <video
                        ref={vid}
                        src={video}
                        poster={still?.src}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        aria-hidden="true"
                    />
                ) : still?.src ? (
                    <img src={still.src} srcSet={still.srcSet} alt={still.alt || ""} loading="lazy" />
                ) : null}
            </div>
            <div className="ie-loop__copy">
                <p className="ie-loop__label" style={{ ...monoLabel, color: color.goldBright }}>
                    {label}
                </p>
                <h2 className="ie-loop__title">{title}</h2>
                <p className="ie-loop__body">{body}</p>
            </div>
        </section>
    )
}

LoopFeature.defaultProps = {
    video: "",
    label: "Warm to cool",
    title: "Cozy at 7. Bright at midnight.",
    body: "Pick any white from candle-warm to crisp daylight. Schedule warm white for the evening and a brighter, cooler white after dark for security.",
    mediaSide: "left",
    aspect: "16 / 9",
}

addPropertyControls(LoopFeature, {
    video: { type: ControlType.File, title: "Loop", allowedFileTypes: ["mp4", "webm"] },
    still: { type: ControlType.ResponsiveImage, title: "Still" },
    label: { type: ControlType.String, title: "Label" },
    title: { type: ControlType.String, title: "Title" },
    body: { type: ControlType.String, title: "Body", displayTextArea: true },
    mediaSide: { type: ControlType.Enum, title: "Media", options: ["left", "right"], optionTitles: ["Left", "Right"] },
    aspect: { type: ControlType.String, title: "Aspect", placeholder: "16 / 9" },
})
