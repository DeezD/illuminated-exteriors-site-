// Loads an image sequence progressively and draws it to a canvas.
// Presentation-free: ScrollVideoHero owns layout and scroll.
//
// Load order is coarse-to-fine (first, last, then every 64th, 32nd ... frame),
// so scrubbing works within a second on a slow connection and sharpens as the
// rest of the frames arrive.

export function frameUrl(pattern: string, index: number, pad: number): string {
    // Frames are numbered from 1, matching ffmpeg's default output (%04d).
    return pattern.replace("{n}", String(index + 1).padStart(pad, "0"))
}

export function progressiveOrder(count: number): number[] {
    const order: number[] = []
    const seen = new Uint8Array(count)
    const push = (i: number) => {
        if (i >= 0 && i < count && !seen[i]) {
            seen[i] = 1
            order.push(i)
        }
    }
    push(0)
    push(count - 1)
    let stride = 1
    while (stride * 2 < count) stride *= 2
    for (; stride >= 1; stride = stride / 2) {
        for (let i = 0; i < count; i += stride) push(i)
        if (stride === 1) break
    }
    return order
}

// Where frames come from. Either a URL pattern ("…/{n}.webp", one file per
// frame) or a few "frame packs" (scripts/make-packs.py) uploaded to Framer, so the
// whole film lives inside the Framer project with nothing hosted elsewhere.
// `tier(i)` is 0 for the coarse set (every 8th frame and the last), which is
// enough to play the intro with blending; the rest (tier 1) can wait for a scroll.
export type FrameSource = { count: number; blob(index: number): Promise<Blob>; tier(index: number): number; dispose(): void }

const coarse = (i: number, count: number) => i % 8 === 0 || i === count - 1

export function patternSource(pattern: string, count: number, pad: number): FrameSource {
    return {
        count,
        blob: (i) =>
            fetch(frameUrl(pattern, i, pad)).then((r) => {
                if (!r.ok) throw new Error(`frame ${i + 1}: HTTP ${r.status}`)
                return r.blob()
            }),
        tier: (i) => (coarse(i, count) ? 0 : 1),
        dispose() {},
    }
}

// Must match layout() in scripts/make-packs.py: pack 0 holds every 8th frame and
// the last; the remaining frames are split into equal runs across the other packs.
export function packLayout(count: number, packs: number): number[] {
    const owner = new Array(count).fill(0)
    const rest: number[] = []
    for (let i = 0; i < count; i++) if (!coarse(i, count)) rest.push(i)
    const runs = packs - 1
    const size = runs ? Math.ceil(rest.length / runs) : 0
    rest.forEach((i, k) => (owner[i] = 1 + Math.floor(k / size)))
    return owner
}

export function packSource(packUrls: string[], count: number): FrameSource {
    const owner = packLayout(count, packUrls.length)
    const loaded = new Map<number, Promise<Map<number, Blob>>>()

    const loadPack = (p: number) => {
        let pending = loaded.get(p)
        if (!pending) {
            pending = fetch(packUrls[p])
                .then((r) => {
                    if (!r.ok) throw new Error(`frame pack ${p + 1}: HTTP ${r.status}`)
                    return r.arrayBuffer()
                })
                .then((buf) => {
                    const view = new DataView(buf)
                    const magic = String.fromCharCode(...new Uint8Array(buf, 0, 4))
                    if (magic !== "IEFP") throw new Error(`frame pack ${p + 1}: not a frame pack`)
                    const headerLength = view.getUint32(4, true)
                    const header = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, headerLength)))
                    const base = 8 + headerLength
                    const blobs = new Map<number, Blob>()
                    for (const [index, offset, length] of header.frames as [number, number, number][]) {
                        blobs.set(index, new Blob([new Uint8Array(buf, base + offset, length)], { type: header.type }))
                    }
                    return blobs
                })
            loaded.set(p, pending)
            pending.catch(() => loaded.delete(p)) // allow a retry on the next request
        }
        return pending
    }

    return {
        count,
        async blob(i) {
            const blobs = await loadPack(owner[i] ?? 0)
            const b = blobs.get(i)
            if (!b) throw new Error(`frame ${i + 1} missing from pack ${owner[i] + 1}`)
            return b
        },
        tier: (i) => (owner[i] ? 1 : 0),
        dispose() {
            loaded.clear()
        },
    }
}

// A drawable frame: a decoded ImageBitmap (or <img> where createImageBitmap is missing).
export type Frame = { source: CanvasImageSource; width: number; height: number }

const decodeBlob = async (blob: Blob, width?: number): Promise<CanvasImageSource & { width: number; height: number }> => {
    if (typeof createImageBitmap === "function") {
        return width ? createImageBitmap(blob, { resizeWidth: width, resizeQuality: "medium" }) : createImageBitmap(blob)
    }
    const img = new Image()
    img.src = URL.createObjectURL(blob)
    await img.decode()
    return img
}
const release = (f: { source: CanvasImageSource }) => {
    const s = f.source as ImageBitmap | HTMLImageElement
    if ("close" in s) s.close()
    else if (s.src?.startsWith("blob:")) URL.revokeObjectURL(s.src)
}

// Memory model: every frame is kept compressed (a WebP blob, tens of KB). Only a
// window around the scroll position is decoded at full size, plus a small
// quarter-size copy of every coarse frame, so a fast fling always has something
// to draw. Decoded memory stays roughly (window + coarse/16) frames.
export class FrameSequence {
    private blobs: (Blob | null)[]
    private settled: Uint8Array
    private full = new Map<number, Frame>()
    private thumbs = new Map<number, Frame>()
    private pending = new Set<number>()
    private queue: number[] = []
    private waiting: number[] = [] // tier-1 frames held back until expand()
    private workers = 0
    private cancelled = false
    private focusIndex = 0
    loadedCount = 0 // frames whose compressed data has arrived
    settledCount = 0 // arrived or failed
    onFrameLoaded: ((index: number) => void) | null = null

