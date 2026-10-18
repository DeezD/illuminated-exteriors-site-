// "Book a Free Design": three short steps, then a confirmation in place.
//   1. Address  - ZIP checked against the service area. Outside it, either
//                 "send anyway, we'll confirm" (default) or a waitlist; never a dead end
//   2. Home     - stories, the scene picked earlier (pre-filled), optional photo
//   3. Contact  - name, phone (auto-formatted), email, best time
//
// Validation runs on blur and on Continue, never while typing. Progress (minus
// the photo) is kept as a draft in this browser and cleared after sending.
// Submissions POST multipart FormData to `endpoint`. For email delivery with no
// account, use FormSubmit's AJAX URL: https://formsubmit.co/ajax/<email>
// (Formspark, Basin, a Zapier or Make webhook, or a CRM form URL also work).

import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactElement } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { motion, AnimatePresence } from "framer-motion"
import { color, font, ease, monoLabel } from "./tokens.tsx"
import { useStore, setState } from "./store.tsx"
import { useDeviceTier } from "./useDeviceTier.tsx"

type Props = {
    endpoint: string
    serviceAreas: string
    outsideMode: "confirm" | "waitlist"
    serviceRadius: string
    sceneOptions: string
    responseTime: string
    phoneDisplay: string
    heading: string
    style?: CSSProperties
}

type Fields = {
    street: string
    zip: string
    stories: string
    scene: string
    notes: string
    name: string
    phone: string
    email: string
    bestTime: string
    textOk: boolean
    waitlistEmail: string
}
type FieldName = keyof Fields

