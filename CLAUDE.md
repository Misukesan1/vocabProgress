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
- **fiche** — deck within a profile (`id`, `name`, `description`, `profileId`, plus non-indexed review stats `reviewRounds` / `reviewTimeMs`, absent = 0, so no schema bump); compound index `[profileId+name]` enforces uniqueness
- **flashcard** — card within a fiche (`id`, `ficheId`, `frontCard`, `backCard`, `desactive`); `desactive` = mastered (excluded from training). A card is either *à réviser* or *maîtrisée* — there is no "à revoir"/difficulty status (v5 only dropped the `errors` index; old records may still carry an unused `errors` value)

### State Management (Redux Toolkit)

Four slices in [src/features/](src/features/):

| Slice | Responsibility |
|---|---|
| `profileSlice` | Currently selected collection (persisted in localStorage, resynced with the DB in `Layout`) |
| `ficheSlice` | Currently selected fiche, always inside the selected collection (same persistence/resync; cleared when switching collection). The bottom-nav "Entraînement" tab resumes an unquit session, else opens this fiche, else asks to pick one |
| `trainingSlice` | Full training session state (cards, progress, flip/reversed state, rounds, `mode` "cards"/"quiz" + current QCM question). `trainingPath(ficheId, mode)` gives the session route. Persisted in localStorage (`utils/lastTraining.js`, saved in `store.js`) so a reload resumes the session; `Layout` clears it if its fiche no longer exists |
| `alertSlice` | Temporary notifications, rendered by `common/AlertToast` in `Layout` (auto-dismiss after 3 s, 6 s for errors / `long` / `undoable`). `undoable: true` shows an "Annuler" button running the callback registered with `setUndo` (`utils/undo.js`) |

### Routing (React Router, hash-based)

Defined in [src/router/router.jsx](src/router/router.jsx). Hash-based because the app is deployed to a GitHub Pages subdirectory (`/vocabProgress/`, configured in `vite.config.js`).

| Path | Page |
|---|---|
| `/` | Accueil (dashboard): "Reprendre" / "Réviser" hero card, collections ribbon (`CollectionTile`), fiche grid of the selected collection (`FicheTile`) |
| `/premiers-pas` | Onboarding (`Onboarding.jsx`): guided 3-step creation — collection (= language), first fiche, cards inline — then choose Cartes / QCM (needs ≥ 3 cards); that first session is a single round (no "Nouveau tour"); its ✕ becomes a "Pause" button (session kept, back to the locked Home whose "Premiers pas" card resumes it), and "Terminer" leads to `/premiers-pas/fin` (`OnboardingEnd`: app tour + where data lives), via the `tutorialPending` localStorage flag in `utils/onboarding.js`, set as soon as the onboarding opens (so creating cards does not end the tutorial) and cleared only by "C'est parti !" on the recap (or by clear / restore). Start step derived from data, so it resumes where the user stopped. Once the tutorial is finished or skipped (or collections exist without it pending), `/premiers-pas` and `/premiers-pas/fin` redirect to Home. "Découvrir l'appli par moi-même" (`SkipTutorialLink`, on `Welcome` and at the bottom of the onboarding — the onboarding ✕ only pauses) sets a `tutorialSkipped` flag: no lock, and an empty Home shows the normal dashboard instead of `Welcome`. "Effacer toutes les données" resets both flags (`resetTutorial`), so the first-use welcome + tutorial come back; so does deleting the last collection (`DropdownMenuCollection`) or the DB being emptied outside the app (detected in `Layout` when the selected collection vanished and no collection is left); both then redirect to Home, since the nav locks again. Reached from `Welcome` (Home with no collection) or the Home "Premiers pas" card (tutorial pending). During the whole tutorial (no collection yet, `/premiers-pas*`, or `tutorialPending` on any page — deleting all cards afterwards does not lock again) `Layout` locks the bottom nav (`inert`, with a caption saying when it unlocks), Home greys out its collections / fiches block (only the hero card stays usable); plus the header logo (`useInTutorial` in `utils/onboarding.js`); ⚙ Options always stays reachable to restore a backup, and Options then shows a back link ("Retour à l'accueil" when coming from Home, else "Reprendre le tutoriel") back to the page it was opened from (`state.from`, set by the ⚙ and the Welcome link; fallback Home) |
| `/fiches` | Bibliothèque — global card search (`FlashcardSearchResults`, dictionary-style; tapping a result opens `ModalFlashcard` to edit / delete it) + collections + fiches lists (bottom-nav: Accueil · Entraînement (FAB) · Bibliothèque) |
| `/entrainement` | Shown by the Entraînement tab when no session and no selected fiche |
| `/fiche/:id` | Fiche detail (flashcard list) |
| `/fiche/:id/training` | Training session (cards mode) |
| `/fiche/:id/qcm` | Training session (QCM mode, `TrainingQuiz`) |
| `/aide` | "Comment ça marche ?" (`Help.jsx`): same `AppGuide` content as the onboarding recap, linked from Options and the Home footer (mainly for users who skipped the tutorial) |
| `/options` | Options — data backup (export / restore JSON) and "Effacer toutes les données" (`clearAllData`, downloads a backup first), reached via the ⚙ icon in the header |

