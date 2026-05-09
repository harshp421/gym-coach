import type { Request, Response } from "express"
import * as authService from "../service/auth.service.js"
import type { PublicUser, User } from "../auth.types.js"
import { signJwt } from "../../../utils/jwt.js"
import { ENV } from "../../../config/env.config.js"
import { HttpError } from "../../../utils/http-error.js"

const COOKIE_NAME = "gc_session"
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

// Express 5 auto-forwards rejected promises to the error middleware,
// so handlers don't need try/catch — throw to fail the request.

function publicUser(user: User): PublicUser {
    const { passwordHash: _omit, ...rest } = user
    return rest
}

function setSessionCookie(res: Response, token: string) {
    const isProd = ENV.GYM_ENVIRONMENT === "production"
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: SEVEN_DAYS_MS,
        path: "/",
    })
}

// POST /api/auth/register
export async function register(req: Request, res: Response) {
    const { user } = await authService.registerUser(req.body)
    const token = signJwt({ sub: user.id, email: user.email })
    setSessionCookie(res, token)
    res.status(201).json({ user: publicUser(user) })
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
    const { user } = await authService.loginUser(req.body)
    const token = signJwt({ sub: user.id, email: user.email })
    setSessionCookie(res, token)
    res.json({ user: publicUser(user) })
}

// POST /api/auth/logout
export async function logout(_req: Request, res: Response) {
    res.clearCookie(COOKIE_NAME, { path: "/" })
    res.json({ ok: true })
}

// GET /api/auth/me
export async function me(req: Request, res: Response) {
    res.json({ user: req.user })
}

// POST /api/auth/forgot-password
//   Always returns ok to avoid email enumeration.
export async function forgotPassword(req: Request, res: Response) {
    await authService.requestPasswordReset(req.body.email)
    res.json({ ok: true })
}

// POST /api/auth/reset-password
export async function resetPassword(req: Request, res: Response) {
    await authService.resetUserPassword(req.body)
    res.json({ ok: true })
}

// POST /api/auth/verify-email
export async function verifyEmail(req: Request, res: Response) {
    await authService.verifyEmail(req.body.token)
    res.json({ ok: true })
}

// POST /api/auth/resend-verification (auth required)
export async function resendVerification(req: Request, res: Response) {
    if (!req.user) throw new HttpError(401, "Unauthorized")
    await authService.resendVerificationFor(req.user.id)
    res.json({ ok: true })
}

// POST /api/auth/oauth
export async function oauth(req: Request, res: Response) {
    const { provider, idToken } = req.body
    const verified = await verifyIdToken(provider, idToken)
    const { user } = await authService.loginWithProvider({
        provider,
        providerAccountId: verified.providerAccountId,
        email: verified.email,
        name: verified.name,
        avatarUrl: verified.avatarUrl,
    })
    const token = signJwt({ sub: user.id, email: user.email })
    setSessionCookie(res, token)
    res.json({ user: publicUser(user) })
}

// ---------------------------------------------------------------------------
// Provider verification — TODO before enabling OAuth in production.
//   - google: `google-auth-library` -> OAuth2Client.verifyIdToken
//   - apple : verify against Apple's JWKS (e.g. `jose`)
// ---------------------------------------------------------------------------
async function verifyIdToken(
    provider: string,
    _idToken: string
): Promise<{
    providerAccountId: string
    email: string
    name?: string
    avatarUrl?: string
}> {
    throw new HttpError(501, `${provider} verification not implemented yet`)
}
