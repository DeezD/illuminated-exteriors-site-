// The always-available "Pause motion" control (WCAG 2.2.2). Freezes scene loops,
// the cursor halo, magnetism and the hero intro; the choice is remembered.

import type { CSSProperties } from "react"
import { addPropertyControls, ControlType } from "framer"
import { color, font } from "./tokens.tsx"
import { useStore, setState } from "./store.tsx"

type Props = { pauseLabel: string; playLabel: string; style?: CSSProperties }

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function MotionToggle({ pauseLabel, playLabel, style }: Props) {
    const paused = useStore((s) => s.motionPaused)
    return (
        <>
            <style>{`.ie-motion-toggle:focus-visible{outline:2px solid ${color.goldBright};outline-offset:3px}`}</style>
            <button
                type="button"
                aria-pressed={paused}
                onClick={() => setState({ motionPaused: !paused })}
                className="ie-motion-toggle"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    minHeight: 44,
                    padding: "0 14px",
                    borderRadius: 999,
                    border: `1px solid ${color.line}`,
                    background: "rgba(5,7,11,.6)",
                    color: color.moonstone,
                    font: `500 11.5px/1 ${font.mono}`,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    ...style,
                }}
            >
                <span aria-hidden="true" style={{ fontSize: 12 }}>
                    {paused ? "▶" : "❚❚"}
                </span>
                {paused ? playLabel : pauseLabel}
            </button>
        </>
    )
}

MotionToggle.defaultProps = { pauseLabel: "Pause motion", playLabel: "Play motion" }

addPropertyControls(MotionToggle, {
    pauseLabel: { type: ControlType.String, title: "Pause label" },
    playLabel: { type: ControlType.String, title: "Play label" },
})
