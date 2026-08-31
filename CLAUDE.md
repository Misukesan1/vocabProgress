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

### List UI Pattern (Collections / Fiches / Flashcards)

Each level of the hierarchy follows the same list-page pattern, seen in [Home.jsx](src/pages/Home.jsx), [Fiches.jsx](src/pages/Fiches.jsx), and [FicheDetails.jsx](src/pages/FicheDetails.jsx):

- A `*Card` component (`CollectionCard`, `FicheCard`) renders one row and navigates on click.
- A `*Filter` component (`FicheFilter`, `FlashcardFilter`) provides a search `Input` plus `Chip`-based sort/filter toggles (recent/ancien/a-z/z-a, or "à revoir"/"maîtrisées" where relevant); filtering/sorting itself is done client-side in the page component, not the filter component.
- A `DropdownMenu*` component (`DropdownMenuFiche`) holds per-item actions (modifier / supprimer / remettre en révision) behind an `Ellipsis` icon button, using `ModalConfirm` for destructive actions.
- **`DropdownMenuCollection.jsx` is a new, empty stub** (not yet implemented or wired into `CollectionCard`) — in-progress work mirroring `DropdownMenuFiche` for collection-level actions.

### Key Conventions

- **JavaScript only** — no TypeScript.
- **Component folder is misspelled** `src/componnents/` (two n's) — keep the existing name to avoid breaking imports.
- Live database queries use `useLiveQuery` from `dexie-react-hooks`; prefer this over manual state for anything read from IndexedDB.
- UI components come from **HeroUI** (`@heroui/react`); use them before reaching for custom solutions.
- Icons come from **lucide-react**.
- Dark/light theme is managed by **next-themes**; read the current theme via `useTheme()`.
- Deploy target is GitHub Pages; the CI workflow (`.github/workflows/deploy.yml`) triggers on push to `main`.

### Current Status

- Home, Fiches, and FicheDetails all now share the card/filter/dropdown list pattern above.
- `/progres` (Progress.jsx) is still an unimplemented stub page.
- Uncommitted on `dev`: `Fiches.jsx` reworked to move collection info above the fiche filter and always show it once a profile is selected; `FicheDetails.jsx` had a dead commented-out "Démarrer la révision" button removed; `DropdownMenuCollection.jsx` added as an empty placeholder.
