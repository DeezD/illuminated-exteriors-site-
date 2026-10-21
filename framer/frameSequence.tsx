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

// A decoded frame. ImageBitmap where supported (decoded once, so drawing never
// stalls the main thread, which matters most in Safari), otherwise the <img>.
export type Frame = { source: CanvasImageSource; width: number; height: number }

export class FrameSequence {
    private frames: (Frame | null)[]
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
    ) {
        this.frames = new Array(count).fill(null)
    }

    start() {
        this.queue = progressiveOrder(this.count)
        const worker = async () => {
            while (this.queue.length && !this.cancelled) {
                const i = this.queue.shift() as number
                const frame = await this.load(i)
                if (this.cancelled) return
                if (!frame) continue // a missing frame falls back to its nearest neighbour
                this.frames[i] = frame
                this.loadedCount++
                this.onFrameLoaded?.(i)
            }
        }
        for (let k = 0; k < this.concurrency; k++) worker()
    }

    private async load(i: number): Promise<Frame | null> {
        const img = new Image()
        img.decoding = "async"
        img.src = frameUrl(this.pattern, i, this.pad)
        try {
            await img.decode()
        } catch {
            return null
        }
        if (typeof createImageBitmap === "function") {
            try {
                const bmp = await createImageBitmap(img)
                return { source: bmp, width: bmp.width, height: bmp.height }
            } catch {
                // fall through to the <img>
            }
        }
        return { source: img, width: img.naturalWidth, height: img.naturalHeight }
    }

    // Load the frames around `index` next, so the part of the film the visitor is
    // looking at sharpens first. Only re-sorts when the focus moves a few frames.
    focus(index: number) {
        if (Math.abs(index - this.focusIndex) < 6 || !this.queue.length) return
        this.focusIndex = index
        this.queue.sort((a, b) => Math.abs(a - index) - Math.abs(b - index))
    }

    cancel() {
        this.cancelled = true
        this.frames.forEach((f) => {
            if (f && "close" in f.source) (f.source as ImageBitmap).close()
        })
    }

    get(index: number): Frame | null {
        return this.frames[index] ?? null
    }

    nearest(index: number): Frame | null {
        if (this.frames[index]) return this.frames[index]
        for (let d = 1; d < this.count; d++) {
            const a = this.frames[index - d]
            if (a) return a
            const b = this.frames[index + d]
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
