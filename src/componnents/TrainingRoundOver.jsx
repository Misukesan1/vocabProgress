import { useState } from "react";
import { RotateCw } from "lucide-react";
import { formatDuration } from "../utils/training";

/**
 * Fin d'un tour d'entraînement (cartes ou QCM) : bilan, nouveau tour avec
 * les cartes restantes, ou fin de session. `score` (optionnel) : ligne de
 * bilan propre au mode (ex. bonnes réponses du QCM).
 */
export default function TrainingRoundOver({
  remainingCount,
  tours,
  deselectWords,
  totalDeselectWords,
  roundSize,
  sessionStart,
  score,
  onNextRound,
  onFinish,
}) {
  // Heure de fin figée à l'affichage du bilan
  const [endedAt] = useState(() => Date.now());
  const duration = formatDuration(endedAt - sessionStart);

  return (
    <section className="neu-raised neu-shape-card flex flex-col items-center gap-4 p-6 text-center">
      {remainingCount === 0 ? (
        <>
          <p className="text-lg font-semibold text-success">Toutes les cartes sont maîtrisées !</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {totalDeselectWords} carte{totalDeselectWords > 1 ? "s" : ""} maîtrisée
            {totalDeselectWords > 1 ? "s" : ""} en {tours + 1} tour{tours > 0 ? "s" : ""} ·{" "}
            {duration}
          </p>
        </>
      ) : (
        <>
          <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Tour {tours + 1} terminé</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {deselectWords} maîtrisée{deselectWords > 1 ? "s" : ""} sur {roundSize} · {remainingCount} restante
            {remainingCount > 1 ? "s" : ""} · {duration}
          </p>
        </>
      )}
      {score}
      <div className="flex w-full flex-col gap-2">
        {remainingCount > 0 && (
          <button
            type="button"
            autoFocus
            onClick={onNextRound}
            className="neu-btn neu-shape-control neu-focusable flex items-center justify-center gap-2 py-3 font-semibold text-primary"
          >
            <RotateCw size={17} />
            Nouveau tour ({remainingCount} carte{remainingCount > 1 ? "s" : ""})
          </button>
        )}
        <button
          type="button"
          onClick={onFinish}
          className="neu-btn neu-shape-control neu-focusable py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300"
        >
          Terminer
        </button>
      </div>
    </section>
  );
}
