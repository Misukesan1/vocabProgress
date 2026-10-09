import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import AppGuide from "../componnents/AppGuide";

/**
 * « Comment ça marche » : le mode d'emploi du récap de fin de tutoriel, toujours
 * accessible (Options, accueil), notamment pour qui a passé le tutoriel.
 */
export default function Help() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <button
        type="button"
        onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
        className="neu-btn neu-shape-control neu-focusable flex items-center gap-1.5 self-start py-2 pl-2 pr-4 text-sm font-medium text-primary"
      >
        <ChevronLeft size={18} />
        Retour
      </button>

      <section className="px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Aide</p>
        <h2 className="text-2xl font-semibold leading-tight text-neutral-800 dark:text-neutral-100">
          Comment ça marche ?
        </h2>
      </section>

      <AppGuide />
    </div>
  );
}
