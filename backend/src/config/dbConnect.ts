import PG from "pg"
import { ENV } from "./env.config.js"

const isProd = ENV.GYM_ENVIRONMENT === "production"

export const pool = new PG.Pool({
    connectionString: ENV.GYM_POSTGRES_URI,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    keepAlive: true,
    ssl: isProd ? { rejectUnauthorized: true } : false,
})

pool.on("error", (err) => {
    console.error("[db] idle client error:", err)
})

export async function verifyDbConnection(): Promise<void> {
    const client = await pool.connect()
    try {
        await client.query("SELECT 1")
        console.log("[db] connection ok")
    } finally {
        client.release()
    }
}

export async function closePool(): Promise<void> {
    await pool.end()
    console.log("[db] pool closed")
}
