import { RotateCw } from "lucide-react";
import { formatDuration } from "../utils/training";

/**
 * Fin d'un tour d'entraînement (cartes ou QCM) : bilan, nouveau tour avec
 * les cartes restantes, ou fin de session. `score` (optionnel) : ligne de
 * bilan propre au mode (ex. bonnes réponses du QCM). Sans `onNextRound`
 * (première révision du tutoriel), pas de nouveau tour : « Terminer » devient l'action principale,
 * `finishHint` (optionnel) dit ce qui suit.
 */
export default function TrainingRoundOver({
  remainingCount,
  tours,
  deselectWords,
  totalDeselectWords,
  roundSize,
  roundDuration,
  sessionDuration,
  score,
  finishHint,
  onNextRound,
  onFinish,
}) {
  // Temps de révision, pauses exclues : celui du tour, et toute la session pour le bilan final
  const roundTime = formatDuration(roundDuration ?? 0);
  const sessionTime = formatDuration(sessionDuration ?? 0);

  return (
    <section className="neu-raised neu-shape-card flex flex-col items-center gap-4 p-6 text-center">
      {remainingCount === 0 ? (
        <>
          <p className="text-lg font-semibold text-success">Toutes les cartes sont maîtrisées !</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {totalDeselectWords} carte{totalDeselectWords > 1 ? "s" : ""} maîtrisée
            {totalDeselectWords > 1 ? "s" : ""} en {tours + 1} tour{tours > 0 ? "s" : ""} ·{" "}
            {sessionTime}
          </p>
        </>
      ) : (
        <>
          <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Tour {tours + 1} terminé</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {deselectWords} maîtrisée{deselectWords > 1 ? "s" : ""} sur {roundSize} · {remainingCount} encore à
            apprendre · {roundTime}
          </p>
        </>
      )}
      {score}
      <div className="flex w-full flex-col gap-2">
        {remainingCount > 0 && onNextRound && (
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
          autoFocus={!onNextRound}
          onClick={onFinish}
          className={`neu-btn neu-shape-control neu-focusable ${
            onNextRound
              ? "py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300"
              : "py-3 font-semibold text-primary"
          }`}
        >
          Terminer
        </button>
        {finishHint && <p className="text-xs text-neutral-500 dark:text-neutral-400">{finishHint}</p>}
      </div>
    </section>
  );
}
