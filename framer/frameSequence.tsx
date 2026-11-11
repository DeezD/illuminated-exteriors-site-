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

    constructor(
        private pattern: string,
        readonly count: number,
        private pad: number,
        private concurrency = 6,
        // Decoded bitmaps are big (a 1280x720 frame is ~3.7 MB), so only a window
        // around the scroll position is kept decoded; the rest stay compressed.
        private maxBitmaps = 60,
    ) {
        this.images = new Array(count).fill(null)
    }

    start() {
        this.queue = progressiveOrder(this.count)
        const worker = async () => {
            while (this.queue.length && !this.cancelled) {
                const i = this.queue.shift() as number
                const img = new Image()
                img.decoding = "async"
                img.src = frameUrl(this.pattern, i, this.pad)
                try {
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
