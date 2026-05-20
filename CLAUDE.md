# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

No test suite is configured.

## Architecture

**VocabProgress** is an offline-first French-language flashcard app (Profiles → Fiches → Flashcards). All data lives in the browser via **IndexedDB (Dexie)**. There is no backend.

### Data Model (Dexie `dbVocabProgress` v4)

- **profile** — top-level collection (`id`, `name`)
- **fiche** — deck within a profile (`id`, `name`, `description`, `profileId`); compound index `[profileId+name]` enforces uniqueness
- **flashcard** — card within a fiche (`id`, `ficheId`, `frontCard`, `backCard`, `desactive`, `errors`); `desactive` is a soft-delete/mastered flag; `errors` tracks difficulty for spaced repetition

### State Management (Redux Toolkit)

Four slices in [src/features/](src/features/):

| Slice | Responsibility |
|---|---|
| `profileSlice` | Currently selected profile |
| `ficheSlice` | Currently selected fiche |
| `trainingSlice` | Full training session state (cards, progress, flip/reversed state, rounds) |
| `alertSlice` | Temporary notifications (auto-dismiss after 3 s) |

### Routing (React Router, hash-based)

Defined in [src/router/router.jsx](src/router/router.jsx). Hash-based because the app is deployed to a GitHub Pages subdirectory (`/vocabProgress/`, configured in `vite.config.js`).

| Path | Page |
|---|---|
| `/` | Home — select/create profiles |
| `/fiches` | Fiche list for selected profile |
| `/fiche/:id` | Fiche detail (flashcard list) |
| `/fiche/:id/training` | Training session |
| `/progres` | Progress (stub) |
| `/options` | Settings |

### Training Flow

1. User picks training mode: **all cards** or **hard cards** (`errors > 0`).
2. Cards are shuffled; shown front → flip → user picks *Je connais* / *À revoir* / *Je maîtrise*.
3. "Je maîtrise" sets `desactive = true` (removes from future training rounds); "À revoir" increments `errors`.
4. After all cards, user can start another round with remaining non-mastered cards.

### Key Conventions

- **JavaScript only** — no TypeScript.
- **Component folder is misspelled** `src/componnents/` (two n's) — keep the existing name to avoid breaking imports.
- Live database queries use `useLiveQuery` from `dexie-react-hooks`; prefer this over manual state for anything read from IndexedDB.
- UI components come from **HeroUI** (`@heroui/react`); use them before reaching for custom solutions.
- Dark/light theme is managed by **next-themes**; read the current theme via `useTheme()`.
- Deploy target is GitHub Pages; the CI workflow (`.github/workflows/deploy.yml`) triggers on push to `main`.
