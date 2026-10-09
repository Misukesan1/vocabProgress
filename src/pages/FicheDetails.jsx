import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useLiveQuery } from "dexie-react-hooks";
import { useDisclosure } from "@heroui/react";
import { ArrowLeft, Clock, ListChecks, Play, Plus, RotateCw } from "lucide-react";
import { getFiche } from "../database/fiche";
import { getProfile } from "../database/profile";
import { getFlashcardsFromFiche } from "../database/flashcard";
import { selectProfile } from "../features/profileSlice";
import { selectFiche } from "../features/ficheSlice";
import { clearTraining, trainingPath } from "../features/trainingSlice";
import { formatTotalDuration, QUIZ_MIN_CARDS } from "../utils/training";
import PageStub from "../componnents/common/PageStub";
import DropdownMenuFiche from "../componnents/DropdownMenuFiche";
import FlashcardFilter from "../componnents/FlashcardFilter";
import FlashcardRow from "../componnents/FlashcardRow";
import ModalConfirm from "../componnents/common/ModalConfirm";
import ModalFlashcard from "../componnents/ModalFlashcard";

export default function FicheDetails() {
  const { id } = useParams();
  const ficheId = Number(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);
  // Session non quittée sur cette fiche : le bouton la reprend (progression gardée)
  const training = useSelector((state) => state.training);
  const hasSessionInProgress = training.ficheId === ficheId;
  const trainingMode = training.mode;
  // Session non quittée sur une autre fiche : lancer ici la remplacerait
  const otherSessionFiche = useLiveQuery(
    async () => (training.ficheId && training.ficheId !== ficheId ? ((await getFiche(training.ficheId)) ?? null) : null),
    [training.ficheId, ficheId],
  );

  // null = fiche introuvable, undefined = chargement
  const fiche = useLiveQuery(async () => (await getFiche(ficheId)) ?? null, [ficheId]);
  const flashcards = useLiveQuery(() => getFlashcardsFromFiche(ficheId), [ficheId]);

  const [filterValue, setFilterValue] = useState("all");
  const [editedFlashcard, setEditedFlashcard] = useState(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [pendingMode, setPendingMode] = useState(null);
  const { isOpen: isOpenReplace, onOpen: onOpenReplace, onOpenChange: onOpenChangeReplace } = useDisclosure();

  // Ouvrir une fiche (lien direct, reprise d'entraînement...) active sa collection
  useEffect(() => {
    if (!fiche) return;
    dispatch(selectFiche(fiche));
    if (selectedProfile?.id !== fiche.profileId) {
      getProfile(fiche.profileId).then((profile) => profile && dispatch(selectProfile(profile)));
    }
  }, [fiche, selectedProfile?.id, dispatch]);

  if (fiche === null) {
    return <PageStub title="Fiche introuvable" description="Elle a peut-être été supprimée." />;
  }
  if (!fiche || !flashcards) return null;

  const activeCards = flashcards.filter((card) => !card.desactive);
  const masteredCards = flashcards.filter((card) => card.desactive);
  const counts = { all: flashcards.length, "a-reviser": activeCards.length, maitrisees: masteredCards.length };

  const filteredFlashcards = flashcards.filter((card) => {
    if (filterValue === "a-reviser") return !card.desactive;
    if (filterValue === "maitrisees") return card.desactive;
    return true;
  });

  // Nouvelle révision : si une autre est en cours (ici ou sur une autre fiche), elle serait
  // remplacée, donc on demande confirmation
  const launch = (mode) => {
    if (training.ficheId) {
      setPendingMode(mode);
      onOpenReplace();
    } else navigate(trainingPath(ficheId, mode));
  };

  const confirmReplace = () => {
    dispatch(clearTraining());
    navigate(trainingPath(ficheId, pendingMode));
  };

  const sessionPosition = `tour ${training.tours + 1} · carte ${Math.min(training.currentIndex + 1, training.flashcards.length)} sur ${training.flashcards.length}`;

  const openFlashcardModal = (flashcard) => {
    setEditedFlashcard(flashcard);
    onOpen();
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <button
        type="button"
        onClick={() => navigate("/fiches")}
        className="neu-focusable -mb-2 flex w-fit items-center gap-1.5 rounded-md px-1 text-sm font-medium text-neutral-500 hover:text-primary dark:text-neutral-400"
      >
        <ArrowLeft size={16} />
        {selectedProfile?.name ?? "Collections"}
      </button>

      {/* En-tête de la fiche + lancement de la révision */}
      <section className="neu-raised neu-shape-card flex flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="break-words text-xl font-semibold text-neutral-800 dark:text-neutral-100">
              {fiche.name}
            </h2>
            {fiche.description && (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{fiche.description}</p>
            )}
          </div>
          <DropdownMenuFiche fiche={fiche} flashcards={flashcards} />
        </div>

        <div className="grid grid-cols-2 text-center">
          <div>
            <p className="text-xl font-semibold text-primary">{activeCards.length}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">À réviser</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-success">{masteredCards.length}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Maîtrisées</p>
          </div>
        </div>

        {/* Statistiques de révision : tours terminés et temps cumulé (pauses exclues) */}
        <div className="neu-pressed neu-shape-control grid grid-cols-2 gap-2 px-3 py-2.5 text-center">
          <div className="flex flex-col items-center gap-0.5">
            <p className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-100">
              <RotateCw size={14} className="text-neutral-400" />
              {fiche.reviewRounds ?? 0}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Révision{(fiche.reviewRounds ?? 0) > 1 ? "s" : ""} terminée{(fiche.reviewRounds ?? 0) > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <p className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-100">
              <Clock size={14} className="text-neutral-400" />
              {formatTotalDuration(fiche.reviewTimeMs)}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Temps de révision</p>
          </div>
        </div>

        {activeCards.length > 0 && hasSessionInProgress && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => navigate(trainingPath(ficheId, trainingMode))}
              className="neu-btn neu-shape-control neu-focusable flex items-center justify-center gap-2 py-3 font-semibold text-primary"
            >
              <Play size={18} />
              Reprendre la révision en cours{trainingMode === "quiz" ? " (QCM)" : ""}
            </button>
            {/* Changer de mode / repartir de zéro : la révision en cours est abandonnée */}
            <p className="flex flex-wrap items-center justify-center gap-x-1 text-center text-xs text-neutral-500 dark:text-neutral-400">
              Ou recommencer à zéro :
              <button
                type="button"
                onClick={() => launch("cards")}
                className="neu-focusable rounded-md px-1 font-medium text-primary"
              >
                Cartes
              </button>
              ·
              <button
                type="button"
                onClick={() => launch("quiz")}
                disabled={flashcards.length < QUIZ_MIN_CARDS}
                className="neu-focusable rounded-md px-1 font-medium text-primary disabled:opacity-40"
              >
                QCM
              </button>
            </p>
          </div>
        )}

        {/* Lancer une révision : cartes à retourner, ou QCM (assez de cartes pour 6 réponses) */}
        {activeCards.length > 0 && !hasSessionInProgress && (
          <div className="flex flex-col gap-2">
            {otherSessionFiche && (
              <p className="flex flex-wrap items-center justify-center gap-x-1 text-center text-xs text-warning-600 dark:text-warning">
                Révision en cours sur « {otherSessionFiche.name} » ({sessionPosition}).
                <button
                  type="button"
                  onClick={() => navigate(trainingPath(training.ficheId, training.mode))}
                  className="neu-focusable rounded-md px-1 font-medium text-primary"
                >
                  La reprendre
                </button>
              </p>
            )}
            <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
              Réviser {activeCards.length} carte{activeCards.length > 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => launch("cards")}
                className="neu-btn neu-shape-control neu-focusable flex items-center justify-center gap-2 py-3 font-semibold text-primary"
              >
                <Play size={18} />
                Cartes
              </button>
              <button
                type="button"
                disabled={flashcards.length < QUIZ_MIN_CARDS}
                onClick={() => launch("quiz")}
                className="neu-btn neu-shape-control neu-focusable flex items-center justify-center gap-2 py-3 font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ListChecks size={18} />
                QCM
              </button>
            </div>
            {flashcards.length < QUIZ_MIN_CARDS && (
              <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                QCM disponible à partir de {QUIZ_MIN_CARDS} cartes dans la fiche.
              </p>
            )}
          </div>
        )}

        {activeCards.length === 0 && (
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            {flashcards.length === 0
              ? "Ajoute des cartes pour pouvoir réviser cette fiche."
              : "Toutes les cartes sont maîtrisées. Remets-les en révision depuis le menu ⋯"}
          </p>
        )}
      </section>

      {/* Cartes de la fiche */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-200">Cartes</h2>
          <button
            type="button"
            onClick={() => openFlashcardModal(null)}
            className="neu-btn neu-shape-control neu-focusable flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary"
          >
            <Plus size={14} />
            Nouvelle carte
          </button>
        </div>

        {flashcards.length === 0 ? (
          <div className="neu-raised neu-shape-card flex flex-col items-center gap-3 p-6 text-center text-neutral-600 dark:text-neutral-300">
            Aucune carte dans cette fiche.
            <button
              type="button"
              onClick={() => openFlashcardModal(null)}
              className="neu-btn neu-shape-control neu-focusable flex items-center gap-1 px-4 py-2 text-sm font-medium text-primary"
            >
              <Plus size={16} />
              Ajouter mes premières cartes
            </button>
          </div>
        ) : (
          <>
            <FlashcardFilter
              filter={filterValue}
              onFilterChange={setFilterValue}
              counts={counts}
            />
            <div className="flex flex-col gap-2">
              {filteredFlashcards.map((flashcard) => (
                <FlashcardRow key={flashcard.id} flashcard={flashcard} onEdit={() => openFlashcardModal(flashcard)} />
              ))}
              {filteredFlashcards.length === 0 && (
                <p className="py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">Aucune carte trouvée.</p>
              )}
            </div>
          </>
        )}
      </section>

      <ModalConfirm
        isOpen={isOpenReplace}
        onOpenChange={onOpenChangeReplace}
        message={
          hasSessionInProgress
            ? `Recommencer à zéro ? Ta révision en cours sur cette fiche (${sessionPosition}) sera perdue. Les cartes déjà maîtrisées le restent.`
            : `Une révision est en cours sur « ${otherSessionFiche?.name ?? "une autre fiche"} » (${sessionPosition}). La remplacer par une révision de « ${fiche.name} » ? Les cartes déjà maîtrisées le restent.`
        }
        confirmLabel={hasSessionInProgress ? "Recommencer" : "Remplacer"}
        onConfirm={confirmReplace}
      />

      <ModalFlashcard
        key={`flashcard-${editedFlashcard?.id ?? "new"}-${isOpen}`}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        flashcard={editedFlashcard}
        ficheId={ficheId}
      />
    </div>
  );
}
