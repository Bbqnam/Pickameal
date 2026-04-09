# PickaMeal

PickaMeal is a lightweight recipe discovery experience for when you know what ingredients you have but are missing inspiration. The app asks you to choose what you already own, refine the search with filters (cuisine, time, difficulty, meal type), and surface matching recipes that highlight ingredient coverage, randomize picks, or let you bookmark favorites.

## Getting started

1. Install dependencies (Node 18+ or Bun): `npm install`
2. Run the dev server on http://localhost:8080: `npm run dev`
3. Build for production: `npm run build`
4. Lint the project: `npm run lint`

## Frontend stack & tooling

- **Core:** Vite + React 18 (SWC), React Router, TanStack Query, TypeScript
- **Styling:** Tailwind CSS with shadcn-style components, global CSS variables, and animation helpers. `components/ui` exports Radix-based primitives plus a global `Toaster` backed by Sonner/ToastProvider.
- **State & data:** `src/context/AppContext` exposes user-selected ingredients, filters, saved recipe IDs, and helpers for filtering, saving, and randomizing against the static dataset in `src/data/recipes.ts` + `ingredients.ts`.
- **Testing:** Vitest runs unit/smoke specs in jsdom with `src/test/setup.ts`, and Playwright is configured with the standard `@playwright/test` fixture.
- **Linting:** ESLint via `typescript-eslint` with React hooks/refresh plugins.

## Project structure

- `src/pages`: screen-level routes (`Index`, `Ingredients`, `FiltersPage`, `Results`, `RecipeDetail`, `SavedRecipes`, `RollaMeal`, `Onboarding`).
- `src/components`: shared widgets such as cards, chips, bottom navigation, and the ui primitives from `components/ui`.
- `src/hooks`, `src/lib`, `src/types`: helpers for toasts, mobile detection, CSS helpers, and shared recipe typings.

## Current state
- All recipes and ingredients are stored locally in `src/data`, so nothing is persisted or synced with a backend yet.
- Routing and UI flows are wired up, but there are no runtime data validations or API calls.
- Testing infrastructure is ready but only ships with the default placeholder test and Playwright fixture.

## Improvements / next steps

1. **Persist user state.** Save selections, filters, and saved recipes to localStorage (or a lightweight backend) so the experience survives page reloads.
2. **Add focused tests.** Replace the placeholder Vitest spec with integration tests for `AppContext`, ingredient selection, and the recipe filtering flow, and add Playwright scenarios for the major screens.
3. **Expand the data layer.** Layer in data-fetching utilities or APIs so recipes/ingredients can be refreshed without editing local modules.
4. **Document workflows.** Keep this README, dev scripts, and the `/public` assets (favicon/logo) in sync with any future branding or tooling updates.

If anything is unclear or you want to extend the UX (e.g., add nutrition insights, pantry sync, or sharing), let me know and we can tackle it next.
