import type { Request, Response, NextFunction } from "express"
import { verifyJwt } from "../utils/jwt.js"
import { findUserById } from "../features/auth/service/auth.service.js"
import "../features/auth/auth.types.js"

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token: string | undefined = req.cookies?.gc_session
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" })
    }
    try {
        const payload = verifyJwt(token)
        const user = await findUserById(payload.sub)
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" })
        }
        const { passwordHash: _omit, ...publicUser } = user
        req.user = publicUser
        next()
    } catch {
        return res.status(401).json({ error: "Unauthorized" })
    }
}
