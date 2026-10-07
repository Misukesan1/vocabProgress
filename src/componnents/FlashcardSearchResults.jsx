import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useDisclosure } from "@heroui/react";
import { searchAllFlashcards } from "../database/flashcard";
import ModalFlashcard from "./ModalFlashcard";

const MAX_RESULTS = 200;

/**
 * Résultats de la recherche globale (façon dictionnaire), avec la collection
 * et la fiche de chaque carte. Clic = modifier la carte.
 */
export default function FlashcardSearchResults({ searchValue }) {
  const results = useLiveQuery(() => searchAllFlashcards(searchValue), [searchValue]);
  const [editedFlashcard, setEditedFlashcard] = useState(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const openFlashcardModal = (flashcard) => {
    setEditedFlashcard(flashcard);
    onOpen();
  };

  return (
    <section className="flex flex-col gap-3">
      {results?.length === 0 && (
        <div className="neu-raised neu-shape-card p-6 text-center text-neutral-600 dark:text-neutral-300">
          Aucune carte trouvée.
        </div>
      )}

      {results?.length > 0 && (
        <>
          <p className="px-1 text-xs text-neutral-500 dark:text-neutral-400">
            {results.length} carte{results.length > 1 ? "s" : ""} trouvée{results.length > 1 ? "s" : ""}
            {results.length > MAX_RESULTS && ` — ${MAX_RESULTS} premières affichées`}
          </p>

          <div className="flex flex-col gap-2">
            {results.slice(0, MAX_RESULTS).map((flashcard) => (
              <button
                key={flashcard.id}
                type="button"
                onClick={() => openFlashcardModal(flashcard)}
                className={`neu-raised-sm neu-shape-control neu-focusable flex cursor-pointer flex-col gap-1 px-4 py-3 text-left transition-all active:scale-[0.98] ${
                  flashcard.desactive ? "opacity-55" : ""
                }`}
              >
                <span className="grid w-full grid-cols-2 gap-3">
                  <span className="break-words font-medium text-neutral-800 dark:text-neutral-100">
                    {flashcard.frontCard}
                  </span>
                  <span className="break-words text-neutral-600 dark:text-neutral-300">{flashcard.backCard}</span>
                </span>
                <span className="w-full truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {flashcard.profileName} · {flashcard.ficheName}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Hors de la liste : la modale reste montée si la carte modifiée / supprimée disparaît des résultats */}
      {editedFlashcard && (
        <ModalFlashcard
          key={`flashcard-${editedFlashcard.id}-${isOpen}`}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          flashcard={editedFlashcard}
          ficheId={editedFlashcard.ficheId}
        />
      )}
    </section>
  );
}
