---
name: design
description: Use when designing, styling, or reviewing UI components in the gym-coach frontend. Covers Tailwind v4 conventions, mobile-first layout, component patterns (forms, cards, buttons, nav), color and typography system, and accessibility. Trigger when the user asks to "design", "style", "make it look better", build a new screen/page, or when editing files under frontend/src/pages or adding new components.
---

# Gym Coach — Design Skill

This is a fitness app that users will mostly use **on their phone, often at the gym** (sweaty hands, glances between sets, sometimes outdoors in sunlight). Every design decision should respect that context.

## Core principles

1. **Mobile-first, always.** Design for ~375px width first. Desktop is a bonus. Use responsive prefixes (`sm:`, `md:`) only to *enhance* on larger screens.
2. **Whitespace is the design.** This aesthetic lives or dies by spacing. Use generous vertical rhythm (`pt-20 sm:pt-32` for hero top padding, `mt-8`–`mt-12` between hero elements, `pb-24` between major sections). Cramped layouts kill the minimal vibe more than any other mistake.
3. **One loud element per screen.** The H1 *or* the primary CTA carries the screen. Don't compete with itself — secondary actions, helper text, and feature cards should recede.
4. **Big tap targets.** Minimum 44×44px (`min-h-11`); use `min-h-12` for primary CTAs.
5. **Glanceable information.** A user mid-workout shouldn't have to read a paragraph. Lead with numbers and short labels.
6. **High contrast.** Bright gym lighting or sunlight is the default. `text-neutral-900` for primary, `text-neutral-500` for secondary — don't go lighter than 500 for anything readable.
7. **Loading and empty states matter.** Every screen that fetches data needs a skeleton and an empty state.

## Tech rules

- **Tailwind v4** is the only styling tool. No CSS modules, no styled-components, no inline `<style>` blocks. Custom CSS only goes in `frontend/src/index.css` and only when Tailwind genuinely can't express it.
- **Cascade layers gotcha (Tailwind v4):** Tailwind v4 puts utilities in `@layer utilities`. **Unlayered CSS always beats layered CSS**, regardless of specificity. So a stray `* { margin: 0; padding: 0 }` in `index.css` will silently break `mx-auto`, `m-*`, `p-*`, and similar utilities. Always wrap custom base styles in `@layer base { ... }`. Don't add a universal selector reset — Tailwind's preflight already handles it.
- **Class order:** layout → spacing → sizing → typography → color → state. Helps diff readability.
- **Avoid arbitrary values** (`w-[372px]`) unless there's a real reason. Stick to Tailwind's scale — it keeps the app visually consistent.
- **Component files** live next to their pages or in a shared `components/` folder when reused. Don't create a `components/` folder until there's actually something shared.
- **Icons:** when icons are needed, suggest `lucide-react` (clean, tree-shakeable, fits a fitness aesthetic). Don't add it until needed.

## Color & typography

**Tone: light, neutral, minimal.** Inspired by clean fitness landing pages (workoutgen.app style). Off-white backgrounds, near-black text, monochrome primary actions, one bold typographic moment per screen.

- **Background:** `bg-stone-50` (warm off-white — softer than pure white, less sterile)
- **Surface:** `bg-white` for cards and inputs
- **Border:** `border-neutral-200` (cards, dividers), `border-neutral-300` (inputs)
- **Primary text:** `text-neutral-900`
- **Secondary text:** `text-neutral-500`
- **Muted/footer text:** `text-neutral-400`
- **Primary action:** `bg-neutral-900 text-white` (high contrast, premium). Hover: `hover:bg-neutral-800`.
- **Secondary action:** `border border-neutral-300 text-neutral-900`. Hover: `hover:border-neutral-900`.
- **Danger:** `text-red-600`
- **Focus ring:** `focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50`

**Typography:**
- **Font:** Inter, loaded in [index.css](../../../frontend/src/index.css) and exposed as `--font-sans`. All text inherits this.
- **Headings:** `font-semibold tracking-tight` for confidence, `leading-[1.02]` to `leading-[1.05]` on hero-sized text so lines don't feel airy.
- **Hero H1:** `text-5xl sm:text-7xl` — big and bold is the whole point; don't shrink it.
- **Italic accent trick:** for hero headlines, set the second line in `italic font-normal text-neutral-500` to add typographic rhythm without adding color. Example: "Your AI gym coach, *in your pocket.*"
- **Numbers (weights, calories, reps):** `font-bold tabular-nums` so digits don't shift width as values change.

**Don't add color decoration.** No gradients, no colorful accents on buttons, no rainbow stat badges. The aesthetic depends on restraint — one black CTA on a stone background reads as premium; the same screen with a colorful accent reads as a template.

## Component patterns

### Buttons

```tsx
// primary — pill-shaped, monochrome, the only "loud" element on the screen
<button className="min-h-12 px-8 rounded-full bg-neutral-900 text-white font-medium active:scale-[0.98] transition-transform hover:bg-neutral-800">
  Get started
</button>

// secondary — outlined, same height
<button className="min-h-12 px-8 rounded-full border border-neutral-300 text-neutral-900 font-medium hover:border-neutral-900 transition-colors">
  Cancel
</button>
```

- **Pill (`rounded-full`)** for hero/CTA buttons. **`rounded-xl`** for inline form buttons or dense lists.
- `min-h-12` (48px) on primary actions, `min-h-11` is the floor for any tap target.
- `active:scale-[0.98]` for tactile mobile feedback.

### Forms (login, register, log entries)

- One input per row on mobile.
- Labels above inputs, never as placeholders only (placeholders disappear on focus and hurt accessibility).
- `text-base` (16px) minimum on inputs to prevent iOS Safari zoom-on-focus.
- Input classes: `w-full min-h-12 px-4 text-base rounded-xl bg-white border border-neutral-300 focus:border-neutral-900 outline-none transition-colors`
- Label classes: `text-sm font-medium text-neutral-700`
- Form vertical rhythm: `gap-5` between fields (not `gap-4` — fields need air).

### Cards (workout summary, meal entry, report card)

```tsx
<div className="rounded-2xl bg-white border border-neutral-200 p-6">
  ...
</div>
```

`p-6` minimum on cards — `p-4` reads cramped in a light, minimal layout. Don't add shadows; the border + off-white page background carries the elevation.

### Navigation

This app's primary navigation should be a **bottom tab bar** on mobile (Home, Workouts, Diet, Progress, Coach/Chat). Top bars get covered by thumbs. Build this when there are enough screens to navigate — not before.

## Photos & camera (for calorie photo feature)

- Use `<input type="file" accept="image/*" capture="environment">` — the `capture` attribute opens the rear camera directly on mobile.
- Show the captured image immediately as a preview at full width with `aspect-square object-cover rounded-2xl`.
- AI-generated calorie results should appear *below* the image, not replace it — users want to see what the AI saw.

## Accessibility checklist (run before declaring a screen done)

- [ ] All interactive elements have visible focus states (`focus-visible:ring-2 focus-visible:ring-lime-400`).
- [ ] Icons that convey meaning have an `aria-label` or accompanying text.
- [ ] Color is never the only signal (e.g. red text for errors should also have an icon or "Error:" prefix).
- [ ] Form inputs have associated `<label>` elements (use `htmlFor`).

## When designing a new screen

1. Sketch the mobile layout first (what's above the fold on a 375×812 screen?).
2. Identify the **one primary action** and make it visually dominant.
3. Build the loading state and empty state at the same time as the populated state — not later.
4. Test at 375px width in dev tools before committing.
5. Update this file if a new pattern emerges that should be reused.
