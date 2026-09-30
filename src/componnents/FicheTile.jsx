import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { getFicheProgress } from "../database/flashcard";
import { selectFiche } from "../features/ficheSlice";
import ProgressRing from "./common/ProgressRing";

/**
 * Tuile d'une fiche dans la grille de l'accueil : clic = sélection + ouverture
 */
export default function FicheTile({ fiche }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSelected = useSelector((state) => state.fiche.selectedFiche?.id === fiche.id);
  const isInProgress = useSelector((state) => state.training.ficheId === fiche.id);
  const progress = useLiveQuery(() => getFicheProgress(fiche.id), [fiche.id]);

  const isDone = progress && progress.total > 0 && progress.mastered === progress.total;
  const badge = isInProgress ? "En cours" : isDone ? "Maîtrisée" : null;

  const handleOpen = () => {
    dispatch(selectFiche(fiche));
    navigate(`/fiche/${fiche.id}`);
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      aria-pressed={isSelected}
      className={`neu-shape-card neu-focusable flex min-h-32 flex-col justify-between gap-3 p-4 text-left transition-all active:scale-[0.98] ${
        isSelected ? "neu-pressed" : "neu-raised"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            isInProgress ? "text-primary" : "text-success"
          }`}
        >
          {badge ?? " "}
        </span>
        <ProgressRing value={progress?.total ? progress.mastered / progress.total : 0} size={28} />
      </div>
      <div className="min-w-0">
        <p
          className={`line-clamp-2 font-semibold ${isSelected ? "text-primary" : "text-neutral-800 dark:text-neutral-100"}`}
        >
          {fiche.name}
        </p>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {progress ? `${progress.mastered}/${progress.total} maîtrisée${progress.mastered > 1 ? "s" : ""}` : " "}
        </p>
      </div>
    </button>
  );
}
