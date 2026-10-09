import { BadgeCheck, Dumbbell, Ellipsis, House, Library, Settings, ShieldCheck } from "lucide-react";

const PLACES = [
  {
    icon: <House size={17} />,
    name: "Accueil",
    text: "Reprends ta révision en un geste, retrouve tes collections et leurs fiches.",
  },
  {
    icon: <Dumbbell size={17} />,
    name: "Entraînement",
    text: "Le bouton rond, en bas : reprend ta révision en cours, sinon ouvre ta dernière fiche.",
  },
  {
    icon: <Library size={17} />,
    name: "Bibliothèque",
    text: "Toutes tes collections et fiches, et une recherche parmi toutes tes cartes.",
  },
  {
    icon: <BadgeCheck size={17} />,
    name: "Liste des cartes",
    text: "Dans une fiche : touche une carte pour la modifier, « Maîtriser » pour la sortir de la révision, « Remettre » pour l'y remettre.",
  },
  {
    icon: <Ellipsis size={17} />,
    name: "Menu ⋯",
    text: "Sur une collection ou une fiche : modifier, supprimer, remettre les cartes en révision.",
  },
  {
    icon: <Settings size={17} />,
    name: "Options",
    text: "La roue crantée, en haut : sauvegarde et restauration.",
  },
];

/**
 * Mode d'emploi de l'appli : principe, où trouver quoi, où sont les données.
 * Affiché à la fin du tutoriel (OnboardingEnd) et dans « Comment ça marche » (Help).
 */
export default function AppGuide() {
  return (
    <>
      <section className="neu-raised neu-shape-card flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <BadgeCheck size={20} className="shrink-0 text-success" />
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">Le principe</h3>
        </div>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-neutral-600 dark:text-neutral-300">
          <li>
            Une <strong>collection</strong> (une langue, une matière) contient des <strong>fiches</strong>, chaque
            fiche des <strong>cartes</strong> recto / verso.
          </li>
          <li>
            Tu connais une carte ? « Je maîtrise cette carte » : elle sort de la révision. Chaque nouveau tour ne
            garde que celles qui te résistent.
          </li>
          <li>
            Deux modes : <strong>Cartes</strong> (tu retournes chaque carte) ou <strong>QCM</strong> (6 réponses au
            choix, dès 7 cartes dans la fiche).
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="px-1 text-base font-semibold text-neutral-700 dark:text-neutral-200">Te repérer</h3>
        {PLACES.map(({ icon, name, text }) => (
          <div key={name} className="neu-raised-sm neu-shape-control flex items-center gap-3 px-4 py-2.5">
            <span className="neu-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary">
              {icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{name}</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="neu-pressed neu-shape-card flex flex-col gap-2 p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="shrink-0 text-primary" />
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">Où sont tes données ?</h3>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Uniquement sur cet appareil, dans ce navigateur : pas de compte, rien n'est envoyé sur internet. Si tu changes
          d'appareil ou vides ton navigateur, elles disparaissent : télécharge une sauvegarde de temps en temps depuis
          les <strong>Options</strong>.
        </p>
      </section>
    </>
  );
}
