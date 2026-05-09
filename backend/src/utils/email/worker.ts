import { processNextBatch } from "./queue.service.js"

let started = false
let timer: NodeJS.Timeout | null = null

export function startEmailWorker(intervalMs = 5_000): void {
    if (started) return
    started = true

    const tick = async () => {
        try {
            await processNextBatch()
        } catch (err) {
            console.error("[email-worker] tick failed:", err)
        }
    }

    timer = setInterval(tick, intervalMs)
    timer.unref()
    console.log(`[email-worker] started (every ${intervalMs}ms)`)

    void tick()
}

export function stopEmailWorker(): void {
    if (timer) {
        clearInterval(timer)
        timer = null
    }
    started = false
}
