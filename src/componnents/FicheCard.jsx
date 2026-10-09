import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { countFlashcardsFromFiche } from "../database/flashcard";
import { selectFiche } from "../features/ficheSlice";

export default function FicheCard({ fiche }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSelected = useSelector((state) => state.fiche.selectedFiche?.id === fiche.id);
  const cardCount = useLiveQuery(() => countFlashcardsFromFiche(fiche.id), [fiche.id]);

  const handleOpen = () => {
    dispatch(selectFiche(fiche));
    navigate(`/fiche/${fiche.id}`);
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      aria-pressed={isSelected}
      className={`neu-shape-card neu-focusable flex w-full items-center justify-between px-5 py-4 text-left transition-all active:scale-[0.98] ${
        isSelected ? "neu-pressed text-primary" : "neu-raised text-neutral-800 dark:text-neutral-100"
      }`}
    >
      <div className="min-w-0">
        <p className="font-medium">{fiche.name}</p>
        {fiche.description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{fiche.description}</p>
        )}
      </div>
      <span className="shrink-0 pl-3 text-xs text-neutral-500 dark:text-neutral-400">
        {cardCount !== undefined && `${cardCount} carte${cardCount > 1 ? "s" : ""}`}
      </span>
    </button>
  );
}
