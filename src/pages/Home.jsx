import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useDisclosure } from "@heroui/react";
import { ChevronRight, CircleHelp, Lock, Play, Plus } from "lucide-react";
import { getProfiles } from "../database/profile";
import { getFiche, getFichesFromProfile } from "../database/fiche";
import { getFicheProgress } from "../database/flashcard";
import { trainingPath } from "../features/trainingSlice";
import CollectionTile from "../componnents/CollectionTile";
import FicheTile from "../componnents/FicheTile";
import ModalProfile from "../componnents/ModalProfile";
import ModalFiche from "../componnents/ModalFiche";
import Welcome from "../componnents/Welcome";
import { isTutorialPending, useInTutorial, useTutorialSkipped } from "../utils/onboarding";

const plural = (count, word) => `${count} ${word}${count > 1 ? "s" : ""}`;

/**
 * Accueil : reprendre / lancer la révision en un geste, puis la collection
 * sélectionnée (ruban des collections + grille de ses fiches).
 */
export default function Home() {
  const navigate = useNavigate();
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);
  const selectedFiche = useSelector((state) => state.fiche.selectedFiche);
  const training = useSelector((state) => state.training);
  const inTutorial = useInTutorial();
  const tutorialSkipped = useTutorialSkipped();

  const collections = useLiveQuery(() => getProfiles());
  const fiches = useLiveQuery(
    () => (selectedProfile ? getFichesFromProfile(selectedProfile.id) : []),
    [selectedProfile?.id],
  );
  const trainingFiche = useLiveQuery(
    async () => (training.ficheId ? ((await getFiche(training.ficheId)) ?? null) : null),
    [training.ficheId],
  );
  const selectedProgress = useLiveQuery(
    () => (selectedFiche ? getFicheProgress(selectedFiche.id) : null),
    [selectedFiche?.id],
  );

  const { isOpen: isOpenCollection, onOpen: onOpenCollection, onOpenChange: onOpenChangeCollection } = useDisclosure();
  const { isOpen: isOpenFiche, onOpen: onOpenFiche, onOpenChange: onOpenChangeFiche } = useDisclosure();

  if (!collections) return null;

  // Tutoriel pas fini (premiers pas quittés avec la croix, ou première révision mise
  // en pause) : la grande carte « Premiers pas » y ramène
  const resumeOnboarding = !tutorialSkipped && isTutorialPending();
  const tutorialSession = resumeOnboarding && training.ficheId && trainingFiche;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-7">
      {/* Première utilisation : bienvenue, sauf si le tutoriel a été passé */}
      {collections.length === 0 && !tutorialSkipped ? (
        <Welcome onStart={() => navigate("/premiers-pas")} />
      ) : (
        <>
          {/* En-tête du jour */}
          <section className="px-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Aujourd'hui</p>
            <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Bonjour</h2>
          </section>

          {/* Premiers pas interrompus : on propose de reprendre, à la révision si elle est commencée */}
          {resumeOnboarding &&
            (tutorialSession ? (
              <HeroButton
                label="Premiers pas"
                title="Reprends ta première révision"
                detail={`${trainingFiche.name} · carte ${Math.min(training.currentIndex + 1, training.flashcards.length)} sur ${training.flashcards.length}`}
                progress={training.flashcards.length ? training.currentIndex / training.flashcards.length : 0}
                onClick={() => navigate(trainingPath(training.ficheId, training.mode))}
              />
            ) : (
              <HeroButton
                label="Premiers pas"
                title="Termine ta mise en route"
                detail="Encore quelques étapes et ta première révision."
                icon={<ChevronRight size={18} />}
                onClick={() => navigate("/premiers-pas")}
              />
            ))}

          {!resumeOnboarding && <ResumeCard
            training={training}
            trainingFiche={trainingFiche}
            selectedProfile={selectedProfile}
            selectedFiche={selectedFiche}
            selectedProgress={selectedProgress}
            hasCollections={collections.length > 0}
            navigate={navigate}
          />}

          {/* Tutoriel pas fini (premiers pas quittés avec la croix, première révision
              en cours) : collections et fiches inactives, sinon on contournerait le
              verrouillage des menus. Seule la grande carte ci-dessus permet de continuer. */}
          {inTutorial && (
            <p className="-mb-4 flex items-center justify-center gap-1.5 px-1 text-center text-xs text-neutral-500 dark:text-neutral-400">
              <Lock size={13} className="shrink-0" />
              Le reste de l'appli se débloque à la fin de ta première révision.
            </p>
          )}
          <div
            inert={inTutorial}
            className={`flex flex-col gap-7 transition-opacity ${inTutorial ? "opacity-40" : ""}`}
          >
            {/* Ruban des collections */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-200">Mes collections</h3>
                <Link to="/fiches" className="neu-focusable rounded-md px-1 text-sm font-medium text-primary">
                  Tout voir
                </Link>
              </div>
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {collections.map((collection) => (
                  <CollectionTile key={collection.id} collection={collection} />
                ))}
                <button
                  type="button"
                  onClick={onOpenCollection}
                  aria-label="Nouvelle collection"
                  className="neu-btn neu-shape-card neu-focusable flex w-20 shrink-0 flex-col items-center justify-center gap-1 text-xs font-medium text-primary"
                >
                  <Plus size={20} />
                  Nouvelle
                </button>
              </div>
            </section>

            {/* Fiches de la collection sélectionnée */}
            {selectedProfile ? (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="min-w-0 truncate text-base font-semibold text-neutral-700 dark:text-neutral-200">
                    Fiches · {selectedProfile.name}
                  </h3>
                  <button
                    type="button"
                    onClick={onOpenFiche}
                    className="neu-btn neu-shape-control neu-focusable flex shrink-0 items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary"
                  >
                    <Plus size={14} />
                    Nouvelle fiche
                  </button>
                </div>
                {fiches?.length === 0 ? (
                  <p className="neu-raised neu-shape-card p-5 text-center text-sm text-neutral-600 dark:text-neutral-300">
                    Aucune fiche dans cette collection. Crée-en une pour y ajouter tes cartes.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {fiches?.map((fiche) => (
                      <FicheTile key={fiche.id} fiche={fiche} />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <p className="px-1 text-center text-sm text-neutral-500 dark:text-neutral-400">
                Choisis une collection pour voir ses fiches.
              </p>
            )}

            <Link
              to="/aide"
              className="neu-focusable mx-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-500 hover:text-primary dark:text-neutral-400"
            >
              <CircleHelp size={14} />
              Comment ça marche ?
            </Link>
          </div>
        </>
      )}

      <ModalProfile
        key={`home-new-collection-${isOpenCollection}`}
        isOpen={isOpenCollection}
        onOpenChange={onOpenChangeCollection}
        isNewProfile={true}
      />
      <ModalFiche key={`home-new-fiche-${isOpenFiche}`} isOpen={isOpenFiche} onOpenChange={onOpenChangeFiche} />
    </div>
  );
}

/**
 * Grande carte d'action : reprendre la session en cours, sinon réviser la
 * fiche sélectionnée (lancement explicite par l'utilisateur).
 */
function ResumeCard({
  training,
  trainingFiche,
  selectedProfile,
  selectedFiche,
  selectedProgress,
  hasCollections,
  navigate,
}) {
  // 1. Session en cours, non quittée
  if (training.ficheId && trainingFiche) {
    const total = training.flashcards.length;
    const position = Math.min(training.currentIndex, total);
    return (
      <HeroButton
        label="Reprendre"
        title={trainingFiche.name}
        detail={`${training.mode === "quiz" ? "QCM · " : ""}Tour ${training.tours + 1} · carte ${Math.min(position + 1, total)} sur ${total}`}
        progress={total ? position / total : 0}
        onClick={() => navigate(trainingPath(training.ficheId, training.mode))}
      />
    );
  }

  // 2. Fiche sélectionnée
  if (selectedFiche && selectedProgress) {
    const toReview = selectedProgress.total - selectedProgress.mastered;
    if (toReview > 0) {
      return (
        <HeroButton
          label="Réviser"
          title={selectedFiche.name}
          detail={`${plural(toReview, "carte")} à réviser sur ${selectedProgress.total}`}
          progress={selectedProgress.mastered / selectedProgress.total}
          onClick={() => navigate(`/fiche/${selectedFiche.id}/training`)}
        />
      );
    }
    return (
      <HeroButton
        label="Fiche sélectionnée"
        title={selectedFiche.name}
        detail={selectedProgress.total ? "Toutes les cartes sont maîtrisées." : "Aucune carte pour l'instant."}
        icon={<ChevronRight size={18} />}
        onClick={() => navigate(`/fiche/${selectedFiche.id}`)}
      />
    );
  }

  // 3. Rien à reprendre : on guide vers le choix d'une fiche
  return (
    <div className="neu-pressed neu-shape-card px-5 py-4 text-sm text-neutral-600 dark:text-neutral-300">
      {!hasCollections
        ? "Crée ta première collection ci-dessous, puis une fiche et ses cartes, pour commencer à réviser."
        : selectedProfile
          ? "Choisis une fiche ci-dessous pour commencer à réviser."
          : "Choisis une collection, puis une fiche, pour commencer à réviser."}
    </div>
  );
}

function HeroButton({ label, title, detail, progress, onClick, icon = <Play size={18} className="translate-x-px" /> }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="neu-raised neu-shape-card neu-focusable flex flex-col gap-3 p-5 text-left transition-transform active:scale-[0.99]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">{label}</span>
        <span className="neu-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary">
          {icon}
        </span>
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 break-words text-2xl font-semibold leading-tight text-neutral-800 dark:text-neutral-100">
          {title}
        </p>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{detail}</p>
      </div>
      {progress !== undefined && (
        <div className="neu-pressed h-2 overflow-hidden rounded-full">
          <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
    </button>
  );
}
