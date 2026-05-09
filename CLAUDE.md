# Gym Coach

An AI-powered personal gym coach app — an "all-in-one partner" that helps a user train, eat, and track progress.

## Product vision

The app acts as the user's coach + accountability partner. Core capabilities:

- **Workout plans** — AI generates and reviews workout plans tailored to the user's goals, level, and progress.
- **Diet plans** — AI generates diet plans and reviews what the user is eating.
- **Calorie estimation from photos** — user clicks a photo of their meal; AI estimates calories and macros.
- **Progress tracking** — logs workouts, weights, body metrics, photos over time.
- **Report check-ins** — user can upload reports (blood work, body composition, etc.) and AI interprets them.
- **Conversational coach** — the user chats with the AI like they would with a real trainer.

## Tech stack

- **Frontend**: React 19 + Vite + TypeScript, Tailwind CSS v4, React Router v7. Located in `frontend/`.
- **Backend**: Node.js + Express 5 + TypeScript (ESM, run via `tsx`). Located in `backend/`.
- **Routing pattern (frontend)**: single `<Routes>` block in `App.tsx` that spreads two arrays of `<Route>` elements — `publicRoutes` and `privateRoutes`. Private routes are wrapped with `<ProtectedRoute>` which checks auth and redirects to `/login`. See `frontend/src/routes/`.

## Repo layout

```
gym-coach/
├── frontend/          # React + Vite app
│   └── src/
│       ├── App.tsx          # mounts shared <Routes>
│       ├── main.tsx         # BrowserRouter lives here
│       ├── pages/
│       │   └── auth/        # Login, Register
│       └── routes/
│           ├── PublicRoutes.tsx     # array of public <Route>s
│           ├── PrivateRoutes.tsx    # array of private <Route>s wrapped in ProtectedRoute
│           └── ProtectedRoute.tsx   # auth guard (currently localStorage token check)
└── backend/           # Express API
    └── src/
        ├── server.ts        # entry point
        └── app.ts           # express app setup
```

## Dev commands

- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && npm run dev`

## Working style

The owner is building this with a **mixed workflow**: hands-on manual coding alongside agent-assisted development ("harness engineer" mode). When making changes:

- Prefer small, reviewable edits over large rewrites — the owner reads every change.
- Don't introduce dependencies, abstractions, or features beyond what was asked.
- The owner is still wiring up the foundation (routing, auth, etc.) — features like AI calorie estimation, diet/workout generation, and report parsing are **not built yet**. Don't assume they exist.

## Status

Early scaffolding. Login/Register pages exist as components but auth flow, API endpoints, AI integrations, and database are not wired up yet.
