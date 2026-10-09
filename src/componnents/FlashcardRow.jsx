import { useRef } from "react";
import { useDispatch } from "react-redux";
import { BadgeCheck, RotateCcw } from "lucide-react";
import { toggleStatusFlashcard } from "../database/flashcard";
import { showAlert } from "../features/alertSlice";
import { setUndo } from "../utils/undo";

/**
 * Ligne d'une carte dans le détail d'une fiche : clic = modifier,
 * bouton à droite = marquer maîtrisée / remettre en révision (annulable depuis la notification).
 */
export default function FlashcardRow({ flashcard, onEdit }) {
  const dispatch = useDispatch();
  const isMastered = flashcard.desactive;

  const busyRef = useRef(false);

  // Écrit en base : on ignore les doubles appuis pendant l'écriture
  const toggle = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      await toggleStatusFlashcard(flashcard.id, isMastered);
    } finally {
      busyRef.current = false;
    }
    setUndo(() => toggleStatusFlashcard(flashcard.id, !isMastered));
    dispatch(
      showAlert({
        message: isMastered ? "Carte remise en révision." : "Carte maîtrisée : elle sort de la révision.",
        type: "success",
        undoable: true,
      }),
    );
  };

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

      <div className="flex shrink-0 items-center pr-2">
        <button
          type="button"
          onClick={toggle}
          aria-label={isMastered ? "Remettre en révision" : "Marquer comme maîtrisée"}
          title={isMastered ? "Remettre en révision" : "Marquer comme maîtrisée"}
          className={`neu-focusable flex w-16 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium ${
            isMastered ? "text-neutral-500 dark:text-neutral-400" : "text-success"
          }`}
        >
          <span className="neu-btn flex h-8 w-8 items-center justify-center rounded-full">
            {isMastered ? <RotateCcw size={15} /> : <BadgeCheck size={15} />}
          </span>
          {isMastered ? "Remettre" : "Maîtriser"}
        </button>
      </div>
    </div>
  );
}
