// Scroll-scrubbed cinematic hero: one house, one locked camera. Scroll sets the
// sun, the roofline lights up, then the year plays through its chapters
// (Halloween, Christmas, red-and-white game days, blue-and-white game days).
//
// The Higgsfield hero film is exported as a WebP image sequence (scripts/make-frames.sh)
// and drawn to a canvas as the visitor scrolls. An image sequence scrubs smoothly
// on every browser, iOS Safari included, where seeking an MP4 stutters.
//
// Sequence of the experience:
//   1. Poster paints immediately (the LCP image), copy is readable at 55%.
//   2. Ignition intro: frames 0 -> `introTo` play on their own (sunset fades,
//      roofline traces on). Any scroll takes over at once.
//   3. Scroll scrubs the rest of the film; the copy "lights up" at `revealAt`.
//
// Tiers: high/medium scrub frames (phones get the lighter 9:16 set); low and
// reduced-motion visitors get the final lit still and a normal-height section.

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { motion, AnimatePresence } from "framer-motion"
import { color, font, ease, dur, monoLabel, cssEase } from "./tokens.tsx"
import { useDeviceTier } from "./useDeviceTier.tsx"
import { useStore, setState } from "./store.tsx"
import { FrameSequence, drawCover, type Frame } from "./frameSequence.tsx"
import MagneticButton from "./MagneticButton.tsx"

type Img = { src: string; srcSet?: string; alt?: string }

// One stop in the film after the ignition: the scene shown from `at` (0-1 of
// the scroll) onward. scripts/make-film.sh prints the `at` values for a cut.
type Chapter = { at: number; label: string; time: string; title: string; body: string; cta: string; swatch: string }

type Props = {
    chapters: Chapter[]
    desktopFrames: string
    desktopCount: number
    mobileFrames: string
    mobileCount: number
    framePad: number
    poster?: Img
    mobilePoster?: Img
    finalFrame?: Img
    scrollLength: number
    focusX: number
    mobileFocusX: number
    introTo: number
    introSeconds: number
    revealAt: number
    eyebrow: string
    headline: string
    emphasis: string
    lede: string
    headingTag: "h1" | "h2"
    primaryLabel: string
    primaryLink: string
    secondaryLabel: string
    secondaryLink: string
    hudLabel: string
    clockFrom: string
    clockTo: string
    hudTop: number
    style?: CSSProperties
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function toMinutes(hhmm: string) {
    const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10) || 0)
    return h * 60 + m
}
function formatClock(minutes: number) {
    const h24 = Math.floor(minutes / 60) % 24
    const h = h24 % 12 || 12
    return { time: `${h}:${String(minutes % 60).padStart(2, "0")}`, meridiem: h24 < 12 ? "AM" : "PM" }
}

