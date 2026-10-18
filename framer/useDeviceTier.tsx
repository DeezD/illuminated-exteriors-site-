// Decides how rich each component may be on this device.
//   high   - desktop-class: full frame sequence, cursor halo, magnetism
//   medium - tablets and phones: lighter frame set, touch alternatives
//   low    - Save-Data, slow network or very low memory: poster images only
//   still  - prefers-reduced-motion: no scrubbing or camera motion, final frames only

import { useEffect, useState } from "react"

export type Tier = "high" | "medium" | "low" | "still"

export type DeviceInfo = {
    tier: Tier
    finePointer: boolean // mouse or trackpad with real hover
    reducedMotion: boolean
    narrow: boolean // under 810px, Framer's tablet breakpoint
}

const SSR_DEFAULT: DeviceInfo = { tier: "medium", finePointer: false, reducedMotion: false, narrow: false }

function detect(): DeviceInfo {
    const mq = (q: string) => window.matchMedia(q).matches
    const reducedMotion = mq("(prefers-reduced-motion: reduce)")
    const finePointer = mq("(hover: hover) and (pointer: fine)")
    const narrow = mq("(max-width: 809px)")

    const nav = navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string }
        deviceMemory?: number
    }
    const saveData = !!nav.connection?.saveData
    const slowNet = /(^|-)2g|3g/.test(nav.connection?.effectiveType ?? "")
    const lowMemory = (nav.deviceMemory ?? 8) <= 2
    const fewCores = (navigator.hardwareConcurrency ?? 8) <= 2

    let tier: Tier = finePointer && !narrow ? "high" : "medium"
    if (saveData || slowNet || lowMemory || fewCores) tier = "low"
    if (reducedMotion) tier = "still"
    return { tier, finePointer, reducedMotion, narrow }
}

export function useDeviceTier(): DeviceInfo {
    const [info, setInfo] = useState<DeviceInfo>(SSR_DEFAULT)
    useEffect(() => {
        const update = () => setInfo(detect())
        update()
        const queries = [
            "(prefers-reduced-motion: reduce)",
            "(hover: hover) and (pointer: fine)",
            "(max-width: 809px)",
        ].map((q) => window.matchMedia(q))
        queries.forEach((q) => q.addEventListener("change", update))
        return () => queries.forEach((q) => q.removeEventListener("change", update))
    }, [])
    return info
}
