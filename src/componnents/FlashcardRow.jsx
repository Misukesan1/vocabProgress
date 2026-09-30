import { BadgeCheck, RotateCcw } from "lucide-react";
import { toggleStatusFlashcard } from "../database/flashcard";

/**
 * Ligne d'une carte dans le détail d'une fiche : clic = modifier,
 * bouton à droite = marquer maîtrisée / remettre en révision.
 */
export default function FlashcardRow({ flashcard, onEdit }) {
  const isMastered = flashcard.desactive;

  return (
    <div
      className={`neu-raised-sm neu-shape-control flex items-stretch gap-2 transition-opacity ${
        isMastered ? "opacity-55" : ""
      }`}
    >
      <button
        type="button"
        onClick={onEdit}
        className="neu-focusable neu-shape-control grid min-w-0 flex-1 grid-cols-2 gap-3 px-4 py-3 text-left"
      >
        <span className="break-words font-medium text-neutral-800 dark:text-neutral-100">
          {flashcard.frontCard}
        </span>
        <span className="break-words text-neutral-600 dark:text-neutral-300">
          {flashcard.backCard}
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-2 pr-3">
        <button
          type="button"
          onClick={() => toggleStatusFlashcard(flashcard.id, flashcard.desactive)}
          aria-label={isMastered ? "Remettre en révision" : "Marquer comme maîtrisée"}
          title={isMastered ? "Remettre en révision" : "Marquer comme maîtrisée"}
          className={`neu-btn neu-focusable flex h-9 w-9 items-center justify-center rounded-full ${
            isMastered ? "text-neutral-500 dark:text-neutral-400" : "text-success"
          }`}
        >
          {isMastered ? <RotateCcw size={16} /> : <BadgeCheck size={16} />}
        </button>
      </div>
    </div>
  );
}
