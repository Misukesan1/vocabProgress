import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useLiveQuery } from "dexie-react-hooks";
import { useDisclosure } from "@heroui/react";
import { ArrowLeftRight, ArrowRight, BadgeCheck } from "lucide-react";
import { getFiche } from "../database/fiche";
import { getFlashcardsFromFiche, toggleStatusFlashcard } from "../database/flashcard";
import {
  answerQuiz,
  clearTraining,
  deselectWord,
  incrementCurrentIndex,
  nextRoundTraining,
  removeTrainingCard,
  reverseCard,
  setQuizQuestion,
  startTraining,
  updateTrainingCard,
} from "../features/trainingSlice";
import { showAlert } from "../features/alertSlice";
import PageStub from "../componnents/common/PageStub";
import ModalConfirm from "../componnents/common/ModalConfirm";
import DropdownMenuTrainingCard from "../componnents/DropdownMenuTrainingCard";
import TrainingHeader from "../componnents/TrainingHeader";
import TrainingRoundOver from "../componnents/TrainingRoundOver";
import { buildQuizChoices, QUIZ_MIN_CARDS, shuffle } from "../utils/training";

/**
 * Entraînement en QCM : une carte d'un côté, 6 réponses de l'autre côté
 * (la bonne + 5 leurres de la même fiche). Après la réponse, toutes les
 * réponses se retournent et montrent leurs deux faces : la bonne entourée
 * de vert, l'erreur éventuelle de rouge. Mêmes tours que l'entraînement par cartes.
 */
export default function TrainingQuiz() {
  const { id } = useParams();
  const ficheId = Number(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const training = useSelector((state) => state.training);
  const {
    flashcards,
    currentIndex,
    isReversed,
    tours,
    deselectWords,
    totalDeselectWords,
    quizCardId,
    quizChoiceIds,
    quizAnswerId,
    quizCorrect,
  } = training;
  const currentCard = flashcards[currentIndex];
  const isSessionReady = training.ficheId === ficheId && training.mode === "quiz";

  const fiche = useLiveQuery(async () => (await getFiche(ficheId)) ?? null, [ficheId]);
  // Toutes les cartes de la fiche (maîtrisées comprises) : réserve de leurres
  const ficheCards = useLiveQuery(() => getFlashcardsFromFiche(ficheId), [ficheId]);
  const remainingCards = ficheCards?.filter((card) => !card.desactive);
  const hasEnoughCards = (ficheCards?.length ?? 0) >= QUIZ_MIN_CARDS;

  const [sessionStart] = useState(() => Date.now());
  const quittingRef = useRef(false);
  const busyRef = useRef(false);

  // Démarrage (ou reprise) de la session QCM pour cette fiche
  useEffect(() => {
    if (quittingRef.current || !fiche || !ficheCards || isSessionReady) return;
    if (ficheCards.length < QUIZ_MIN_CARDS) return;
    dispatch(
      startTraining({ ficheId, flashcards: shuffle(ficheCards.filter((card) => !card.desactive)), mode: "quiz" }),
    );
  }, [fiche, ficheCards, ficheId, isSessionReady, dispatch]);

  // Nouvelle question à chaque nouvelle carte (et après inversion recto / verso)
  useEffect(() => {
    if (!isSessionReady || !currentCard || !ficheCards || quizCardId === currentCard.id) return;
    const choices = buildQuizChoices(currentCard, ficheCards, isReversed);
    dispatch(setQuizQuestion({ cardId: currentCard.id, choiceIds: choices.map((card) => card.id) }));
  }, [isSessionReady, currentCard, ficheCards, quizCardId, isReversed, dispatch]);

  const quit = () => {
    quittingRef.current = true;
    navigate(`/fiche/${ficheId}`);
    dispatch(clearTraining());
  };

  // Quitter en plein tour demande confirmation (la position dans le tour est perdue)
  const { isOpen: isOpenQuit, onOpen: onOpenQuit, onOpenChange: onOpenChangeQuit } = useDisclosure();
  const requestQuit = () => {
    if (currentCard && currentIndex > 0) onOpenQuit();
    else quit();
  };

  const finish = () => {
    const plural = totalDeselectWords > 1 ? "s" : "";
    dispatch(
      showAlert({
        message: `Session terminée : ${totalDeselectWords} carte${plural} maîtrisée${plural}. Bravo !`,
        type: "success",
      }),
    );
    quit();
  };

  const isAnswered = quizAnswerId !== null;

  const answer = (cardId) => {
    if (isAnswered) return;
    dispatch(answerQuiz(cardId));
  };

  const next = () => {
    if (!isAnswered || busyRef.current) return;
    dispatch(incrementCurrentIndex());
  };

  // Écrit en base : on bloque les doubles appuis pendant l'écriture
  const master = async () => {
    if (!currentCard || !isAnswered || busyRef.current) return;
    busyRef.current = true;
    try {
      await toggleStatusFlashcard(currentCard.id, currentCard.desactive);
      dispatch(deselectWord());
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
  if (!fiche || !ficheCards) return null;

  // Pas assez de cartes pour proposer 6 réponses (hors session déjà lancée)
  if (!isSessionReady && !hasEnoughCards) {
    return (
      <EmptyState
        message={`Le QCM demande au moins ${QUIZ_MIN_CARDS} cartes dans la fiche (${ficheCards.length} pour l'instant).`}
        onBack={quit}
      />
    );
  }
  if (!isSessionReady) return null;

  // Aucune carte à réviser au démarrage
  if (flashcards.length === 0) {
    return <EmptyState message="Aucune carte à réviser dans cette fiche." onBack={quit} />;
  }

  const isRoundOver = !currentCard;
  // Version à jour des cartes (modifiées pendant la session), sinon la copie de la session
  const cardsById = Object.fromEntries(ficheCards.map((card) => [card.id, card]));
  const question = currentCard && (cardsById[currentCard.id] ?? currentCard);
  const choices = quizCardId === currentCard?.id ? quizChoiceIds.map((choiceId) => cardsById[choiceId]).filter(Boolean) : [];

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <TrainingHeader
        ficheName={fiche.name}
        label="QCM"
        tours={tours}
        totalDeselectWords={totalDeselectWords}
        currentIndex={currentIndex}
        total={flashcards.length}
        onQuit={requestQuit}
      />

      {isRoundOver ? (
        <TrainingRoundOver
          remainingCount={remainingCards.length}
          tours={tours}
          deselectWords={deselectWords}
          totalDeselectWords={totalDeselectWords}
          roundSize={flashcards.length}
          sessionStart={sessionStart}
          score={
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {quizCorrect} bonne{quizCorrect > 1 ? "s" : ""} réponse{quizCorrect > 1 ? "s" : ""} sur{" "}
              {flashcards.length}
            </p>
          }
          onNextRound={startNextRound}
          onFinish={finish}
        />
      ) : (
        <>
          {/* Question (le menu ⋯ est posé par-dessus) */}
          <div className="relative">
            <div className="neu-raised neu-shape-card flex min-h-40 w-full flex-col items-center justify-center gap-2 p-6 text-center">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                {isReversed ? "Verso" : "Recto"}
              </span>
              <span className="whitespace-pre-line break-words text-3xl font-medium text-neutral-800 dark:text-neutral-100">
                {isReversed ? question.backCard : question.frontCard}
              </span>
            </div>
            <div className="absolute right-3 top-3">
              <DropdownMenuTrainingCard
                flashcard={currentCard}
                onEdited={(card) => dispatch(updateTrainingCard(card))}
                onDeleted={(cardId) => dispatch(removeTrainingCard(cardId))}
              />
            </div>
          </div>

          {/* Réponses */}
          <div className="grid grid-cols-2 gap-3">
            {choices.map((choice) => (
              <QuizChoice
                key={`${choice.id}-${isAnswered}`}
                card={choice}
                isReversed={isReversed}
                isAnswered={isAnswered}
                isCorrect={choice.id === quizCardId}
                isPicked={choice.id === quizAnswerId}
                onPick={() => answer(choice.id)}
              />
            ))}
          </div>

          {isAnswered ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                autoFocus
                onClick={next}
                className="neu-btn neu-shape-control neu-focusable flex items-center justify-center gap-2 py-3 font-semibold text-primary"
              >
                Suivant
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                onClick={master}
                className="neu-btn neu-shape-control neu-focusable flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-success"
              >
                <BadgeCheck size={17} />
                Je maîtrise cette carte
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => dispatch(reverseCard())}
              className="neu-focusable mx-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-500 hover:text-primary dark:text-neutral-400"
            >
              <ArrowLeftRight size={14} />
              {isReversed ? "Verso → Recto" : "Recto → Verso"}
            </button>
          )}
        </>
      )}

      <ModalConfirm
        isOpen={isOpenQuit}
        onOpenChange={onOpenChangeQuit}
        message="Quitter la révision ? Les cartes marquées « maîtrisées » restent enregistrées, mais le tour en cours sera perdu."
        confirmLabel="Quitter"
        onConfirm={quit}
      />
    </div>
  );
}

