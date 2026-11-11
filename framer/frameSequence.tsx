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
export type FrameSource = { count: number; url(index: number): Promise<string>; dispose(): void }

export function patternSource(pattern: string, count: number, pad: number): FrameSource {
    return { count, url: async (i) => frameUrl(pattern, i, pad), dispose() {} }
}

// Must match layout() in scripts/make-packs.py: pack 0 holds every 8th frame and
// the last; the remaining frames are split into equal runs across the other packs.
export function packLayout(count: number, packs: number): number[] {
    const owner = new Array(count).fill(0)
    const rest: number[] = []
    for (let i = 0; i < count; i++) if (!(i % 8 === 0 || i === count - 1)) rest.push(i)
    const runs = packs - 1
    const size = runs ? Math.ceil(rest.length / runs) : 0
    rest.forEach((i, k) => (owner[i] = 1 + Math.floor(k / size)))
    return owner
}

export function packSource(packUrls: string[], count: number): FrameSource {
    const owner = packLayout(count, packUrls.length)
    const loaded = new Map<number, Promise<Map<number, string>>>()
    const objectUrls: string[] = []

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
                    const urls = new Map<number, string>()
                    for (const [index, offset, length] of header.frames as [number, number, number][]) {
                        const blob = new Blob([new Uint8Array(buf, base + offset, length)], { type: header.type })
                        const u = URL.createObjectURL(blob)
                        objectUrls.push(u)
                        urls.set(index, u)
                    }
                    return urls
                })
            loaded.set(p, pending)
            pending.catch(() => loaded.delete(p)) // allow a retry on the next request
        }
        return pending
    }

    return {
        count,
        async url(i) {
            const urls = await loadPack(owner[i] ?? 0)
            const u = urls.get(i)
            if (!u) throw new Error(`frame ${i + 1} missing from pack ${owner[i] + 1}`)
            return u
        },
        dispose() {
            objectUrls.forEach((u) => URL.revokeObjectURL(u))
        },
    }
}

// A drawable frame: a pre-decoded ImageBitmap near the scroll position (so
// drawing never stalls, which matters most in Safari), otherwise the <img>.
export type Frame = { source: CanvasImageSource; width: number; height: number }

export class FrameSequence {
    private images: (HTMLImageElement | null)[]
    private bitmaps = new Map<number, ImageBitmap>()
    private pendingBitmaps = new Set<number>()
    private queue: number[] = []
    private cancelled = false
    private focusIndex = -1
    loadedCount = 0
    onFrameLoaded: ((index: number) => void) | null = null

    readonly count: number

    constructor(
        private source: FrameSource,
        private concurrency = 6,
        // Decoded bitmaps are big (a 1280x720 frame is ~3.7 MB), so only a window
        // around the scroll position is kept decoded; the rest stay compressed.
        private maxBitmaps = 60,
    ) {
        this.count = source.count
        this.images = new Array(this.count).fill(null)
    }

    start() {
        this.queue = progressiveOrder(this.count)
        const worker = async () => {
            while (this.queue.length && !this.cancelled) {
                const i = this.queue.shift() as number
                const img = new Image()
                img.decoding = "async"
                try {
                    img.src = await this.source.url(i)
                    await img.decode()
                } catch {
                    continue // a missing frame falls back to its nearest neighbour
                }
                if (this.cancelled) return
                this.images[i] = img
                this.loadedCount++
                if (Math.abs(i - this.focusIndex) <= this.maxBitmaps / 2) this.decode(i)
                this.onFrameLoaded?.(i)
            }
        }
        for (let k = 0; k < this.concurrency; k++) worker()
    }

    private decode(i: number) {
        const img = this.images[i]
        if (!img || this.bitmaps.has(i) || this.pendingBitmaps.has(i) || typeof createImageBitmap !== "function") return
        this.pendingBitmaps.add(i)
        createImageBitmap(img)
            .then((bmp) => {
                this.pendingBitmaps.delete(i)
                if (this.cancelled || Math.abs(i - this.focusIndex) > this.maxBitmaps / 2) return bmp.close()
                this.bitmaps.set(i, bmp)
                this.onFrameLoaded?.(i)
            })
            .catch(() => this.pendingBitmaps.delete(i))
    }

    // Load and decode the frames around `index` next, and release decoded frames
    // that have fallen out of the window. Only acts when the focus moves a few frames.
    focus(index: number) {
        if (Math.abs(index - this.focusIndex) < 4) return
        this.focusIndex = index
        if (this.queue.length) this.queue.sort((a, b) => Math.abs(a - index) - Math.abs(b - index))
        const half = this.maxBitmaps / 2
        this.bitmaps.forEach((bmp, i) => {
            if (Math.abs(i - index) > half) {
                bmp.close()
                this.bitmaps.delete(i)
            }
        })
        for (let d = 0; d <= half; d++) {
            if (index + d < this.count) this.decode(index + d)
            if (d && index - d >= 0) this.decode(index - d)
        }
    }

    cancel() {
        this.cancelled = true
        this.bitmaps.forEach((bmp) => bmp.close())
        this.bitmaps.clear()
        this.source.dispose()
    }

    get(index: number): Frame | null {
        const bmp = this.bitmaps.get(index)
        if (bmp) return { source: bmp, width: bmp.width, height: bmp.height }
        const img = this.images[index]
        return img ? { source: img, width: img.naturalWidth, height: img.naturalHeight } : null
    }

    nearest(index: number): Frame | null {
        const exact = this.get(index)
        if (exact) return exact
        for (let d = 1; d < this.count; d++) {
            const a = index - d >= 0 ? this.get(index - d) : null
            if (a) return a
            const b = index + d < this.count ? this.get(index + d) : null
            if (b) return b
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
