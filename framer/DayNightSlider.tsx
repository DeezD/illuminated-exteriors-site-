// "Invisible by Day": one frame, two times of day. Drag to compare.
//
// Touch: the stage uses touch-action: pan-y, so vertical swipes still scroll the
// page and only horizontal drags move the divider. Keyboard and screen readers
// use a real range input (arrow keys, Home/End), visually merged into the handle.

import { useRef, useState, type CSSProperties, type PointerEvent } from "react"
import { addPropertyControls, ControlType } from "framer"
import { color, font, cssEase, monoLabel } from "./tokens.tsx"

type Img = { src: string; srcSet?: string; alt?: string }

type Props = {
    day?: Img
    night?: Img
    start: number
    aspect: string
    mobileAspect: string
    dayLabel: string
    nightLabel: string
    dayCaption: string
    nightCaption: string
    style?: CSSProperties
}

const CSS = `
.ie-dn{position:relative;width:100%;overflow:hidden;background:${color.blueHour};touch-action:pan-y;
  user-select:none;-webkit-user-select:none;cursor:ew-resize;aspect-ratio:var(--ie-aspect)}
.ie-dn img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.ie-dn__night{clip-path:inset(0 0 0 var(--ie-x))}
.ie-dn.is-settling .ie-dn__night{transition:clip-path .3s ${cssEase.ignite}}
.ie-dn.is-settling .ie-dn__handle{transition:left .3s ${cssEase.ignite}}
.ie-dn__handle{position:absolute;top:0;bottom:0;left:var(--ie-x);width:1px;background:${color.goldBright};
  box-shadow:0 0 12px ${color.gold};transform:translateX(-.5px)}
.ie-dn__knob{position:absolute;top:50%;left:50%;width:48px;height:48px;margin:-24px 0 0 -24px;border-radius:50%;
  background:rgba(5,7,11,.72);border:1px solid ${color.goldBright};display:grid;place-items:center;
  color:${color.goldBright};font:14px/1 ${font.mono};backdrop-filter:blur(6px)}
.ie-dn__tag{position:absolute;top:16px;padding:6px 10px;border-radius:999px;background:rgba(5,7,11,.6)}
.ie-dn__range{position:absolute;inset:0;width:100%;height:100%;opacity:0;margin:0;cursor:ew-resize;pointer-events:none}
.ie-dn__range:focus-visible + .ie-dn__handle .ie-dn__knob{box-shadow:0 0 0 2px ${color.night},0 0 0 4px ${color.goldBright}}
.ie-dn__caption{margin:14px 0 0;min-height:1.6em}
@media (max-width:809px){.ie-dn{aspect-ratio:var(--ie-aspect-m)}}
@media (prefers-reduced-motion:reduce){.ie-dn.is-settling .ie-dn__night,.ie-dn.is-settling .ie-dn__handle{transition:none}}
`

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function DayNightSlider(props: Props) {
    const { day, night, start, aspect, mobileAspect, dayLabel, nightLabel, dayCaption, nightCaption, style } = props
    const [x, setX] = useState(start) // share of the frame (0-100) showing day, from the left
    const [settling, setSettling] = useState(false)
    const stage = useRef<HTMLDivElement>(null)
    const dragging = useRef(false)

    const fromPointer = (e: PointerEvent) => {
        const r = stage.current!.getBoundingClientRect()
        setX(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)))
    }
    const onDown = (e: PointerEvent) => {
        dragging.current = true
        setSettling(false)
        stage.current?.setPointerCapture(e.pointerId)
        fromPointer(e)
    }
    const onMove = (e: PointerEvent) => {
        if (dragging.current) fromPointer(e)
    }
    const onUp = () => {
        if (!dragging.current) return
        dragging.current = false
        // Within 12% of an edge, settle fully to that side.
        if (x < 12 || x > 88) {
            setSettling(true)
            setX(x < 12 ? 0 : 100)
        }
    }

    const caption = x >= 50 ? dayCaption : nightCaption

    return (
        <figure style={{ margin: 0, ...style }}>
            <style>{CSS}</style>
            <div
                ref={stage}
                className={`ie-dn${settling ? " is-settling" : ""}`}
                data-lumen="Drag"
                style={{
                    ["--ie-x" as string]: `${x}%`,
                    ["--ie-aspect" as string]: aspect,
                    ["--ie-aspect-m" as string]: mobileAspect,
                }}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
            >
                {day?.src ? (
                    <img src={day.src} srcSet={day.srcSet} alt={day.alt || "The house by day"} loading="lazy" />
                ) : null}
                {night?.src ? (
                    <img
                        className="ie-dn__night"
                        src={night.src}
                        srcSet={night.srcSet}
                        alt={night.alt || "The same house at night"}
                        loading="lazy"
                    />
                ) : null}
                <span
                    className="ie-dn__tag"
                    style={{ ...monoLabel, left: 16, color: color.moonstone }}
                    aria-hidden="true"
                >
                    {dayLabel}
                </span>
                <span
                    className="ie-dn__tag"
                    style={{ ...monoLabel, right: 16, color: color.goldBright }}
                    aria-hidden="true"
                >
                    {nightLabel}
                </span>
                <input
                    className="ie-dn__range"
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(x)}
                    aria-label="Compare the house by day and at night"
                    aria-valuetext={`${Math.round(x)}% daytime`}
                    onChange={(e) => {
                        setSettling(false)
                        setX(Number(e.target.value))
                    }}
                />
                <span className="ie-dn__handle" aria-hidden="true">
                    <span className="ie-dn__knob">↔</span>
                </span>
            </div>
            <figcaption className="ie-dn__caption" style={monoLabel} aria-live="polite">
                {caption}
            </figcaption>
        </figure>
    )
}

DayNightSlider.defaultProps = {
    start: 50,
    aspect: "16 / 9",
    mobileAspect: "4 / 5",
    dayLabel: "Noon",
    nightLabel: "6:40 PM",
    dayCaption: "Daytime · the track disappears into your trim",
    nightCaption: "Night · the same roofline, lit",
}

addPropertyControls(DayNightSlider, {
    day: { type: ControlType.ResponsiveImage, title: "Day" },
    night: { type: ControlType.ResponsiveImage, title: "Night" },
    start: { type: ControlType.Number, title: "Start %", min: 0, max: 100, step: 1 },
    aspect: { type: ControlType.String, title: "Aspect", placeholder: "16 / 9" },
    mobileAspect: { type: ControlType.String, title: "Aspect phone", placeholder: "4 / 5" },
    dayLabel: { type: ControlType.String, title: "Day tag" },
    nightLabel: { type: ControlType.String, title: "Night tag" },
    dayCaption: { type: ControlType.String, title: "Day caption" },
    nightCaption: { type: ControlType.String, title: "Night caption" },
})