const EMPTY: Fields = {
    street: "",
    zip: "",
    stories: "",
    scene: "",
    notes: "",
    name: "",
    phone: "",
    email: "",
    bestTime: "",
    textOk: false,
    waitlistEmail: "",
}
const DRAFT_KEY = "ie-booking-draft"
const STEPS = ["Your address", "Your home", "How to reach you"]
const STEP_FIELDS: FieldName[][] = [["street", "zip"], ["stories"], ["name", "phone", "email"]]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function formatPhone(raw: string) {
    const d = raw.replace(/\D/g, "").replace(/^1/, "").slice(0, 10)
    if (d.length < 4) return d
    if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

function validate(name: FieldName, f: Fields): string {
    switch (name) {
        case "street":
            return /\d/.test(f.street) && f.street.trim().length > 4
                ? ""
                : "Add your street number and name so we can find your roofline."
        case "zip":
            return /^\d{5}$/.test(f.zip) ? "" : "Enter your 5-digit ZIP code."
        case "stories":
            return f.stories ? "" : "Choose how many stories your home has."
        case "name":
            return f.name.trim().length > 1 ? "" : "Tell us who to ask for."
        case "phone":
            return f.phone.replace(/\D/g, "").length === 10 ? "" : "Enter a 10-digit phone number."
        case "email":
            return EMAIL_RE.test(f.email.trim()) ? "" : "Enter an email like name@example.com."
        case "waitlistEmail":
            return EMAIL_RE.test(f.waitlistEmail.trim()) ? "" : "Enter an email like name@example.com."
        default:
            return ""
    }
}

// One entry per line: a full ZIP ("68022 Elkhorn") or a ZIP prefix ending in *
// ("680* Omaha metro"). Exact ZIPs win over prefixes. Empty list = every ZIP served.
type Area = { prefix: string; label: string }
function parseAreas(text: string): Area[] {
    const list: Area[] = []
    text.split(/\n|;/).forEach((line) => {
        const m = line.trim().match(/^(\d{3,5})(\*?)\s*[,-]?\s*(.*)$/)
        if (m && (m[2] === "*" || m[1].length === 5)) list.push({ prefix: m[1], label: m[3].trim() })
    })
    return list.sort((a, b) => b.prefix.length - a.prefix.length)
}
function findArea(areas: Area[], zip: string): Area | undefined {
    return areas.find((a) => zip.startsWith(a.prefix))
}

const CSS = `
.ie-form{background:${color.blueHour};border:1px solid ${color.line};border-radius:20px;padding:clamp(22px,4vw,40px);
  color:${color.moonstone};font-family:${font.body};max-width:560px;width:100%;box-sizing:border-box}
.ie-form *{box-sizing:border-box}
.ie-form__title{font-family:${font.display};font-weight:400;font-size:clamp(30px,3.4vw,42px);line-height:1.05;margin:0 0 8px;color:#EEF1F4}
.ie-form__progress{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:18px 0 8px}
.ie-form__progress i{height:2px;border-radius:2px;background:${color.line};transition:background .4s}
.ie-form__progress i.is-done{background:${color.gold};box-shadow:0 0 8px rgba(217,180,106,.6)}
.ie-form__step{display:grid;gap:18px;margin-top:22px}
.ie-form__field{display:grid;gap:8px}
.ie-form label,.ie-form legend{font-size:14px;font-weight:600;color:#E6EAEE;padding:0}
.ie-form__hint{font-size:13px;color:${color.dim};margin:0}
.ie-form input[type=text],.ie-form input[type=tel],.ie-form input[type=email],.ie-form select,.ie-form textarea{
  width:100%;min-height:50px;padding:12px 14px;border-radius:12px;border:1px solid ${color.line};background:${color.night};
  color:#EEF1F4;font:16px/1.4 ${font.body};transition:border-color .15s,box-shadow .15s}
.ie-form textarea{min-height:96px;resize:vertical}
.ie-form input:focus,.ie-form select:focus,.ie-form textarea:focus{outline:none;border-color:${color.gold};
  box-shadow:0 0 0 3px rgba(217,180,106,.25)}
.ie-form [aria-invalid=true]{border-color:${color.amber}!important}
.ie-form__error{font-size:13px;color:${color.amber};margin:0}
.ie-form__ok{font-size:13px;color:${color.success};margin:0}
.ie-form fieldset{border:0;margin:0;padding:0;display:grid;gap:10px}
.ie-form__options{display:flex;flex-wrap:wrap;gap:8px}
.ie-form__option{position:relative}
.ie-form__option input{position:absolute;opacity:0;inset:0;margin:0;cursor:pointer}
.ie-form__option span{display:inline-flex;align-items:center;min-height:44px;padding:0 16px;border-radius:999px;
  border:1px solid ${color.line};font-size:14px;transition:border-color .2s,background .2s}
.ie-form__option input:checked + span{border-color:${color.goldBright};background:rgba(217,180,106,.1);color:#fff}
.ie-form__option input:focus-visible + span{box-shadow:0 0 0 2px ${color.night},0 0 0 4px ${color.goldBright}}
.ie-form__check{display:flex;gap:10px;align-items:flex-start;font-size:13px;color:${color.dim};font-weight:400}
.ie-form__check input{margin-top:2px;width:18px;height:18px;accent-color:${color.gold}}
.ie-form__actions{display:flex;gap:12px;align-items:center;justify-content:space-between;margin-top:26px;flex-wrap:wrap}
.ie-form__next{position:relative;overflow:hidden;min-height:50px;padding:0 26px;border:0;border-radius:999px;background:${color.gold};
  color:#1A1209;font:600 15px/1 ${font.body};cursor:pointer;box-shadow:0 0 26px rgba(217,180,106,.4)}
.ie-form__next:disabled{opacity:.6;cursor:progress}
.ie-form__next.is-busy::after{content:"";position:absolute;left:-30%;bottom:0;width:30%;height:2px;background:#FFF6E2;
  animation:ie-trace 1s linear infinite}
@keyframes ie-trace{to{left:100%}}
.ie-form__back{background:none;border:0;color:${color.moonstone};font:500 15px/1 ${font.body};cursor:pointer;min-height:44px;padding:0 4px}
.ie-form__next:focus-visible,.ie-form__back:focus-visible{outline:2px solid ${color.goldBright};outline-offset:3px}
.ie-form__fine{font-size:12px;color:${color.dim};margin:16px 0 0;line-height:1.5}
.ie-form__trap{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
@media (prefers-reduced-motion:reduce){.ie-form__next.is-busy::after{animation:none;left:0;width:100%}}
`

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function BookingForm(props: Props) {
    const {
        endpoint,
        serviceAreas,
        outsideMode,
        serviceRadius,
        sceneOptions,
        responseTime,
        phoneDisplay,
        heading,
        style,
    } = props
    const isEditor = RenderTarget.current() === RenderTarget.canvas
    const { reducedMotion } = useDeviceTier()
    const storeScene = useStore((s) => s.scene)
    const areas = useMemo(() => parseAreas(serviceAreas), [serviceAreas])

    const [step, setStep] = useState(0)
    const [f, setF] = useState<Fields>(EMPTY)
    const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
    const [photo, setPhoto] = useState<File | null>(null)
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "waitlisted">("idle")
    const [announce, setAnnounce] = useState("")
    const [trap, setTrap] = useState("")
    const formRef = useRef<HTMLFormElement>(null)

    // Restore a draft, then pre-fill the scene the visitor chose on the page.
    useEffect(() => {
        if (isEditor) return
        try {
            const raw = window.localStorage.getItem(DRAFT_KEY)
            if (raw) {
                const d = JSON.parse(raw)
                setF((cur) => ({ ...cur, ...d.fields }))
                if (typeof d.step === "number") setStep(Math.min(2, Math.max(0, d.step)))
            }
        } catch {}
    }, [isEditor])
    // Follow the scene picked on the page until the visitor changes the select themselves.
    const sceneTouched = useRef(false)
    useEffect(() => {
        if (storeScene && !sceneTouched.current) setF((cur) => ({ ...cur, scene: storeScene }))
    }, [storeScene])
    useEffect(() => {
        if (isEditor || status === "sent") return
        try {
            window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, fields: f }))
        } catch {}
    }, [f, step, status, isEditor])

    // The configured scenes, plus whatever the visitor picked on the page if it isn't listed.
    const scenes = useMemo(() => {
        const list = sceneOptions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        return f.scene && !list.includes(f.scene) ? [...list, f.scene] : list
    }, [sceneOptions, f.scene])

    const zipKnown = /^\d{5}$/.test(f.zip)
    const area = zipKnown ? findArea(areas, f.zip) : undefined
    const inArea = !zipKnown || areas.length === 0 || !!area
    const city = area?.label
    const waitlist = outsideMode === "waitlist" && zipKnown && !inArea

    const set = <K extends FieldName>(name: K, value: Fields[K]) => {
        setF((cur) => ({ ...cur, [name]: value }))
        if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }))
    }
    const blur = (name: FieldName) => setErrors((e) => ({ ...e, [name]: validate(name, f) }))

    const checkStep = (fields: FieldName[]) => {
        const next: Partial<Record<FieldName, string>> = {}
        fields.forEach((n) => (next[n] = validate(n, f)))
        setErrors((e) => ({ ...e, ...next }))
        const firstBad = fields.find((n) => next[n])
        if (firstBad) formRef.current?.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus()
        return !firstBad
    }

    const goTo = (n: number) => {
        setStep(n)
        setAnnounce(`Step ${n + 1} of 3: ${STEPS[n]}`)
        requestAnimationFrame(() =>
            formRef.current?.querySelector<HTMLElement>(".ie-form__step input, .ie-form__step select")?.focus(),
        )
    }

    const send = async (payload: Record<string, string>, withPhoto: boolean) => {
        if (trap) return true // bots fill the hidden field; pretend success
        if (!endpoint) {
            console.warn("BookingForm: set the Endpoint property to receive submissions.")
            return false
        }
        const data = new FormData()
        Object.entries(payload).forEach(([k, v]) => data.append(k, v))
        if (withPhoto && photo) data.append("photo", photo)
        try {
            const res = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
            return res.ok
        } catch {
            return false
        }
    }

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (status === "sending") return
        if (step < 2) {
            if (!checkStep(STEP_FIELDS[step])) return
            if (step === 0 && waitlist) return // the waitlist panel takes over
            goTo(step + 1)
            return
        }
        if (!checkStep(STEP_FIELDS[2])) return
        setStatus("sending")
        const ok = await send(
            {
                _subject: `Free design request · ${f.name.trim()} · ${city || f.zip}`,
                type: "free-design",
                street: f.street,
                zip: f.zip,
                city: city ?? "",
                in_service_area: areas.length === 0 ? "not checked" : inArea ? "yes" : "no, confirm",
                stories: f.stories,
                scene: f.scene,
                notes: f.notes,
                name: f.name,
                phone: f.phone,
                email: f.email,
                best_time: f.bestTime,
                ok_to_text: f.textOk ? "yes" : "no",
                page: typeof window !== "undefined" ? window.location.href : "",
            },
            true,
        )
        if (ok) {
            setStatus("sent")
            setAnnounce("Request sent.")
            try {
                window.localStorage.removeItem(DRAFT_KEY)
            } catch {}
            setState({ scene: f.scene || storeScene })
        } else {
            setStatus("error")
            setAnnounce("We couldn't send your request. Your details are saved; try again.")
        }
    }

    const joinWaitlist = async () => {
        const err = validate("waitlistEmail", f)
        setErrors((e) => ({ ...e, waitlistEmail: err }))
        if (err) return
        setStatus("sending")
        const ok = await send(
            { _subject: `Waitlist · ${f.zip}`, type: "waitlist", zip: f.zip, email: f.waitlistEmail },
            false,
        )
        setStatus(ok ? "waitlisted" : "error")
    }

    const field = (name: FieldName, label: string, input: ReactElement, hint?: string) => (
        <div className="ie-form__field">
            <label htmlFor={`ie-${name}`}>{label}</label>
            {hint ? <p className="ie-form__hint">{hint}</p> : null}
            {input}
            {errors[name] ? (
                <p id={`ie-${name}-err`} className="ie-form__error">
                    {errors[name]}
                </p>
            ) : null}
        </div>
    )
    const inputProps = (name: FieldName) => ({
        id: `ie-${name}`,
        name,
        "aria-invalid": errors[name] ? true : undefined,
        "aria-describedby": errors[name] ? `ie-${name}-err` : undefined,
        onBlur: () => blur(name),
    })

    const slide = reducedMotion
        ? {}
        : {
              initial: { opacity: 0, x: 24 },
              animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: ease.ignite } },
              exit: { opacity: 0, x: -24, transition: { duration: 0.25, ease: ease.fade } },
          }

    if (status === "sent" || status === "waitlisted") {
        return (
            <div className="ie-form" style={style} role="status">
                <style>{CSS}</style>
                <p style={{ ...monoLabel, color: color.success, margin: 0 }}>
                    ✓ {status === "sent" ? "Request sent" : "On the list"}
                </p>
                <h2 className="ie-form__title" style={{ marginTop: 12 }}>
                    {status === "sent" ? "You're booked in." : "We'll be in touch."}
                </h2>
                <p style={{ margin: "8px 0 0", lineHeight: 1.6 }}>
                    {status === "sent"
                        ? `We'll call within ${responseTime} to set a time for your design${f.scene ? `, and we'll bring ${f.scene} ideas` : ""}.`
                        : `We'll email ${f.waitlistEmail} as soon as we light homes in ${f.zip}.`}
                </p>
                {phoneDisplay ? (
                    <p className="ie-form__fine">
                        Questions sooner? Call or text{" "}
                        <strong style={{ color: color.moonstone, userSelect: "all" }}>{phoneDisplay}</strong>
                    </p>
                ) : null}
            </div>
        )
    }

    return (
        <form
            ref={formRef}
            className="ie-form"
            style={style}
            onSubmit={onSubmit}
            noValidate
            aria-labelledby="ie-form-title"
        >
            <style>{CSS}</style>
            <h2 id="ie-form-title" className="ie-form__title">
                {heading}
            </h2>
            <p style={{ ...monoLabel, margin: 0 }}>
                Step {step + 1} of 3 · {STEPS[step]}
            </p>
            <div className="ie-form__progress" aria-hidden="true">
                {STEPS.map((s, i) => (
                    <i key={s} className={i <= step ? "is-done" : ""} />
                ))}
            </div>
            <p className="ie-form__trap" aria-hidden="true">
                <label>
                    Company website
                    <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
                </label>
            </p>
            <span aria-live="polite" style={{ position: "absolute", left: -9999 }}>
                {announce}
            </span>

            <AnimatePresence mode="wait" initial={false}>
                <motion.div key={step} className="ie-form__step" {...slide}>
                    {step === 0 ? (
                        <>
                            {field(
                                "street",
                                "Street address",
                                <input
                                    type="text"
                                    autoComplete="street-address"
                                    value={f.street}
                                    onChange={(e) => set("street", e.target.value)}
                                    {...inputProps("street")}
                                />,
                            )}
                            {field(
                                "zip",
                                "ZIP code",
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="postal-code"
                                    maxLength={5}
                                    value={f.zip}
                                    onChange={(e) => set("zip", e.target.value.replace(/\D/g, "").slice(0, 5))}
                                    {...inputProps("zip")}
                                />,
                            )}
                            {zipKnown && inArea && areas.length > 0 ? (
                                <p className="ie-form__ok" role="status">
                                    ✓ Great, we light homes in {city || "your area"}.
                                </p>
                            ) : null}
                            {zipKnown && !inArea && !waitlist ? (
                                <p className="ie-form__hint" role="status" style={{ color: color.moonstone }}>
                                    {f.zip} may be just outside our usual area ({serviceRadius}). Continue anyway and
                                    we'll confirm we can reach you.
                                </p>
                            ) : null}
                            {waitlist ? (
                                <div className="ie-form__field" role="status">
                                    <p className="ie-form__hint" style={{ color: color.moonstone }}>
                                        We're not in {f.zip} yet. Leave your email and we'll tell you when we are.
                                    </p>
                                    {field(
                                        "waitlistEmail",
                                        "Email",
                                        <input
                                            type="email"
                                            autoComplete="email"
                                            value={f.waitlistEmail}
                                            onChange={(e) => set("waitlistEmail", e.target.value)}
                                            {...inputProps("waitlistEmail")}
                                        />,
                                    )}
                                    <button
                                        type="button"
                                        className="ie-form__next"
                                        onClick={joinWaitlist}
                                        disabled={status === "sending"}
                                    >
                                        Notify me
                                    </button>
                                </div>
                            ) : null}
                        </>
                    ) : null}

                    {step === 1 ? (
                        <>
                            <fieldset aria-describedby={errors.stories ? "ie-stories-err" : undefined}>
                                <legend>How many stories?</legend>
                                <div className="ie-form__options">
                                    {["1", "2", "3+"].map((v) => (
                                        <label key={v} className="ie-form__option">
                                            <input
                                                type="radio"
                                                name="stories"
                                                value={v}
                                                checked={f.stories === v}
                                                onChange={() => set("stories", v)}
                                            />
                                            <span>{v === "3+" ? "3 or more" : v}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.stories ? (
                                    <p id="ie-stories-err" className="ie-form__error">
                                        {errors.stories}
                                    </p>
                                ) : null}
                            </fieldset>
                            {field(
                                "scene",
                                "First scene you'd like to see",
                                <select
                                    value={f.scene}
                                    onChange={(e) => {
                                        sceneTouched.current = true
                                        set("scene", e.target.value)
                                    }}
                                    {...inputProps("scene")}
                                >
                                    <option value="">Not sure yet</option>
                                    {scenes.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>,
                            )}
                            <div className="ie-form__field">
                                <label htmlFor="ie-photo">Photo of the front of your home (optional)</label>
                                <p className="ie-form__hint">Helps us sketch your design before we visit.</p>
                                <input
                                    id="ie-photo"
                                    name="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] ?? null
                                        setPhoto(file && file.size <= 10 * 1024 * 1024 ? file : null)
                                    }}
                                />
                                {photo ? <p className="ie-form__ok">✓ {photo.name}</p> : null}
                            </div>
                            {field(
                                "notes",
                                "Anything we should know? (optional)",
                                <textarea
                                    value={f.notes}
                                    onChange={(e) => set("notes", e.target.value)}
                                    {...inputProps("notes")}
                                />,
                            )}
                        </>
                    ) : null}

                    {step === 2 ? (
                        <>
                            {field(
                                "name",
                                "Name",
                                <input
                                    type="text"
                                    autoComplete="name"
                                    value={f.name}
                                    onChange={(e) => set("name", e.target.value)}
                                    {...inputProps("name")}
                                />,
                            )}
                            {field(
                                "phone",
                                "Phone",
                                <input
                                    type="tel"
                                    autoComplete="tel"
                                    value={f.phone}
                                    onChange={(e) => set("phone", formatPhone(e.target.value))}
                                    {...inputProps("phone")}
                                />,
                            )}
                            {field(
                                "email",
                                "Email",
                                <input
                                    type="email"
                                    autoComplete="email"
                                    value={f.email}
                                    onChange={(e) => set("email", e.target.value)}
                                    {...inputProps("email")}
                                />,
                            )}
                            <fieldset>
                                <legend>Best time for a design visit</legend>
                                <div className="ie-form__options">
                                    {["Weekday evening", "Weekend", "Anytime"].map((v) => (
                                        <label key={v} className="ie-form__option">
                                            <input
                                                type="radio"
                                                name="bestTime"
                                                value={v}
                                                checked={f.bestTime === v}
                                                onChange={() => set("bestTime", v)}
                                            />
                                            <span>{v}</span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                            <label className="ie-form__check">
                                <input
                                    type="checkbox"
                                    checked={f.textOk}
                                    onChange={(e) => set("textOk", e.target.checked)}
                                />
                                Text me about my design. Message and data rates may apply; reply STOP to opt out.
                            </label>
                        </>
                    ) : null}
                </motion.div>
            </AnimatePresence>

            {status === "error" ? (
                <p className="ie-form__error" role="alert" style={{ marginTop: 18 }}>
                    We couldn't send your request. Your details are saved; press Send again
                    {phoneDisplay ? `, or call ${phoneDisplay}` : ""}.
                </p>
            ) : null}

            <div className="ie-form__actions">
                {step > 0 ? (
                    <button type="button" className="ie-form__back" onClick={() => goTo(step - 1)}>
                        ← Back
                    </button>
                ) : (
                    <span />
                )}
                {step === 0 && waitlist ? null : (
                    <button
                        type="submit"
                        className={`ie-form__next${status === "sending" ? " is-busy" : ""}`}
                        disabled={status === "sending"}
                    >
                        {step < 2 ? "Continue" : status === "sending" ? "Sending…" : "Send my request"}
                    </button>
                )}
            </div>
            <p className="ie-form__fine">Free and no obligation. We use your details only to plan your design.</p>
        </form>
    )
}

BookingForm.defaultProps = {
    endpoint: "",
    serviceAreas:
        "680* Omaha metro\n681* Omaha\n683* Southeast Nebraska\n684* Lincoln area\n685* Lincoln\n515* Southwest Iowa",
    outsideMode: "confirm",
    serviceRadius: "within 50 miles of Omaha and Elkhorn",
    sceneOptions: "Everyday, Red & White Game Day, Blue & White Game Day, Birthday, July 4th, Halloween, Christmas",
    responseTime: "one business day",
    phoneDisplay: "402-699-6256",
    heading: "Your home, after dark. Let's design it.",
}

addPropertyControls(BookingForm, {
    heading: { type: ControlType.String, title: "Heading" },
    endpoint: {
        type: ControlType.String,
        title: "Endpoint",
        placeholder: "https://formsubmit.co/ajax/you@example.com",
        description: "POST URL that accepts multipart form data. FormSubmit's AJAX URL emails each request.",
    },
    serviceAreas: {
        type: ControlType.String,
        title: "Service ZIPs",
        displayTextArea: true,
        placeholder: "68022 Elkhorn\n680* Omaha metro",
        description: "One per line: a ZIP or a prefix ending in *. Empty accepts every ZIP.",
    },
    outsideMode: {
        type: ControlType.Enum,
        title: "Outside area",
        options: ["confirm", "waitlist"],
        optionTitles: ["Send anyway", "Waitlist"],
    },
    serviceRadius: { type: ControlType.String, title: "Area wording" },
    sceneOptions: { type: ControlType.String, title: "Scenes", displayTextArea: true },
    responseTime: { type: ControlType.String, title: "Reply within" },
    phoneDisplay: { type: ControlType.String, title: "Phone" },
})
