# Phase: Onboarding & User Profile

Status: planned · Owner: Harsh · Started: 2026-05-09

## Goal

After a user registers (or signs in for the first time), walk them through a **single all-at-once onboarding wizard** that captures everything needed to:

- Compute their daily calorie target
- Suggest a starter workout split
- Personalize the diet experience

Once completed, the app skips onboarding on subsequent visits and lands users on the dashboard.

## Approach

**All-at-once wizard** (Apple Fitness / Whoop style), not progressive prompts. Higher upfront cost in conversion, but every downstream feature has the data it needs from day one. We'll keep the wizard tight — 4 steps, ~12 fields total — so it takes under 90 seconds.

Skippable fields are explicitly skippable (e.g., "Allergies — none / add"). Required fields gate progression.

## Data model

### `profiles` (1:1 with `users`)

Slow-changing identity facts. One row per user.

| Field | Type | Required | Notes |
|---|---|---|---|
| `user_id` | UUID PK + FK → users | ✓ | |
| `date_of_birth` | DATE | ✓ | Drives BMR |
| `sex` | TEXT | ✓ | `'male' \| 'female' \| 'other'` |
| `height_cm` | NUMERIC(5,1) | ✓ | |
| `goal` | TEXT | ✓ | `'cut' \| 'maintain' \| 'bulk' \| 'recomp'` |
| `target_weight_kg` | NUMERIC(5,2) | — | Optional aspirational target |
| `activity_level` | TEXT | ✓ | `'sedentary' \| 'light' \| 'moderate' \| 'active' \| 'very_active'` |
| `experience_level` | TEXT | ✓ | `'beginner' \| 'intermediate' \| 'advanced'` |
| `training_days_per_week` | INT | ✓ | 1–7 |
| `equipment_access` | TEXT | ✓ | `'full_gym' \| 'home_basic' \| 'dumbbells_only' \| 'bodyweight'` |
| `diet_type` | TEXT | ✓ | `'omnivore' \| 'vegetarian' \| 'vegan' \| 'keto' \| 'paleo' \| 'other'` |
| `allergies` | TEXT[] | — | Array of strings |
| `dislikes` | TEXT[] | — | Array of strings |
| `timezone` | TEXT | ✓ | Auto-detected from browser, IANA name |
| `units` | TEXT | ✓ | `'metric' \| 'imperial'`, default `'metric'` |
| `onboarding_completed_at` | TIMESTAMPTZ | — | Set when wizard finishes; `NULL` = not yet onboarded |
| `created_at`, `updated_at` | TIMESTAMPTZ | ✓ | Standard timestamps |

**No current weight column.** Weight goes in `body_metrics` (time series). The wizard collects an initial weight and creates the first `body_metrics` row atomically with profile creation.

### `body_metrics` (time series)

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID PK | ✓ | |
| `user_id` | UUID FK → users (CASCADE) | ✓ | |
| `recorded_at` | DATE | ✓ | One log per day |
| `weight_kg` | NUMERIC(5,2) | — | At least one of the metrics required (CHECK) |
| `body_fat_pct` | NUMERIC(4,1) | — | |
| `waist_cm` | NUMERIC(5,1) | — | |
| `notes` | TEXT | — | |
| `created_at` | TIMESTAMPTZ | ✓ | |

UNIQUE `(user_id, recorded_at)` — one entry per day per user. If the user logs again the same day, we UPSERT.

## Wizard UX

Four screens with a progress indicator at the top. Each step validates before advancing. Cancel returns to landing; close attempts trigger a "leave?" confirm if any field is filled.

**Step 1 — About you**
- Date of birth (date picker)
- Sex (3 buttons: Male / Female / Other)
- Height (cm with imperial toggle)
- Current weight (kg with imperial toggle) — *seeds first body_metrics row*

**Step 2 — Your goal**
- Goal (4 cards: Cut / Maintain / Bulk / Recomp)
- Target weight (optional, only shown if goal is cut/bulk)
- Activity level (5 buttons with one-line descriptions: "Sedentary — desk job, little exercise" etc.)

**Step 3 — Your training**
- Experience level (3 cards: Beginner / Intermediate / Advanced)
- Training days/week (slider or 1–7 buttons)
- Equipment access (4 cards: Full gym / Home basic / Dumbbells only / Bodyweight)

