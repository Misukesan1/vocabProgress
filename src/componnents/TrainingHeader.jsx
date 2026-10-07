import { Progress } from "@heroui/react";
import { X } from "lucide-react";

/**
 * En-tête d'une session d'entraînement (cartes ou QCM) : nom de la fiche,
 * tour en cours, progression et bouton pour quitter.
 */
export default function TrainingHeader({ ficheName, label, tours, totalDeselectWords, currentIndex, total, onQuit }) {
  const progressValue = Math.round((Math.min(currentIndex, total) / total) * 100);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-neutral-700 dark:text-neutral-200">{ficheName}</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {label} · Tour {tours + 1} · {totalDeselectWords} maîtrisée
            {totalDeselectWords > 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onQuit}
          aria-label="Quitter la révision"
          title="Quitter la révision"
          className="neu-btn neu-focusable flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 dark:text-neutral-400"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <Progress aria-label="Progression du tour" size="sm" value={progressValue} className="flex-1" />
        <span className="text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
          {Math.min(currentIndex + 1, total)}/{total}
        </span>
      </div>
    </section>
  );
}