const CSS = `
.ie-hero{position:relative;background:${color.night};color:${color.moonstone}}
.ie-hero__stage{position:sticky;top:0;height:100svh;min-height:560px;overflow:hidden}
.ie-hero__media,.ie-hero__canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.ie-hero__canvas{opacity:0;transition:opacity .6s ${cssEase.dusk}}
.ie-hero__canvas.is-ready{opacity:1}
.ie-hero__scrim{position:absolute;inset:auto 0 0 0;height:62%;pointer-events:none;
  background:linear-gradient(180deg,rgba(5,7,11,0) 0%,rgba(5,7,11,.7) 55%,rgba(5,7,11,.94) 100%)}
.ie-hero__overlay{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;
  padding:0 max(24px,env(safe-area-inset-right,0px)) 48px max(24px,env(safe-area-inset-left,0px))}
.ie-hero__inner{width:100%;max-width:1320px;margin:0 auto}
.ie-hero__stack{display:grid}
.ie-hero__stack > *{grid-area:1/1}
.ie-hero__copy{max-width:680px;align-self:end}
.ie-hero__chapter{max-width:560px;align-self:end}
.ie-hero__chaptitle{font-family:${font.display};font-weight:400;font-size:clamp(36px,4.6vw,68px);line-height:1;
  letter-spacing:-.01em;margin:0 0 16px;color:#EEF1F4;text-wrap:balance}
.ie-hero__dots{display:inline-flex;gap:3px}
.ie-hero__dots i{width:7px;height:7px;border-radius:50%;display:block}
.ie-hero__eyebrow{display:flex;align-items:center;gap:12px;margin:0 0 18px;color:${color.goldBright}}
.ie-hero__eyebrow::before{content:"";width:28px;height:1px;background:${color.gold};box-shadow:0 0 8px ${color.gold}}
.ie-hero__title{font-family:${font.display};font-weight:400;font-size:clamp(44px,6vw,92px);line-height:.98;
  letter-spacing:-.012em;margin:0 0 22px;color:#EEF1F4;text-wrap:balance}
.ie-hero__title em{font-style:italic;color:${color.goldBright};text-shadow:0 0 34px rgba(217,180,106,.35)}
.ie-hero__line{display:block}
.ie-hero__lede{font-family:${font.body};font-size:clamp(15px,1.2vw,17px);line-height:1.6;max-width:52ch;margin:0 0 30px}
.ie-hero__ctas{display:flex;flex-wrap:wrap;align-items:center;gap:14px 28px}
.ie-hero__hud{position:absolute;right:max(24px,env(safe-area-inset-right,0px));display:flex;gap:16px;align-items:baseline}
.ie-hero__clock{color:${color.moonstone};font-variant-numeric:tabular-nums}
.ie-hero__cue{position:absolute;right:max(24px,env(safe-area-inset-right,0px));bottom:48px;width:1px;height:56px;
  background:linear-gradient(${color.gold},rgba(217,180,106,0));transform-origin:top;opacity:0;transition:opacity .4s}
@keyframes ie-cue{0%{transform:scaleY(0)}60%{transform:scaleY(1)}100%{transform:scaleY(1);opacity:0}}
.ie-hero__cue.is-on{animation:ie-cue 1.6s ${cssEase.ignite} infinite}
@media (max-width:809px){
  .ie-hero__overlay{padding-bottom:32px}
  .ie-hero__hud .ie-hero__hudlabel{display:none}
  .ie-hero__cue{display:none}
}
@media (prefers-reduced-motion:reduce){.ie-hero__canvas,.ie-hero__cue{transition:none;animation:none}}
`

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function ScrollVideoHero(props: Props) {
    const p = props
    const isEditor = RenderTarget.current() === RenderTarget.canvas
    const device = useDeviceTier()
    const paused = useStore((s) => s.motionPaused)

    const mobile = device.narrow
    const useMobileSet = mobile && !!p.mobileFrames
    const pattern = useMobileSet ? p.mobileFrames : p.desktopFrames
    const count = useMobileSet ? p.mobileCount : p.desktopCount
    const animated = !isEditor && !!pattern && count > 1 && (device.tier === "high" || device.tier === "medium")

    const sectionRef = useRef<HTMLElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [ready, setReady] = useState(false)
    const [lit, setLit] = useState(!animated)
    const [scrolled, setScrolled] = useState(false)
    const [minutes, setMinutes] = useState(toMinutes(animated ? p.clockFrom : p.clockTo))
    const [chapter, setChapter] = useState(-1) // -1 = the ignition, before the first season

    // Keep the latest values reachable from the animation loop without restarting it.
    const chapterStarts = p.chapters.map((c) => c.at)
    const liveValues = {
        paused,
        revealAt: p.revealAt,
        from: toMinutes(p.clockFrom),
        to: toMinutes(p.clockTo),
        chapterStarts,
    }
    const live = useRef(liveValues)
    live.current = liveValues

    useEffect(() => {
        if (!animated) {
            setLit(true)
            setMinutes(toMinutes(p.clockTo))
            return
        }
        const section = sectionRef.current
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d", { alpha: false })
        if (!section || !canvas || !ctx) return

        const seq = new FrameSequence(pattern, count, p.framePad, device.tier === "high" ? 6 : 4)
        const dprCap = device.tier === "high" ? 2 : 1.5
        const focusX = mobile ? p.mobileFocusX : p.focusX

        let scrollP = 0
        let intro = 0
        let introStart = 0
        let cur = 0
        let drawnPos = -1
        let drawnA: Frame | null = null
        let drawnB: Frame | null = null
        let lastNow = 0
        let raf = 0
        let visible = true
        let lastMinute = -1
        let isLit = false
        let hasScrolled = false
        let lastChapter = -1
        const mountedAt = performance.now()

        const schedule = () => {
            if (!raf && visible) raf = requestAnimationFrame(tick)
        }

        function tick(now: number) {
            raf = 0
            // Ignition intro starts once the coarse frame set is in (or after 2.5s).
            if (!introStart && (seq.loadedCount >= Math.min(count, 24) || now - mountedAt > 2500)) {
                introStart = now
            }
            if (introStart && intro < 1) {
                intro = live.current.paused ? 1 : clamp01((now - introStart) / (p.introSeconds * 1000))
            }
            const target = Math.max(scrollP, easeInOutCubic(intro) * p.introTo)
            // Frame-rate independent easing: the same feel at 60 Hz and 120 Hz.
            const dt = lastNow ? Math.min(64, now - lastNow) : 16.7
            lastNow = now
            cur += (target - cur) * (1 - Math.pow(1 - 0.16, dt / 16.7))
            if (Math.abs(target - cur) < 0.0002) cur = target

            // Blend the two frames either side of the exact position, so a short
            // sequence (or one still loading) glides instead of stepping.
            const pos = cur * (count - 1)
            const i0 = Math.floor(pos)
            const f = pos - i0
            seq.focus(i0)
            const a = seq.nearest(i0)
            const b = f > 0.02 ? seq.get(Math.min(count - 1, i0 + 1)) : null
            if (a && (Math.abs(pos - drawnPos) > 0.01 || a !== drawnA || b !== drawnB)) {
                const w = canvas!.width
                const h = canvas!.height
                ctx!.globalAlpha = 1
                drawCover(ctx!, a, w, h, focusX, 0.5)
                if (b && b !== a) {
                    ctx!.globalAlpha = f
                    drawCover(ctx!, b, w, h, focusX, 0.5)
                    ctx!.globalAlpha = 1
                }
                drawnPos = pos
                drawnA = a
                drawnB = b
                setReady(true)
            }

            if (!isLit && cur >= live.current.revealAt) {
                isLit = true
                setLit(true)
            }
            // The clock runs across the ignition only; each season chapter shows its own date.
            const starts = live.current.chapterStarts
            const ignitionEnd = starts.length ? starts[0] : 1
            const m = Math.round(live.current.from + (live.current.to - live.current.from) * clamp01(cur / ignitionEnd))
            if (m !== lastMinute) {
                lastMinute = m
                setMinutes(m)
            }
            let ci = -1
            starts.forEach((at, i) => {
                if (cur >= at) ci = i
            })
            if (ci !== lastChapter) {
                lastChapter = ci
                setChapter(ci)
            }
            if (cur !== target || intro < 1 || seq.loadedCount < count) schedule()
        }

        const resize = () => {
            const r = canvas.getBoundingClientRect()
            const d = Math.min(window.devicePixelRatio || 1, dprCap)
            const w = Math.max(1, Math.round(r.width * d))
            const h = Math.max(1, Math.round(r.height * d))
            // Setting the size clears the canvas, so only do it on a real change
            // (not on every toolbar show/hide during a phone scroll).
            if (w === canvas.width && h === canvas.height) return
            canvas.width = w
            canvas.height = h
            drawnPos = -1
            schedule()
        }
        const onScroll = () => {
            const r = section.getBoundingClientRect()
            const span = r.height - window.innerHeight
            scrollP = span > 0 ? clamp01(-r.top / span) : 0
            if (!hasScrolled && scrollP > 0.01) {
                hasScrolled = true
                intro = 1 // the visitor's scroll wins over the intro
                setScrolled(true)
            }
            schedule()
        }

        seq.onFrameLoaded = schedule
        seq.start()
        const ro = new ResizeObserver(resize)
        ro.observe(canvas)
        const io = new IntersectionObserver(([e]) => {
            visible = e.isIntersecting
            if (visible) schedule()
        })
        io.observe(section)
        window.addEventListener("scroll", onScroll, { passive: true })
        onScroll()

        return () => {
            seq.cancel()
            ro.disconnect()
            io.disconnect()
            window.removeEventListener("scroll", onScroll)
            if (raf) cancelAnimationFrame(raf)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [animated, pattern, count, p.framePad, device.tier, mobile, p.introTo, p.introSeconds])

    const poster = (mobile && p.mobilePoster?.src ? p.mobilePoster : p.poster) as Img | undefined
    const still = p.finalFrame?.src ? p.finalFrame : poster
    const clock = formatClock(minutes)
    const length = animated ? (mobile ? Math.max(160, p.scrollLength * 0.7) : p.scrollLength) : 100
    const Heading = p.headingTag
    const reduce = device.reducedMotion
    const active = animated && chapter >= 0 ? p.chapters[chapter] : null

    // Carry the season on screen into the booking form (pre-fills "first scene").
    useEffect(() => {
        if (active) setState({ scene: active.label })
    }, [active])

    const lineMotion = (i: number) => ({
        initial: false as const,
        animate: lit ? { opacity: 1, y: 0 } : { opacity: 0.55, y: reduce ? 0 : 12 },
        transition: { duration: dur.reveal, ease: ease.ignite, delay: lit ? i * 0.09 : 0 },
    })

    return (
        <section
            ref={sectionRef}
            className="ie-hero"
            aria-label={p.eyebrow || "Illuminated Exteriors"}
            data-lumen=""
            style={{ height: isEditor ? 760 : `${length}svh`, ...p.style }}
        >
            <style>{CSS}</style>
            <div className="ie-hero__stage" style={isEditor ? { position: "relative", height: 760 } : undefined}>
                {animated ? (
                    poster?.src ? (
                        <img
                            className="ie-hero__media"
                            src={poster.src}
                            srcSet={poster.srcSet}
                            alt=""
                            fetchPriority="high"
                        />
                    ) : null
                ) : still?.src ? (
                    <img
                        className="ie-hero__media"
                        src={still.src}
                        srcSet={still.srcSet}
                        alt={still.alt || "A home at night with permanent lights along the roofline"}
                        fetchPriority="high"
                    />
                ) : null}
                {animated ? (
                    <canvas
                        ref={canvasRef}
                        className={`ie-hero__canvas${ready ? " is-ready" : ""}`}
                        aria-hidden="true"
                    />
                ) : null}
                <div className="ie-hero__scrim" aria-hidden="true" />

                <div className="ie-hero__hud" style={{ top: p.hudTop, ...monoLabel }} aria-hidden="true">
                    <span className="ie-hero__hudlabel">{active ? active.label : p.hudLabel}</span>
                    <span className="ie-hero__clock">
                        {active ? (
                            active.time
                        ) : (
                            <>
                                {clock.time} <span style={{ color: color.dim }}>{clock.meridiem}</span>
                            </>
                        )}
                    </span>
                </div>
                {animated ? (
                    <span className={`ie-hero__cue${!scrolled && lit && !paused ? " is-on" : ""}`} aria-hidden="true" />
                ) : null}

                <div className="ie-hero__overlay">
                    <div className="ie-hero__inner ie-hero__stack">
                        <div
                            className="ie-hero__copy"
                            style={{
                                opacity: active ? 0 : 1,
                                visibility: active ? "hidden" : "visible",
                                transition: `opacity .5s ${cssEase.dusk}, visibility .5s`,
                            }}
                        >
                            {p.eyebrow ? (
                                <motion.p className="ie-hero__eyebrow" style={monoLabel} {...lineMotion(0)}>
                                    <span style={{ color: color.goldBright }}>{p.eyebrow}</span>
                                </motion.p>
                            ) : null}
                            <Heading className="ie-hero__title">
                                <motion.span className="ie-hero__line" {...lineMotion(0)}>
                                    {p.headline}
                                </motion.span>
                                {p.emphasis ? (
                                    <motion.em className="ie-hero__line" {...lineMotion(1)}>
                                        {p.emphasis}
                                    </motion.em>
                                ) : null}
                            </Heading>
                            <motion.p className="ie-hero__lede" {...lineMotion(3)}>
                                {p.lede}
                            </motion.p>
                            <motion.div className="ie-hero__ctas" {...lineMotion(5)}>
                                <MagneticButton
                                    {...MagneticButton.defaultProps}
                                    label={p.primaryLabel}
                                    link={p.primaryLink}
                                    variant="primary"
                                    personalize
                                />
                                {p.secondaryLabel ? (
                                    <MagneticButton
                                        {...MagneticButton.defaultProps}
                                        label={p.secondaryLabel}
                                        link={p.secondaryLink}
                                        variant="text"
                                        magnetic={false}
                                    />
                                ) : null}
                            </motion.div>
                        </div>

                        <AnimatePresence mode="wait">
                            {active ? (
                                <motion.div
                                    key={chapter}
                                    className="ie-hero__chapter"
                                    initial={reduce ? false : { opacity: 0, y: 24 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        transition: { duration: dur.reveal, ease: ease.ignite },
                                    }}
                                    exit={{ opacity: 0, y: -12, transition: { duration: dur.quick, ease: ease.fade } }}
                                    aria-live="polite"
                                >
                                    <p className="ie-hero__eyebrow" style={monoLabel}>
                                        <span className="ie-hero__dots" aria-hidden="true">
                                            {active.swatch
                                                .split(",")
                                                .map((c) => c.trim())
                                                .filter(Boolean)
                                                .map((c) => (
                                                    <i key={c} style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
                                                ))}
                                        </span>
                                        <span style={{ color: color.goldBright }}>{active.label}</span>
                                    </p>
                                    <h2 className="ie-hero__chaptitle">{active.title}</h2>
                                    <p className="ie-hero__lede">{active.body}</p>
                                    <MagneticButton
                                        {...MagneticButton.defaultProps}
                                        label={active.cta || p.primaryLabel}
                                        link={p.primaryLink}
                                        variant="primary"
                                    />
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    )
}

ScrollVideoHero.defaultProps = {
    chapters: [
        {
            at: 0.349,
            label: "Halloween",
            time: "Oct 31 · 7:30 PM",
            title: "Halloween, without the ladder.",
            body: "Pumpkin orange and violet, flickering like embers. Set it once in the app and it's there every year.",
            cta: "Put Halloween on my house",
            swatch: "#FF7417,#8B3DFF",
        },
        {
            at: 0.53,
            label: "Christmas",
            time: "Dec 24 · 6:00 PM",
            title: "The lights are already up.",
            body: "Classic red, green and warm white, with no tangled strands and no cold afternoon on the roof.",
            cta: "Put Christmas on my house",
            swatch: "#FF2B3A,#25C25A,#FFD7A0",
        },
        {
            at: 0.711,
            label: "Red & White Game Day",
            time: "Game day · 6:30 PM",
            title: "Scarlet and cream, all season.",
            body: "Your roofline in red and white for every home game, on a schedule, so it's lit before kickoff.",
            cta: "Put Red & White on my house",
            swatch: "#E41C38,#F5F1E7",
        },
        {
            at: 0.892,
            label: "Blue & White Game Day",
            time: "Tip-off · 7:00 PM",
            title: "Then blue and white for hoops season.",
            body: "One tap switches the whole house. Warm white the rest of the week, and every color in between.",
            cta: "Put Blue & White on my house",
            swatch: "#005CA9,#F2F4FF",
        },
    ],
    desktopFrames: "",
    desktopCount: 330,
    mobileFrames: "",
    mobileCount: 250,
    framePad: 4,
    scrollLength: 720,
    focusX: 0.62,
    mobileFocusX: 0.5,
    introTo: 0.217,
    introSeconds: 3.6,
    revealAt: 0.169,
    eyebrow: "Permanent roofline lighting · Omaha & Elkhorn",
    headline: "Invisible by day.",
    emphasis: "Unforgettable by night.",
    lede: "One install along your roofline. Warm white on an ordinary Tuesday, red and white on game day, a show for the birthday, and every holiday after that. You change it from your phone, and nobody climbs a ladder again.",
    headingTag: "h1",
    primaryLabel: "Get a Free Design",
    primaryLink: "/free-design",
    secondaryLabel: "See every occasion",
    secondaryLink: "#occasions",
    hudLabel: "Blue hour",
    clockFrom: "18:12",
    clockTo: "18:46",
    hudTop: 96,
}

addPropertyControls(ScrollVideoHero, {
    chapters: {
        type: ControlType.Array,
        title: "Chapters",
        maxCount: 8,
        control: {
            type: ControlType.Object,
            controls: {
                at: { type: ControlType.Number, title: "Starts at", min: 0, max: 1, step: 0.005 },
                label: { type: ControlType.String, title: "Label" },
                time: { type: ControlType.String, title: "HUD time" },
                title: { type: ControlType.String, title: "Title" },
                body: { type: ControlType.String, title: "Body", displayTextArea: true },
                cta: { type: ControlType.String, title: "CTA" },
                swatch: { type: ControlType.String, title: "Colors" },
            },
        },
    },
    desktopFrames: {
        type: ControlType.String,
        title: "Frames 16:9",
        placeholder: "https://cdn.example.com/hero/16x9/{n}.webp",
        description: "{n} is replaced by the zero-padded frame number, starting at 1.",
    },
    desktopCount: { type: ControlType.Number, title: "Count 16:9", min: 2, max: 600, step: 1 },
    mobileFrames: {
        type: ControlType.String,
        title: "Frames 9:16",
        placeholder: "https://cdn.example.com/hero/9x16/{n}.webp",
    },
    mobileCount: { type: ControlType.Number, title: "Count 9:16", min: 2, max: 600, step: 1 },
    framePad: { type: ControlType.Number, title: "Digits", min: 1, max: 6, step: 1 },
    poster: { type: ControlType.ResponsiveImage, title: "Poster 16:9" },
    mobilePoster: { type: ControlType.ResponsiveImage, title: "Poster 9:16" },
    finalFrame: {
        type: ControlType.ResponsiveImage,
        title: "Lit still",
        description: "Shown for reduced motion and slow connections.",
    },
    scrollLength: { type: ControlType.Number, title: "Scroll (vh)", min: 120, max: 600, step: 10 },
    focusX: { type: ControlType.Number, title: "Focus X", min: 0, max: 1, step: 0.01 },
    mobileFocusX: { type: ControlType.Number, title: "Focus X 9:16", min: 0, max: 1, step: 0.01 },
    introTo: {
        type: ControlType.Number,
        title: "Intro to",
        min: 0,
        max: 1,
        step: 0.01,
        description: "Share of the film that plays on load.",
    },
    introSeconds: { type: ControlType.Number, title: "Intro (s)", min: 1, max: 8, step: 0.1 },
    revealAt: { type: ControlType.Number, title: "Copy lights at", min: 0, max: 1, step: 0.01 },
    eyebrow: { type: ControlType.String, title: "Eyebrow" },
    headline: { type: ControlType.String, title: "Headline" },
    emphasis: { type: ControlType.String, title: "Gold line" },
    lede: { type: ControlType.String, title: "Lede", displayTextArea: true },
    headingTag: { type: ControlType.Enum, title: "Tag", options: ["h1", "h2"] },
    primaryLabel: { type: ControlType.String, title: "CTA" },
    primaryLink: { type: ControlType.Link, title: "CTA link" },
    secondaryLabel: { type: ControlType.String, title: "Link" },
    secondaryLink: { type: ControlType.Link, title: "Link to" },
    hudLabel: { type: ControlType.String, title: "HUD label" },
    clockFrom: { type: ControlType.String, title: "Clock from", placeholder: "18:12" },
    clockTo: { type: ControlType.String, title: "Clock to", placeholder: "18:46" },
    hudTop: { type: ControlType.Number, title: "HUD top", min: 0, max: 200, step: 4 },
})
