import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useLiveQuery } from "dexie-react-hooks";
import { useDisclosure } from "@heroui/react";
import { ArrowLeftRight, BadgeCheck } from "lucide-react";
import { getFiche } from "../database/fiche";
import { getSelectedFlashcards, toggleStatusFlashcard } from "../database/flashcard";
import {
  clearTraining,
  deselectWord,
  flipCard,
  incrementCurrentIndex,
  nextRoundTraining,
  removeTrainingCard,
  reverseCard,
  startTraining,
  updateTrainingCard,
} from "../features/trainingSlice";
import PageStub from "../componnents/common/PageStub";
import ModalConfirm from "../componnents/common/ModalConfirm";
import { showAlert } from "../features/alertSlice";
import { isTutorialPending } from "../utils/onboarding";
import { useTrainingTime } from "../utils/useTrainingTime";
import DropdownMenuTrainingCard from "../componnents/DropdownMenuTrainingCard";
import TrainingHeader from "../componnents/TrainingHeader";
import TrainingRoundOver from "../componnents/TrainingRoundOver";
import { shuffle } from "../utils/training";

export default function Training() {
  const { id } = useParams();
  const ficheId = Number(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const training = useSelector((state) => state.training);
  const { flashcards, currentIndex, isFliped, isReversed, tours, deselectWords, totalDeselectWords } = training;
  const currentCard = flashcards[currentIndex];
  const isSessionReady = training.ficheId === ficheId && training.mode === "cards";

  const fiche = useLiveQuery(async () => (await getFiche(ficheId)) ?? null, [ficheId]);
  const remainingCards = useLiveQuery(() => getSelectedFlashcards(ficheId), [ficheId]);

  // Temps de révision (hors pauses) et statistiques de la fiche à la fin de chaque tour
  const isRoundRunning = isSessionReady && !!fiche && !!currentCard;
  const isRoundFinished = isSessionReady && !!fiche && flashcards.length > 0 && !currentCard;
  useTrainingTime(ficheId, isRoundRunning, isRoundFinished);

  const quittingRef = useRef(false);
  const busyRef = useRef(false);

  // Démarrage (ou reprise) de la session pour cette fiche
  useEffect(() => {
    if (quittingRef.current || !fiche) return;
    if (isSessionReady) return;

    getSelectedFlashcards(ficheId).then((cards) => {
      dispatch(startTraining({ ficheId, flashcards: shuffle(cards) }));
    });
  }, [fiche, ficheId, isSessionReady, dispatch]);

  const quit = () => {
    quittingRef.current = true;
    // Première révision du tutoriel terminée : on finit par le récap
    navigate(isTutorialPending() ? "/premiers-pas/fin" : `/fiche/${ficheId}`);
    dispatch(clearTraining());
  };

  // Quitter en plein tour demande confirmation (la position dans le tour est perdue)
  const { isOpen: isOpenQuit, onOpen: onOpenQuit, onOpenChange: onOpenChangeQuit } = useDisclosure();
  const requestQuit = () => {
    // Première révision du tutoriel : quitter = pause. La séance est gardée et
    // l'accueil (toujours verrouillé) propose de la reprendre.
    if (isTutorialPending()) {
      navigate("/");
      return;
    }
    // Même règle en cartes et en QCM : confirmation tant qu'un tour est en cours
    if (currentCard) onOpenQuit();
    else quit();
  };

  const finish = () => {
    // Première révision du tutoriel : pas de notification, elle masquerait le récap
    if (isTutorialPending()) {
      quit();
      return;
    }
    const plural = totalDeselectWords > 1 ? "s" : "";
    dispatch(
      showAlert({
        message: `Session terminée : ${totalDeselectWords} carte${plural} maîtrisée${plural}. Bravo !`,
        type: "success",
      }),
    );
    quit();
  };

  // Clic sur la carte : recto → verso, puis verso → carte suivante
  const pressCard = () => {
    if (!currentCard || busyRef.current) return;
    if (!isFliped) {
      dispatch(flipCard(true));
      return;
    }
    dispatch(flipCard(false));
    dispatch(incrementCurrentIndex());
  };

  // Écrit en base : on bloque les doubles appuis pendant l'écriture
  const master = async () => {
    if (!currentCard || !isFliped || busyRef.current) return;
    busyRef.current = true;
    try {
      await toggleStatusFlashcard(currentCard.id, currentCard.desactive);
      dispatch(deselectWord());
      dispatch(flipCard(false));
      dispatch(incrementCurrentIndex());
    } finally {
      busyRef.current = false;
    }
  };

  const startNextRound = () => {
    dispatch(nextRoundTraining(shuffle(remainingCards)));
  };

  if (fiche === null) {
    return <PageStub title="Fiche introuvable" description="Elle a peut-être été supprimée." />;
  }
  if (!fiche || !isSessionReady) return null;

  // Aucune carte à réviser au démarrage
  if (flashcards.length === 0) {
    return (
      <div className="neu-raised neu-shape-card mx-auto mt-6 flex max-w-lg flex-col items-center gap-4 p-6 text-center">
        <p className="text-neutral-600 dark:text-neutral-300">
          Aucune carte à réviser dans cette fiche.
        </p>
        <button
          type="button"
          onClick={quit}
          className="neu-btn neu-shape-control neu-focusable px-4 py-2 text-sm font-medium text-primary"
        >
          Retour à la fiche
        </button>
      </div>
    );
  }

  const isRoundOver = !currentCard;
  const shownFace = isReversed !== isFliped ? "back" : "front";

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <TrainingHeader
        ficheName={fiche.name}
        label="Révision"
        tours={tours}
        totalDeselectWords={totalDeselectWords}
        currentIndex={currentIndex}
        total={flashcards.length}
        onQuit={requestQuit}
        isPause={isTutorialPending()}
      />

      {isRoundOver ? (
        <TrainingRoundOver
          remainingCount={remainingCards?.length}
          tours={tours}
          deselectWords={deselectWords}
          totalDeselectWords={totalDeselectWords}
          roundSize={flashcards.length}
          roundDuration={training.roundElapsedMs}
          sessionDuration={training.sessionElapsedMs}
          // Première révision du tutoriel : un seul tour, puis le récap
          onNextRound={isTutorialPending() ? undefined : startNextRound}
          finishHint={isTutorialPending() ? "Un dernier écran pour te présenter l'appli, puis c'est à toi." : undefined}
          onFinish={finish}
        />
      ) : (
        <>
          {/* Carte courante (le menu ⋯ est posé par-dessus, hors du bouton) */}
          <div className="relative">
            <button
              type="button"
              onClick={pressCard}
              className={`neu-raised neu-shape-card neu-focusable flex min-h-64 w-full flex-col items-center justify-center gap-3 p-6 text-center transition-transform active:scale-[0.99] ${
                isFliped ? "ring-1 ring-primary/30" : ""
              }`}
            >
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                {shownFace === "front" ? "Recto" : "Verso"}
              </span>
              <span className="whitespace-pre-line break-words text-3xl font-medium text-neutral-800 dark:text-neutral-100">
                {shownFace === "front" ? currentCard.frontCard : currentCard.backCard}
              </span>
              {/* Consigne : « touche » sur téléphone, « clique » sur ordinateur */}
              <span className="text-xs text-neutral-400 sm:hidden">
                {isFliped ? "Touche la carte pour passer à la suivante" : "Touche la carte pour la retourner"}
              </span>
              <span className="hidden text-xs text-neutral-400 sm:inline">
                {isFliped ? "Clique sur la carte pour passer à la suivante" : "Clique sur la carte pour la retourner"}
              </span>
            </button>
            <div className="absolute right-3 top-3">
              <DropdownMenuTrainingCard
                flashcard={currentCard}
                onEdited={(card) => dispatch(updateTrainingCard(card))}
                onDeleted={(id) => dispatch(removeTrainingCard(id))}
              />
            </div>
          </div>

          {/* Seule réponse possible une fois la carte retournée */}
          {isFliped && (
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={master}
                className="neu-btn neu-shape-control neu-focusable flex w-full items-center justify-center gap-2 py-3 font-semibold text-success"
              >
                <BadgeCheck size={18} />
                Je maîtrise cette carte
              </button>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Elle n'apparaîtra plus dans l'entraînement.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => dispatch(reverseCard())}
            className="neu-focusable mx-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-500 hover:text-primary dark:text-neutral-400"
          >
            <ArrowLeftRight size={14} />
            {isReversed ? "Verso → Recto" : "Recto → Verso"}
          </button>
        </>
      )}

      <ModalConfirm
        isOpen={isOpenQuit}
        onOpenChange={onOpenChangeQuit}
        message="Quitter la révision ? Les cartes marquées « maîtrisées » restent enregistrées, mais ta progression dans ce tour sera perdue."
        confirmLabel="Quitter"
        onConfirm={quit}
      />
    </div>
  );
}
