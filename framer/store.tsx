// Tiny shared state for code components on the same page: the visitor's chosen
// lighting scene (carried into the CTA and the booking form) and the global
// "pause motion" preference. No dependencies; components subscribe with useStore.

import { useSyncExternalStore } from "react"

export type SiteState = {
    scene: string | null // label of the scene the visitor picked, e.g. "Game Day"
    interacted: boolean // true once the visitor has changed a scene themselves
    motionPaused: boolean // the always-visible Pause motion control
}

const STORAGE_KEY = "ie-site-state"
const listeners = new Set<() => void>()

function load(): SiteState {
    const base: SiteState = { scene: null, interacted: false, motionPaused: false }
    try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY)
        const paused = window.localStorage.getItem(STORAGE_KEY + "-paused") === "1"
        return { ...base, ...(raw ? JSON.parse(raw) : {}), motionPaused: paused }
    } catch {
        return base
    }
}

let state: SiteState = typeof window === "undefined" ? { scene: null, interacted: false, motionPaused: false } : load()

export function getState(): SiteState {
    return state
}

export function setState(patch: Partial<SiteState>) {
    state = { ...state, ...patch }
    try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ scene: state.scene, interacted: state.interacted }))
        window.localStorage.setItem(STORAGE_KEY + "-paused", state.motionPaused ? "1" : "0")
    } catch {
        // Storage can be blocked (private mode); state still works for this page view.
    }
    listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

export function useStore<T>(selector: (s: SiteState) => T): T {
    return useSyncExternalStore(
        subscribe,
        () => selector(state),
        () => selector({ scene: null, interacted: false, motionPaused: false }),
    )
}
