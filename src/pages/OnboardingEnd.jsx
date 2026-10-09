import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { finishTutorial, isTutorialPending } from "../utils/onboarding";
import AppGuide from "../componnents/AppGuide";

/**
 * Récap affiché à la fin de la toute première révision (lancée depuis les
 * premiers pas) : où trouver quoi, où sont les données, puis main libre.
 */
export default function OnboardingEnd() {
  const navigate = useNavigate();
  // Hors tutoriel (adresse tapée, bouton Retour...) : pas de « Bravo », retour à l'accueil
  const [isPending] = useState(isTutorialPending);

  // On arrive de la révision, souvent défilée : le récap se lit depuis le haut
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!isPending) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <section className="px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Bravo</p>
        <h2 className="text-3xl font-semibold leading-tight text-neutral-800 dark:text-neutral-100">
          Ta première révision est faite !
        </h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          L'essentiel pour la suite. Tu le retrouveras dans les Options, rubrique « Comment ça marche ».
        </p>
      </section>

      <AppGuide />

      {/* Toujours à portée de pouce, au-dessus de la barre du bas */}
      <div className="sticky bottom-28 z-10">
        <button
          type="button"
          onClick={() => {
            finishTutorial(); // l'app se déverrouille
            navigate("/");
          }}
          className="neu-btn neu-shape-control neu-focusable w-full py-4 text-lg font-semibold text-primary"
        >
          C'est parti !
        </button>
      </div>
    </div>
  );
}
