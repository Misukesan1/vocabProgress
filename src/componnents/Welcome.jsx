import { useState } from "react";
import { Link } from "react-router";
import SkipTutorialLink from "./SkipTutorialLink";
import { Plus } from "lucide-react";

// Cartes de démo : montrent que l'app marche pour tous les domaines, pas seulement les langues
const DEMO_CARDS = [
  { subject: "Japonais", front: "食べる", back: "manger" },
  {
    subject: "Médecine",
    front: "Tachycardie",
    back: "Fréquence cardiaque au repos > 100 battements/min",
  },
  {
    subject: "Droit",
    front: "Article 1240 du Code civil",
    back: "Responsabilité du fait personnel : qui cause un dommage doit le réparer",
  },
  { subject: "Anglais", front: "to remember", back: "se souvenir" },
  {
    subject: "Histoire",
    front: "1789",
    back: "Début de la Révolution française",
  },
  {
    subject: "Chimie",
    front: "NaCl",
    back: "Chlorure de sodium (sel de table)",
  },
];

/**
 * Accueil sans aucune donnée : la promesse de l'app, une carte de démo (langues, droit, médecine...) à
 * retourner, puis l'action principale : créer ses cartes.
 */
export default function Welcome({ onStart }) {
  return (
    <div className="flex flex-col gap-7">
      <section className="px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Bienvenue</p>
        <h2 className="text-3xl font-semibold leading-tight text-neutral-800 dark:text-neutral-100">
          Retiens enfin ce que tu apprends.
        </h2>
      </section>

      <DemoCard />

      <p className="px-1 text-neutral-600 dark:text-neutral-300">
        Langues, droit, médecine, histoire… Crée tes cartes, révise-les. Celles que tu maîtrises sortent de la révision
        : tu te concentres sur ce qui te résiste.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="neu-btn neu-shape-control neu-focusable flex w-full items-center justify-center gap-2 py-4 text-lg font-semibold text-primary"
      >
        <Plus size={20} />
        Créer mes premières cartes
      </button>

      <div className="-mt-3 flex flex-col items-center gap-2">
        <SkipTutorialLink />

        {/* Utilisateur qui connaît déjà l'app : restaurer plutôt que tout recréer */}
      <Link to="/options" state={{ from: "/" }} className="neu-focusable self-center rounded-md px-1 text-sm font-medium text-primary">
          J'ai déjà une sauvegarde
        </Link>
      </div>
    </div>
  );
}

/**
 * Carte de démo : un toucher la retourne, le suivant passe à un autre domaine.
 */
function DemoCard() {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const card = DEMO_CARDS[index];

  const press = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      return;
    }
    setIsFlipped(false);
    setIndex((i) => (i + 1) % DEMO_CARDS.length);
  };

  return (
    <button
      key={`${index}-${isFlipped}`}
      type="button"
      onClick={press}
      className={`flip-in neu-raised neu-shape-card neu-focusable flex min-h-52 w-full cursor-pointer flex-col items-center justify-center gap-3 p-6 text-center ${
        isFlipped ? "ring-1 ring-primary/30" : ""
      }`}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {card.subject} · {isFlipped ? "Verso" : "Recto"}
      </span>
      <span
        className={`break-words font-medium text-neutral-800 dark:text-neutral-100 ${
          (isFlipped ? card.back : card.front).length > 30 ? "text-xl" : "text-3xl"
        }`}
      >
        {isFlipped ? card.back : card.front}
      </span>
      <span className="text-xs text-neutral-400">
        {isFlipped ? "Touche pour un autre exemple" : "Touche pour retourner"}
      </span>
    </button>
  );
}
