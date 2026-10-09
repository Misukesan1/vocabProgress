import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useLiveQuery } from "dexie-react-hooks";
import { Input } from "@heroui/react";
import { ArrowLeft, ArrowRight, Check, ListChecks, Pencil, Play, Plus, X } from "lucide-react";
import { db } from "../database/db";
import { addProfile, editProfile, getProfile } from "../database/profile";
import { addFiche, editFiche, getFiche, getFichesFromProfile } from "../database/fiche";
import { addFlashcard, deleteFlashcard, getFlashcardsFromFiche } from "../database/flashcard";
import { selectProfile } from "../features/profileSlice";
import { selectFiche } from "../features/ficheSlice";
import { trainingPath } from "../features/trainingSlice";
import { QUIZ_MIN_CARDS } from "../utils/training";
import { isTutorialPending, isTutorialSkipped, markTutorialPending } from "../utils/onboarding";
import SkipTutorialLink from "../componnents/SkipTutorialLink";

const COLLECTION_SUGGESTIONS = ["Japonais", "Anglais", "Droit civil", "Anatomie", "Histoire", "Code de la route"];
const FICHE_SUGGESTIONS = ["Chapitre 1", "Leçon 1", "Vocabulaire de base", "Dates clés", "Définitions"];
const STEPS = 3;
// Première révision : assez de cartes pour qu'elle ait du sens
const FIRST_SESSION_MIN_CARDS = 3;

// Entrée « réelle » : pas celle qui valide un caractère en cours de saisie (IME japonais, coréen...)
const isEnter = (e) => e.key === "Enter" && !e.nativeEvent.isComposing;

/**
 * Point de départ du parcours, déduit des données : on reprend là où
 * l'utilisateur s'était arrêté (collection sans fiche, fiche sans carte...).
 */
async function resolveStart(selectedProfile, selectedFiche) {
  const profile =
    (selectedProfile && (await getProfile(selectedProfile.id))) || (await db.profile.toCollection().first());
  if (!profile) return { step: 1, profile: null, fiche: null };

  const selected = selectedFiche && (await getFiche(selectedFiche.id));
  const fiche = selected?.profileId === profile.id ? selected : ((await getFichesFromProfile(profile.id))[0] ?? null);
  return { step: fiche ? 3 : 2, profile, fiche };
}

/**
 * Premiers pas : création guidée de la collection (une matière, une langue...), d'une
 * première fiche et de ses cartes, puis lancement de la première révision.
 */
