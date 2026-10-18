// Design and motion tokens shared by every Illuminated Exteriors code component.
// Colors mirror the Framer color styles set up in README.md; keep the two in sync.

import type { CSSProperties } from "react"

export const color = {
    night: "#05070B", // canvas, matches the current site's black
    blueHour: "#0E1626", // raised surfaces
    dome: "#1E3A6E", // logo sky
    exteriors: "#4AA3FF", // "EXTERIORS" wordmark blue: labels, day/night control
    gold: "#D9B46A", // "ILLUMINATED" wordmark gold: primary CTA, the Light Line
    goldBright: "#F2D59A", // hover glow, emphasis text
    moonstone: "#C9D1D9", // body text
    dim: "#7D8794", // secondary text, mono labels
    line: "rgba(201, 209, 217, 0.16)", // hairlines, resting outlines
    amber: "#F0A04B", // form warnings (never red flashes)
    success: "#7FD6A4",
} as const

export const font = {
    display: '"Instrument Serif", "Times New Roman", Georgia, serif',
    body: '"Montserrat", "Helvetica Neue", Arial, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace',
} as const

// "Lightfall" motion language: quick to ignite, slow to settle.
export const ease = {
    ignite: [0.16, 1, 0.3, 1] as const,
    dusk: [0.65, 0, 0.35, 1] as const,
    switch: [0.2, 0, 0, 1] as const,
    fade: [0.4, 0, 1, 1] as const,
}
export const cssEase = {
    ignite: "cubic-bezier(0.16, 1, 0.3, 1)",
    dusk: "cubic-bezier(0.65, 0, 0.35, 1)",
    switch: "cubic-bezier(0.2, 0, 0, 1)",
    fade: "cubic-bezier(0.4, 0, 1, 1)",
}

// Seconds, for framer-motion transitions.
export const dur = {
    tap: 0.12,
    quick: 0.25,
    base: 0.4,
    reveal: 0.8,
    scene: 1.2,
    cinema: 2.4,
}

export const space = { rise: 24, riseMobile: 16, staggerLine: 0.09, staggerItem: 0.04 }

export const focusRing = `0 0 0 2px ${color.night}, 0 0 0 4px ${color.goldBright}`

export const monoLabel: CSSProperties = {
    fontFamily: font.mono,
    fontSize: 11.5,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: color.dim,
}
