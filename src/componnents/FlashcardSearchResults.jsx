import { useLiveQuery } from "dexie-react-hooks";
import { searchAllFlashcards } from "../database/flashcard";

const MAX_RESULTS = 200;

/**
 * Résultats de la recherche globale (façon dictionnaire) : lecture seule,
 * avec la collection et la fiche de chaque carte.
 */
export default function FlashcardSearchResults({ searchValue }) {
  const results = useLiveQuery(() => searchAllFlashcards(searchValue), [searchValue]);

  if (!results) return null;

  if (results.length === 0) {
    return (
      <div className="neu-raised neu-shape-card p-6 text-center text-neutral-600 dark:text-neutral-300">
        Aucune carte trouvée.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <p className="px-1 text-xs text-neutral-500 dark:text-neutral-400">
        {results.length} carte{results.length > 1 ? "s" : ""} trouvée{results.length > 1 ? "s" : ""}
        {results.length > MAX_RESULTS && ` — ${MAX_RESULTS} premières affichées`}
      </p>

      <div className="flex flex-col gap-2">
        {results.slice(0, MAX_RESULTS).map((flashcard) => (
          <div
            key={flashcard.id}
            className={`neu-raised-sm neu-shape-control flex flex-col gap-1 px-4 py-3 ${
              flashcard.desactive ? "opacity-55" : ""
            }`}
          >
            <div className="grid grid-cols-2 gap-3">
              <span className="break-words font-medium text-neutral-800 dark:text-neutral-100">
                {flashcard.frontCard}
              </span>
              <span className="break-words text-neutral-600 dark:text-neutral-300">
                {flashcard.backCard}
              </span>
            </div>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {flashcard.profileName} · {flashcard.ficheName}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