export default function Onboarding() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);
  const selectedFiche = useSelector((state) => state.fiche.selectedFiche);

  const [step, setStep] = useState(null); // null = chargement
  const [profile, setProfile] = useState(null);
  const [fiche, setFiche] = useState(null);

  // Résolu une seule fois à l'ouverture (les créations suivantes pilotent le parcours).
  // Le tutoriel commence ici et ne se termine qu'au « C'est parti ! » du récap,
  // même si des cartes existent déjà entre-temps.
  useEffect(() => {
    (async () => {
      // Tutoriel déjà terminé ou passé (adresse tapée, bouton Retour...) : on ne le relance pas
      if (!isTutorialPending() && (isTutorialSkipped() || (await db.profile.count()) > 0)) {
        navigate("/", { replace: true });
        return;
      }
      markTutorialPending();
      const start = await resolveStart(selectedProfile, selectedFiche);
      setProfile(start.profile);
      setFiche(start.fiche);
      setStep(start.step);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (step === null) return null;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      {/* Progression + sortie */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Étape {step} sur {STEPS}
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: STEPS }, (_, i) => (
              <span key={i} className={`h-1.5 w-8 rounded-full ${i < step ? "bg-primary" : "neu-pressed"}`} />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="Quitter les premiers pas"
          title="Quitter (tu pourras reprendre depuis l'accueil)"
          className="neu-btn neu-focusable flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 dark:text-neutral-400"
        >
          <X size={18} />
        </button>
      </div>

      {step === 1 && (
        <CollectionStep
          profile={profile}
          onDone={(created) => {
            setProfile(created);
            dispatch(selectProfile(created));
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <FicheStep
          profile={profile}
          fiche={fiche}
          onBack={() => setStep(1)}
          onDone={(created) => {
            setFiche(created);
            dispatch(selectFiche(created));
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <CardsStep
          profile={profile}
          fiche={fiche}
          onBack={() => setStep(2)}
          onStart={(mode) => {
            navigate(trainingPath(fiche.id, mode));
          }}
        />
      )}

      {/* La croix ne fait que mettre en pause : ici, on sort vraiment du tutoriel */}
      <SkipTutorialLink />
    </div>
  );
}

function StepIntro({ title, children }) {
  return (
    <section className="flex flex-col gap-2 px-1">
      <h2 className="text-2xl font-semibold leading-tight text-neutral-800 dark:text-neutral-100">{title}</h2>
      <p className="text-neutral-600 dark:text-neutral-300">{children}</p>
    </section>
  );
}

function Suggestions({ items, onPick }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPick(item)}
          className="neu-btn neu-shape-control neu-focusable px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-200"
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function StepActions({ onBack, onNext, nextLabel = "Continuer", isBusy }) {
  return (
    <div className="flex items-center justify-between gap-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="neu-focusable flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-neutral-500 hover:text-primary dark:text-neutral-400"
        >
          <ArrowLeft size={16} />
          Retour
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={isBusy}
        className="neu-btn neu-shape-control neu-focusable flex items-center gap-2 px-5 py-3 font-semibold text-primary disabled:opacity-50"
      >
        {nextLabel}
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

/** Étape 1 : la collection = ce que l'on apprend (modifiée si on revient en arrière) */
function CollectionStep({ profile, onDone }) {
  const [name, setName] = useState(profile?.name ?? "");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const submit = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      if (profile) {
        if (name.trim() !== profile.name) await editProfile(profile.id, name);
        onDone(await getProfile(profile.id));
      } else {
        onDone(await getProfile(await addProfile(name)));
      }
    } catch (e) {
      setError(e.message);
      setIsBusy(false);
    }
  };

  return (
    <>
      <StepIntro title="Qu'est-ce que tu apprends ?">
        Une langue, une matière, un examen… Ce sera ta collection : elle regroupera toutes tes fiches sur ce sujet.
      </StepIntro>
      <Input
        autoFocus
        size="lg"
        label="Collection"
        value={name}
        onValueChange={(value) => {
          setName(value);
          setError("");
        }}
        onKeyDown={(e) => isEnter(e) && submit()}
        isInvalid={!!error}
        errorMessage={error}
        maxLength={25}
      />
      <Suggestions
        items={COLLECTION_SUGGESTIONS}
        onPick={(value) => {
          setName(value);
          setError("");
        }}
      />
      <StepActions onNext={submit} isBusy={isBusy} />
    </>
  );
}

/** Étape 2 : une première fiche dans la collection (modifiée si on revient en arrière) */
function FicheStep({ profile, fiche, onBack, onDone }) {
  const [name, setName] = useState(fiche?.name ?? "");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const submit = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      if (fiche) {
        if (name.trim() !== fiche.name) await editFiche(fiche.id, name, fiche.description, profile.id);
        onDone(await getFiche(fiche.id));
      } else {
        onDone(await getFiche(await addFiche(name, "", profile.id)));
      }
    } catch (e) {
      setError((!(e instanceof Error) && (e.name ?? e.profileId)) || "Impossible de créer la fiche.");
      setIsBusy(false);
    }
  };

  return (
    <>
      <StepIntro title="Crée ta première fiche">
        Une fiche, c'est un petit paquet de cartes à réviser ensemble : un chapitre, une leçon, un thème…
      </StepIntro>
      <Input
        autoFocus
        size="lg"
        label={`Nom de la fiche · ${profile.name}`}
        value={name}
        onValueChange={(value) => {
          setName(value);
          setError("");
        }}
        onKeyDown={(e) => isEnter(e) && submit()}
        isInvalid={!!error}
        errorMessage={error}
        maxLength={50}
      />
      <Suggestions
        items={FICHE_SUGGESTIONS}
        onPick={(value) => {
          setName(value);
          setError("");
        }}
      />
      <StepActions onBack={onBack} onNext={submit} isBusy={isBusy} />
    </>
  );
}

/** Étape 3 : ajout des cartes à la chaîne, puis choix du mode de révision */
function CardsStep({ profile, fiche, onBack, onStart }) {
  const cards = useLiveQuery(() => getFlashcardsFromFiche(fiche.id), [fiche.id]) ?? [];
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [errors, setErrors] = useState({});
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const missingForQuiz = QUIZ_MIN_CARDS - cards.length;
  const missingForSession = FIRST_SESSION_MIN_CARDS - cards.length;

  const add = async () => {
    try {
      await addFlashcard(fiche.id, front, back);
      setFront("");
      setBack("");
      frontRef.current?.focus();
    } catch (e) {
      setErrors(e);
    }
  };

  // Entrée sur le recto passe au verso, Entrée sur le verso ajoute la carte
  const handleKeyDown = (e, field) => {
    if (!isEnter(e)) return;
    e.preventDefault();
    if (field === "front" && !back.trim()) backRef.current?.focus();
    else add();
  };

  return (
    <>
      <StepIntro title="Ajoute tes premières cartes">
        Recto : la question, le mot ou la notion. Verso : la réponse. Entrée pour passer au verso, puis pour ajouter.
      </StepIntro>

      {/* Où vont les cartes (nom de la fiche modifiable) */}
      <div className="neu-pressed neu-shape-control -mt-2 flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
        <span className="min-w-0 truncate text-neutral-600 dark:text-neutral-300">
          {profile?.name} · <strong className="font-semibold text-neutral-800 dark:text-neutral-100">{fiche.name}</strong>
        </span>
        <button
          type="button"
          onClick={onBack}
          className="neu-focusable flex shrink-0 items-center gap-1 rounded-md px-1 text-xs font-medium text-primary"
        >
          <Pencil size={13} />
          Modifier
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            ref={frontRef}
            autoFocus
            label="Recto"
            value={front}
            onValueChange={(value) => {
              setFront(value);
              setErrors((prev) => ({ ...prev, frontcard: undefined }));
            }}
            onKeyDown={(e) => handleKeyDown(e, "front")}
            isInvalid={!!errors.frontcard}
            errorMessage={errors.frontcard}
            maxLength={1000}
          />
          <Input
            ref={backRef}
            label="Verso"
            value={back}
            onValueChange={(value) => {
              setBack(value);
              setErrors((prev) => ({ ...prev, backcard: undefined }));
            }}
            onKeyDown={(e) => handleKeyDown(e, "back")}
            isInvalid={!!errors.backcard}
            errorMessage={errors.backcard}
            maxLength={1000}
          />
        </div>
        <button
          type="button"
          onClick={add}
          className="neu-btn neu-shape-control neu-focusable flex items-center justify-center gap-2 py-3 font-semibold text-primary"
        >
          <Plus size={18} />
          Ajouter la carte
        </button>
      </div>

      {cards.length > 0 && (
        <section className="flex flex-col gap-2">
          <p className="px-1 text-xs text-neutral-500 dark:text-neutral-400">
            {cards.length} carte{cards.length > 1 ? "s" : ""} dans « {fiche.name} »
            {missingForSession > 0
              ? ` · encore ${missingForSession} pour lancer ta révision`
              : missingForQuiz > 0 && ` · encore ${missingForQuiz} pour débloquer le QCM`}
          </p>
          {cards.map((card) => (
            <div key={card.id} className="neu-raised-sm neu-shape-control flex items-center gap-3 px-4 py-2.5">
              <Check size={16} className="shrink-0 text-success" />
              <span className="grid min-w-0 flex-1 grid-cols-2 gap-3 text-sm">
                <span className="break-words font-medium text-neutral-800 dark:text-neutral-100">{card.frontCard}</span>
                <span className="break-words text-neutral-600 dark:text-neutral-300">{card.backCard}</span>
              </span>
              <button
                type="button"
                onClick={() => deleteFlashcard(card.id)}
                aria-label="Retirer cette carte"
                title="Retirer cette carte"
                className="neu-focusable shrink-0 rounded-full p-1 text-neutral-400 hover:text-danger"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </section>
      )}

      {cards.length > 0 ? (
        <section className="neu-raised neu-shape-card flex flex-col gap-3 p-5">
          <p className="text-center font-semibold text-neutral-800 dark:text-neutral-100">
            {missingForSession > 0
              ? `Encore ${missingForSession} carte${missingForSession > 1 ? "s" : ""} et tu pourras lancer ta première révision`
              : "Prêt ? Choisis comment réviser"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <ModeButton
              icon={<Play size={18} />}
              label="Cartes"
              detail="Retourne chaque carte pour voir la réponse"
              disabled={missingForSession > 0}
              onClick={() => onStart("cards")}
            />
            <ModeButton
              icon={<ListChecks size={18} />}
              label="QCM"
              detail={
                missingForQuiz > 0
                  ? `Choisis parmi 6 réponses (dès ${QUIZ_MIN_CARDS} cartes)`
                  : "Choisis la bonne réponse parmi 6"
              }
              disabled={missingForQuiz > 0}
              onClick={() => onStart("quiz")}
            />
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={onBack}
        className="neu-focusable mx-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-neutral-500 hover:text-primary dark:text-neutral-400"
      >
        <ArrowLeft size={16} />
        Étape précédente
      </button>
    </>
  );
}

function ModeButton({ icon, label, detail, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="neu-btn neu-shape-control neu-focusable flex flex-col items-center gap-1 px-3 py-3 text-center disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className="flex items-center gap-2 font-semibold text-primary">
        {icon}
        {label}
      </span>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{detail}</span>
    </button>
  );
}