/**
 * Une réponse du QCM. Avant la réponse : la face à deviner, cliquable.
 * Après : la carte retournée montre ses deux faces (recto en grand),
 * la bonne réponse entourée de vert, la réponse choisie (si fausse) de rouge.
 */
function QuizChoice({ card, isReversed, isAnswered, isCorrect, isPicked, onPick }) {
  if (!isAnswered) {
    return (
      <button
        type="button"
        onClick={onPick}
        className="neu-btn neu-shape-control neu-focusable flex min-h-20 cursor-pointer items-center justify-center whitespace-pre-line break-words p-3 text-center text-neutral-800 transition-all active:scale-[0.97] dark:text-neutral-100"
      >
        <span className={isReversed ? "text-2xl font-medium" : "text-sm font-medium"}>
          {isReversed ? card.frontCard : card.backCard}
        </span>
      </button>
    );
  }

  const ring = isCorrect ? "ring-2 ring-success" : isPicked ? "ring-2 ring-danger" : "opacity-60";

  return (
    <div
      className={`quiz-flip neu-raised-sm neu-shape-control flex min-h-20 flex-col items-center justify-center gap-1 whitespace-pre-line break-words p-3 text-center ${ring}`}
    >
      <span className="text-xl font-medium text-neutral-800 dark:text-neutral-100">{card.frontCard}</span>
      <span className="text-xs text-neutral-600 dark:text-neutral-300">{card.backCard}</span>
    </div>
  );
}

function EmptyState({ message, onBack }) {
  return (
    <div className="neu-raised neu-shape-card mx-auto mt-6 flex max-w-lg flex-col items-center gap-4 p-6 text-center">
      <p className="text-neutral-600 dark:text-neutral-300">{message}</p>
      <button
        type="button"
        onClick={onBack}
        className="neu-btn neu-shape-control neu-focusable px-4 py-2 text-sm font-medium text-primary"
      >
        Retour à la fiche
      </button>
    </div>
  );
}