**Step 4 — Your eating**
- Diet type (6 cards: Omnivore / Vegetarian / Vegan / Keto / Paleo / Other)
- Allergies — pill input (Enter to add) with common presets (nuts, dairy, gluten, shellfish, eggs)
- Dislikes — pill input

Final button: **"Build my plan →"**. On success, the user lands on `/dashboard`.

## API endpoints

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| GET | `/api/v1/profile` | ✓ | — | `{ profile, completedOnboarding }` |
| PUT | `/api/v1/profile` | ✓ | partial profile | updated profile |
| POST | `/api/v1/profile/complete-onboarding` | ✓ | full profile + initial weight | `{ profile, bodyMetric }` |
| GET | `/api/v1/body-metrics?limit=N&before=date` | ✓ | — | paginated list |
| POST | `/api/v1/body-metrics` | ✓ | metric fields | created row (UPSERT on `recorded_at`) |

`POST /complete-onboarding` does its work in a single transaction:
1. UPSERT into `profiles`
2. INSERT into `body_metrics` (initial weight)
3. UPDATE `profiles.onboarding_completed_at = now()`

If any step fails, all roll back.

## Validation

Zod schemas live in `frontend/src/schemas/profile.ts` and `backend/src/features/profile/profile.schemas.ts`. We accept a small amount of duplication for now (frontend gets messages without an extra round trip). When this grows, we'll extract to a shared package.

## Frontend changes

**New files:**
- `frontend/src/pages/onboarding/Onboarding.tsx` — wizard shell
- `frontend/src/pages/onboarding/steps/AboutYou.tsx`
- `frontend/src/pages/onboarding/steps/YourGoal.tsx`
- `frontend/src/pages/onboarding/steps/YourTraining.tsx`
- `frontend/src/pages/onboarding/steps/YourEating.tsx`
- `frontend/src/schemas/profile.ts`
- `frontend/src/lib/endpoints/profile.ts`
- `frontend/src/stores/profileStore.ts` (or extend `authStore`)
- `frontend/src/pages/Dashboard.tsx` — placeholder so post-onboarding has somewhere to land

**Modified:**
- `frontend/src/routes/PrivateRoutes.tsx` — add `/onboarding` and `/dashboard`
- `frontend/src/routes/ProtectedRoute.tsx` — if logged in but `onboarding_completed_at` is null, redirect to `/onboarding`. If onboarded and visiting `/onboarding`, redirect to `/dashboard`.

## Backend changes

**New files:**
- `backend/migration/0006_profiles_body_metrics.sql`
- `backend/src/features/profile/profile.types.ts`
- `backend/src/features/profile/profile.schemas.ts`
- `backend/src/features/profile/service/profile.service.ts`
- `backend/src/features/profile/controller/profile.controller.ts`
- `backend/src/features/profile/routes/profile.routes.ts`

**Modified:**
- `backend/src/app.ts` — mount `profileRouter` at `/api/v1/profile` and `/api/v1/body-metrics`

## Implementation order

We'll do this in **6 reviewable chunks**, one at a time:

1. **Migration** — `profiles` + `body_metrics` tables
2. **Backend service + controller + routes** — all 5 endpoints
3. **Frontend schemas + endpoints + store** — non-UI plumbing
4. **Frontend wizard shell + step 1**
5. **Frontend steps 2–4 + final submit**
6. **Routing guard** — redirect unverified users to `/onboarding`

Each chunk is a single review pass before moving on.

## Out of scope (later phases)

- Workout generation (uses profile data, separate phase)
- Diet/meal plan generation
- Photo calorie tracking
- AI coach chat
- Progress photos
- Reports/check-ins
- Profile editing UI (post-onboarding) — readonly for now; we'll add an edit screen later
- Social/sharing features

## Open decisions to lock in before starting

- [ ] Confirm: metric is the storage unit, imperial is just a display toggle? (recommended)
- [ ] Confirm: `target_weight_kg` is optional? (recommended — pressure-free)
- [ ] Allergies as `TEXT[]` or separate junction table to a global allergens list? (recommended `TEXT[]` for now — fewer joins, easier to migrate later if we need a global taxonomy)
- [ ] Anything to add or remove from the field list?
