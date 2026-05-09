import { pool } from "../../config/dbConnect.js"
import { sendEmailNow, type EmailMessage } from "./sender.js"

const MAX_ATTEMPTS = 5
const BATCH_SIZE = 5

// Add an email to the queue. Returns immediately — the worker picks it up.
export async function enqueueEmail(msg: EmailMessage): Promise<void> {
    await pool.query(
        `INSERT INTO mail_queue (to_email, subject, html, text)
         VALUES ($1, $2, $3, $4)`,
        [msg.to, msg.subject, msg.html, msg.text]
    )
}

// Claim and process a batch of pending emails. Called by the worker.
// Returns the number of jobs processed (0 = idle tick).
export async function processNextBatch(): Promise<number> {
    const client = await pool.connect()
    let claimed: Array<{
        id: string
        to_email: string
        subject: string
        html: string
        text: string
        attempts: number
    }>

    // ATOMIC CLAIM: bump attempts + flip status to 'sending' for up to BATCH_SIZE
    // pending rows. FOR UPDATE SKIP LOCKED means parallel workers don't fight.
    try {
        await client.query("BEGIN")
        const claim = await client.query(
            `UPDATE mail_queue
             SET status = 'sending', attempts = attempts + 1
             WHERE id IN (
                 SELECT id FROM mail_queue
                 WHERE status = 'pending'
                   AND scheduled_at <= now()
                   AND attempts < $1
                 ORDER BY created_at
                 LIMIT $2
                 FOR UPDATE SKIP LOCKED
             )
             RETURNING id, to_email, subject, html, text, attempts`,
            [MAX_ATTEMPTS, BATCH_SIZE]
        )
        claimed = claim.rows
        await client.query("COMMIT")
    } catch (err) {
        await client.query("ROLLBACK")
        throw err
    } finally {
        client.release()
    }

    // Send each claimed job. Failures get exponential backoff or move to 'failed'.
    for (const job of claimed) {
        try {
            await sendEmailNow({
                to: job.to_email,
                subject: job.subject,
                html: job.html,
                text: job.text,
            })
            await pool.query(
                `UPDATE mail_queue SET status = 'sent', sent_at = now() WHERE id = $1`,
                [job.id]
            )
        } catch (err) {
            const finalFailure = job.attempts >= MAX_ATTEMPTS
            // Backoff: 1m, 2m, 4m, 8m, 16m
            const backoffMs = 60_000 * Math.pow(2, job.attempts - 1)
            const retryAt = new Date(Date.now() + backoffMs)
            await pool.query(
                `UPDATE mail_queue
                 SET status = $1, last_error = $2, scheduled_at = $3
                 WHERE id = $4`,
                [
                    finalFailure ? "failed" : "pending",
                    err instanceof Error ? err.message : String(err),
                    retryAt,
                    job.id,
                ]
            )
        }
    }

    return claimed.length
}