### Training Flow

1. Training uses every non-mastered card of the fiche, shuffled.
2. Tap the card to flip it; tap again to go to the next card. Once flipped, the only action is *Je maîtrise cette carte*, which sets `desactive = true` and moves on.
3. After all cards, user can start another round with remaining non-mastered cards.
4. Quitting (✕) asks for confirmation whenever a round is in progress, in both modes. On the fiche page, a session in progress shows "Reprendre" plus "Ou recommencer à zéro : Cartes · QCM". Only one session exists at a time and changing the selected collection / fiche never clears it; launching Cartes / QCM while one is in progress (on this fiche or another one, which is then recalled with a "La reprendre" link) asks for confirmation before replacing it (`FicheDetails`).
5. Review stats: `useTrainingTime` (`src/utils/useTrainingTime.js`) counts active time while a round is running (pauses, other pages, app in background excluded) into `roundElapsedMs` / `sessionElapsedMs`; when a round finishes it adds +1 round and that round's time to the fiche (`addFicheReview`, once per round via `roundRecorded`). Quitting mid-round records nothing. Shown on the fiche page ("Révisions terminées" · "Temps de révision"), and kept in backups (`validateBackup`).
6. QCM mode (fiche needs ≥ 7 cards): one card's face + 6 answers from the other face (the right one + 5 distractors from the **same fiche only**, mastered included, never with the same answer text — `buildQuizChoices` in `src/utils/training.js`). After answering, every answer flips to show both faces: right one ringed green, wrong pick red. Same rounds / "Je maîtrise" / recto↔verso as cards mode. Shared UI: `TrainingHeader`, `TrainingRoundOver`.

### List UI Pattern (Collections / Fiches / Flashcards)

Each level of the hierarchy follows the same list-page pattern, seen in [Home.jsx](src/pages/Home.jsx), [Fiches.jsx](src/pages/Fiches.jsx), and [FicheDetails.jsx](src/pages/FicheDetails.jsx):

- A `*Card` component (`CollectionCard`, `FicheCard`) renders one row and navigates on click.
- A `*Filter` component (`FicheFilter`, `FlashcardFilter`) provides a search `Input` plus `Chip`-based sort/filter toggles (recent/ancien/a-z/z-a, or "à réviser"/"maîtrisées" where relevant); filtering/sorting itself is done client-side in the page component, not the filter component.
- A `DropdownMenu*` component (`DropdownMenuFiche`) holds per-item actions (modifier / supprimer / remettre en révision) behind an `Ellipsis` icon button, using `ModalConfirm` for destructive actions.
- `DropdownMenuCollection` (wired into each `CollectionCard` row) holds collection actions: modifier / supprimer. Deleting a collection cascades to its fiches and flashcards (`deleteProfile`, in a Dexie transaction).

### Key Conventions

- **Everything clickable shows `cursor: pointer`** (buttons, links, card rows, tiles, menu items, chips...), disabled controls show `not-allowed`. A global `@layer base` rule in `src/index.css` handles `button`, `a[href]` and interactive ARIA roles. Any new clickable element must be a `<button>` / `<Link>` (never a `<div onClick>`); if it really can't be, add `cursor-pointer` explicitly. Check this on every UI change.
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
- Backup: `src/database/backup.js` (export / validate / restore in one transaction, ids preserved) + `src/utils/backupFile.js` (download, file read, last-backup date). Restoring replaces everything but first downloads the current data.
- `src/tests/` holds manual test scripts and is excluded from ESLint.
- **The user's real data lives in IndexedDB on their phone (GitHub Pages origin) and cannot be backed up from the browser.** Any Dexie schema change must be additive/non-destructive; never delete or rewrite user fields in an `upgrade()`.
