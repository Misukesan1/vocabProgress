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

### Data Model (Dexie `dbVocabProgress` v5)

- **profile** — top-level collection (`id`, `name`)
- **fiche** — deck within a profile (`id`, `name`, `description`, `profileId`); compound index `[profileId+name]` enforces uniqueness
- **flashcard** — card within a fiche (`id`, `ficheId`, `frontCard`, `backCard`, `desactive`); `desactive` = mastered (excluded from training). A card is either *à réviser* or *maîtrisée* — there is no "à revoir"/difficulty status (v5 only dropped the `errors` index; old records may still carry an unused `errors` value)

### State Management (Redux Toolkit)

Four slices in [src/features/](src/features/):

| Slice | Responsibility |
|---|---|
| `profileSlice` | Currently selected collection (persisted in localStorage, resynced with the DB in `Layout`) |
| `ficheSlice` | Currently selected fiche, always inside the selected collection (same persistence/resync; cleared when switching collection). The bottom-nav "Entraînement" tab resumes an unquit session, else opens this fiche, else asks to pick one |
| `trainingSlice` | Full training session state (cards, progress, flip/reversed state, rounds) |
| `alertSlice` | Temporary notifications, rendered by `common/AlertToast` in `Layout` (auto-dismiss after 3 s) |

### Routing (React Router, hash-based)

Defined in [src/router/router.jsx](src/router/router.jsx). Hash-based because the app is deployed to a GitHub Pages subdirectory (`/vocabProgress/`, configured in `vite.config.js`).

| Path | Page |
|---|---|
| `/` | Accueil (dashboard): "Reprendre" / "Réviser" hero card, collections ribbon (`CollectionTile`), fiche grid of the selected collection (`FicheTile`) |
| `/fiches` | Bibliothèque — collections + fiches lists (bottom-nav: Accueil · Entraînement (FAB) · Bibliothèque) |
| `/entrainement` | Shown by the Entraînement tab when no session and no selected fiche |
| `/fiche/:id` | Fiche detail (flashcard list) |
| `/fiche/:id/training` | Training session |
| `/progres` | Progress (stub) |
| `/options` | Options — data backup (export / restore JSON), reached via the ⚙ icon in the header |

### Training Flow

1. Training uses every non-mastered card of the fiche, shuffled.
2. Tap the card to flip it; tap again to go to the next card. Once flipped, the only action is *Je maîtrise cette carte*, which sets `desactive = true` and moves on.
3. After all cards, user can start another round with remaining non-mastered cards.

### List UI Pattern (Collections / Fiches / Flashcards)

Each level of the hierarchy follows the same list-page pattern, seen in [Home.jsx](src/pages/Home.jsx), [Fiches.jsx](src/pages/Fiches.jsx), and [FicheDetails.jsx](src/pages/FicheDetails.jsx):

- A `*Card` component (`CollectionCard`, `FicheCard`) renders one row and navigates on click.
- A `*Filter` component (`FicheFilter`, `FlashcardFilter`) provides a search `Input` plus `Chip`-based sort/filter toggles (recent/ancien/a-z/z-a, or "à réviser"/"maîtrisées" where relevant); filtering/sorting itself is done client-side in the page component, not the filter component.
- A `DropdownMenu*` component (`DropdownMenuFiche`) holds per-item actions (modifier / supprimer / remettre en révision) behind an `Ellipsis` icon button, using `ModalConfirm` for destructive actions.
- `DropdownMenuCollection` (wired into each `CollectionCard` row) holds collection actions: modifier / supprimer. Deleting a collection cascades to its fiches and flashcards (`deleteProfile`, in a Dexie transaction).

### Key Conventions

- **JavaScript only** — no TypeScript.
- **Component folder is misspelled** `src/componnents/` (two n's) — keep the existing name to avoid breaking imports.
- Live database queries use `useLiveQuery` from `dexie-react-hooks`; prefer this over manual state for anything read from IndexedDB.
- UI components come from **HeroUI** (`@heroui/react`); use them before reaching for custom solutions.
- Icons come from **lucide-react**.
- Forms (create / edit collection, fiche, card) open in `common/BottomSheet` (HeroUI `Drawer` from the bottom, 85dvh, with `DrawerContent/Header/Body/Footer`). Action confirmations stay centered modals (`common/ModalConfirm`).
- Dark/light theme is managed by **next-themes**; read the current theme via `useTheme()`.
- Deploy target is GitHub Pages; the CI workflow (`.github/workflows/deploy.yml`) triggers on push to `main`.

### Current Status

- Work happens on the `design-v2` branch (neumorphic redesign, bottom nav, simplified binary training); `main` is what's deployed.
- `/progres` (Progress.jsx) is still a "Bientôt disponible" stub.
- Backup: `src/database/backup.js` (export / validate / restore in one transaction, ids preserved) + `src/utils/backupFile.js` (download, file read, last-backup date). Restoring replaces everything but first downloads the current data.
- `src/tests/` holds manual test scripts and is excluded from ESLint.
- **The user's real data lives in IndexedDB on their phone (GitHub Pages origin) and cannot be backed up from the browser.** Any Dexie schema change must be additive/non-destructive; never delete or rewrite user fields in an `upgrade()`.