    readonly count: number

    constructor(
        private source: FrameSource,
        private concurrency = 6,
        // A decoded 1280x720 frame is ~3.7 MB, so only this many stay decoded.
        private maxBitmaps = 60,
        private thumbWidth = 320,
    ) {
        this.count = source.count
        this.blobs = new Array(this.count).fill(null)
        this.settled = new Uint8Array(this.count)
    }

    // lazy: fetch only the coarse set now; the rest waits for expand().
    start(lazy = false) {
        const order = progressiveOrder(this.count)
        this.queue = lazy ? order.filter((i) => this.source.tier(i) === 0) : order
        this.waiting = lazy ? order.filter((i) => this.source.tier(i) !== 0) : []
        this.pump()
    }

    expand() {
        if (!this.waiting.length) return
        this.queue.push(...this.waiting)
        this.waiting = []
        this.sortQueue()
        this.pump()
    }

    private pump() {
        while (this.workers < this.concurrency && this.queue.length && !this.cancelled) {
            this.workers++
            this.worker().finally(() => this.workers--)
        }
    }

    private async worker() {
        while (this.queue.length && !this.cancelled) {
            const i = this.queue.shift() as number
            let blob: Blob | null = null
            try {
                blob = await this.source.blob(i)
            } catch {
                // a missing frame falls back to its nearest neighbour
            }
            if (this.cancelled) return
            this.settled[i] = 1
            this.settledCount++
            if (!blob) continue
            this.blobs[i] = blob
            this.loadedCount++
            if (this.inWindow(i)) this.decode(i)
            else if (this.source.tier(i) === 0) this.decodeThumb(i)
        }
    }

    get done() {
        return this.settledCount >= this.count
    }

    private inWindow(i: number) {
        return Math.abs(i - this.focusIndex) <= this.maxBitmaps / 2
    }

    private decode(i: number) {
        const blob = this.blobs[i]
        if (!blob || this.full.has(i) || this.pending.has(i)) return
        this.pending.add(i)
        decodeBlob(blob)
            .then((src) => {
                this.pending.delete(i)
                const f = { source: src, width: src.width, height: src.height }
                if (this.cancelled || !this.inWindow(i)) {
                    release(f)
                    if (!this.cancelled && this.source.tier(i) === 0) this.decodeThumb(i)
                    return
                }
                this.full.set(i, f)
                this.onFrameLoaded?.(i)
            })
            .catch(() => this.pending.delete(i))
    }

    private decodeThumb(i: number) {
        const blob = this.blobs[i]
        if (!blob || this.thumbs.has(i)) return
        this.thumbs.set(i, null as unknown as Frame) // reserve
        decodeBlob(blob, this.thumbWidth)
            .then((src) => {
                const f = { source: src, width: src.width, height: src.height }
                if (this.cancelled) return release(f)
                this.thumbs.set(i, f)
                this.onFrameLoaded?.(i)
            })
            .catch(() => this.thumbs.delete(i))
    }

    private sortQueue() {
        const at = this.focusIndex
        this.queue.sort((a, b) => Math.abs(a - at) - Math.abs(b - at))
    }

    // Fetch and decode the frames around `index` next, and release decoded frames
    // that have left the window. Only acts when the focus moves a few frames.
    focus(index: number) {
        if (Math.abs(index - this.focusIndex) < 4 && this.full.size) return
        this.focusIndex = index
        if (this.queue.length) this.sortQueue()
        this.full.forEach((f, i) => {
            if (!this.inWindow(i)) {
                release(f)
                this.full.delete(i)
                if (this.source.tier(i) === 0) this.decodeThumb(i)
            }
        })
        const half = this.maxBitmaps / 2
        for (let d = 0; d <= half; d++) {
            if (index + d < this.count) this.decode(index + d)
            if (d && index - d >= 0) this.decode(index - d)
        }
    }

    cancel() {
        this.cancelled = true
        this.full.forEach(release)
        this.thumbs.forEach((f) => f && release(f))
        this.full.clear()
        this.thumbs.clear()
        this.blobs.fill(null)
        this.source.dispose()
    }

    get(index: number): Frame | null {
        return this.full.get(index) ?? null
    }

    // The closest full-size frame, else the closest quarter-size coarse frame.
    nearest(index: number): Frame | null {
        const exact = this.get(index)
        if (exact) return exact
        const half = this.maxBitmaps / 2
        for (let d = 1; d <= half; d++) {
            const a = this.get(index - d) ?? this.get(index + d)
            if (a && d <= 4) return a
            if (a) break
        }
        let best: Frame | null = null
        let bestD = Infinity
        this.thumbs.forEach((f, i) => {
            const d = Math.abs(i - index)
            if (f && d < bestD) {
                best = f
                bestD = d
            }
        })
        if (best) return best
        for (let d = 1; d < this.count; d++) {
            const a = this.get(index - d) ?? this.get(index + d)
            if (a) return a
        }
        return null
    }
}

// Draws a frame to fill the canvas like CSS object-fit: cover, anchored by focusX/Y (0-1).
export function drawCover(
    ctx: CanvasRenderingContext2D,
    frame: Frame,
    w: number,
    h: number,
    focusX = 0.5,
    focusY = 0.5,
) {
    const scale = Math.max(w / frame.width, h / frame.height)
    const dw = frame.width * scale
    const dh = frame.height * scale
    ctx.drawImage(frame.source, (w - dw) * focusX, (h - dh) * focusY, dw, dh)
}
