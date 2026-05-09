import type { Request, Response } from "express"
import * as profileService from "../service/profile.service.js"
import { HttpError } from "../../../utils/http-error.js"

function userId(req: Request): string {
    if (!req.user) throw new HttpError(401, "Unauthorized")
    return req.user.id
}

// GET /api/v1/profile
export async function getProfile(req: Request, res: Response) {
    const profile = await profileService.getOrCreateProfile(userId(req))
    res.json({
        profile,
        completedOnboarding: profile.onboardingCompletedAt != null,
    })
}

// PUT /api/v1/profile
export async function updateProfile(req: Request, res: Response) {
    const profile = await profileService.updateProfile(userId(req), req.body)
    res.json({ profile })
}

// POST /api/v1/profile/complete-onboarding
export async function completeOnboarding(req: Request, res: Response) {
    const result = await profileService.completeOnboarding(userId(req), req.body)
    res.status(201).json(result)
}

// GET /api/v1/body-metrics?limit=30&before=YYYY-MM-DD
export async function listBodyMetrics(req: Request, res: Response) {
    const rawLimit = parseInt(String(req.query.limit ?? "30"), 10)
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 30
    const before =
        typeof req.query.before === "string" && /^\d{4}-\d{2}-\d{2}$/.test(req.query.before)
            ? req.query.before
            : undefined
    const metrics = await profileService.listBodyMetrics(userId(req), { limit, before })
    res.json({ metrics })
}

// POST /api/v1/body-metrics
export async function addBodyMetric(req: Request, res: Response) {
    const metric = await profileService.upsertBodyMetric(userId(req), req.body)
    res.status(201).json({ metric })
}
