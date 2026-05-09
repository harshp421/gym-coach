import * as z from "zod"
import dotenv from "dotenv"
dotenv.config()

const envSchema = z.object({
    GYM_POSTGRES_URI: z.string(),
    GYM_JWT_SECRET: z.string().min(8),
    GYM_ENVIRONMENT: z.enum(["development", "production", "test"]),
    FRONTEND_URL: z.url().default("http://localhost:5173"),
    PORT: z.coerce.number(),

    // Email — both optional so dev runs without setup.
    // No RESEND_API_KEY → sender falls back to console.log.
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default("onboarding@resend.dev"),
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
    result.error.issues.forEach((issue) => {
        console.error(issue.message)
    })
    process.exit(1)
}
export type ENVType = z.infer<typeof envSchema>
export const ENV = result.data
