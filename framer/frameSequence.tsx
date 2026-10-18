// Loads an image sequence progressively and draws the nearest available frame
// to a canvas. Presentation-free: ScrollVideoHero owns layout and scroll.
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

export class FrameSequence {
    private images: (HTMLImageElement | null)[]
    private cancelled = false
    loadedCount = 0
    onFrameLoaded: ((index: number) => void) | null = null

    constructor(
        private pattern: string,
        readonly count: number,
        private pad: number,
        private concurrency = 6,
    ) {
        this.images = new Array(count).fill(null)
    }

    start() {
        const queue = progressiveOrder(this.count)
        const worker = async () => {
            while (queue.length && !this.cancelled) {
                const i = queue.shift() as number
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
                this.onFrameLoaded?.(i)
            }
        }
        for (let k = 0; k < this.concurrency; k++) worker()
    }

    cancel() {
        this.cancelled = true
    }

    nearest(index: number): HTMLImageElement | null {
        if (this.images[index]) return this.images[index]
        for (let d = 1; d < this.count; d++) {
            const a = this.images[index - d]
            if (a) return a
            const b = this.images[index + d]
            if (b) return b
        }
        return null
    }
}

// Draws `img` to fill the canvas like CSS object-fit: cover, anchored by focusX/Y (0-1).
export function drawCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    w: number,
    h: number,
    focusX = 0.5,
    focusY = 0.5,
) {
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
    const dw = img.naturalWidth * scale
    const dh = img.naturalHeight * scale
    ctx.drawImage(img, (w - dw) * focusX, (h - dh) * focusY, dw, dh)
}
