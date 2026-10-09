import { useEffect } from "react";
import { useDispatch, useStore } from "react-redux";
import { addElapsed, markRoundRecorded } from "../features/trainingSlice";
import { addFicheReview } from "../database/fiche";

const FLUSH_MS = 10000;

/**
 * Temps de révision d'une session (cartes ou QCM) et statistiques de la fiche.
 * - Pendant un tour (`isRunning`), le temps écoulé est ajouté à la session : pauses,
 *   autre page ou appli en arrière-plan ne comptent pas. Ajouté par paquets (et à la
 *   sortie) pour survivre à un rechargement.
 * - Tour fini (`isRoundOver`) : +1 tour et son temps enregistrés dans la fiche, une seule fois.
 */
export function useTrainingTime(ficheId, isRunning, isRoundOver) {
  const dispatch = useDispatch();
  const store = useStore();

  useEffect(() => {
    if (!isRunning) return;
    let startedAt = document.visibilityState === "visible" ? Date.now() : null;

    const flush = () => {
      if (startedAt === null) return;
      const now = Date.now();
      dispatch(addElapsed(now - startedAt));
      startedAt = now;
    };
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        flush();
        startedAt = null;
      } else startedAt = Date.now();
    };

    const interval = setInterval(flush, FLUSH_MS);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [isRunning, dispatch]);

  // Lu dans le store (et non le rendu) : le dernier temps vient d'être ajouté par le nettoyage ci-dessus
  useEffect(() => {
    if (!isRoundOver) return;
    const { roundRecorded, roundElapsedMs } = store.getState().training;
    if (roundRecorded) return;
    dispatch(markRoundRecorded());
    addFicheReview(ficheId, roundElapsedMs);
  }, [isRoundOver, ficheId, store, dispatch]);
}
