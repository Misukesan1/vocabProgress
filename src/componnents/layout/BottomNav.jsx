import { NavLink, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { showAlert } from "../../features/alertSlice";
import { trainingPath } from "../../features/trainingSlice";
import { Dumbbell, House, Library } from "lucide-react";

const linkClass = ({ isActive }) =>
  `neu-shape-control neu-focusable flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-all ${
    isActive
      ? "neu-pressed text-primary"
      : "text-neutral-500 hover:text-primary/80 dark:text-neutral-400 dark:hover:text-primary/80"
  }`;

/* L'action d'entraînement est la plus utilisée au quotidien : elle sort du rang
   des deux autres items (texte + icône alignés) sous forme de bouton rond
   surélevé, façon FAB, plutôt qu'un troisième item visuellement identique.
   Le bouton est positionné en absolute (plutôt qu'avec une marge négative
   dans le flux flex) pour flotter de façon fiable au-dessus de la barre,
   indépendamment du calcul de hauteur des items voisins. */
const trainingLinkClass = (isActive) =>
  `group neu-focusable relative flex flex-col items-center justify-end gap-1 pt-7 pb-1 px-3 text-xs font-medium transition-all ${
    isActive
      ? "text-primary"
      : "text-neutral-500 hover:text-primary/80 dark:text-neutral-400 dark:hover:text-primary/80"
  }`;

export default function BottomNav({ locked = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  // L'onglet reste actif pendant une révision (/fiche/:id/training ou /fiche/:id/qcm)
  const isTrainingActive =
    pathname === "/entrainement" || pathname.endsWith("/training") || pathname.endsWith("/qcm");
  const trainingFicheId = useSelector((state) => state.training.ficheId);
  const trainingMode = useSelector((state) => state.training.mode);
  const selectedFicheId = useSelector((state) => state.fiche.selectedFiche?.id);

  // Session en cours (non quittée) : on la reprend là où elle en était.
  // Sinon on ouvre la fiche sélectionnée, sans relancer d'entraînement :
  // c'est l'utilisateur qui choisit de le démarrer depuis la fiche.
  // Sans fiche sélectionnée, la page Entraînement invite à en choisir une.
  const handleTrainingClick = (event) => {
    event.preventDefault();
    const target = trainingFicheId
      ? trainingPath(trainingFicheId, trainingMode)
      : selectedFicheId
        ? `/fiche/${selectedFicheId}`
        : "/entrainement";
    if (target !== pathname) {
      navigate(target);
      return;
    }
    // Déjà sur la page visée : on le dit plutôt que de ne rien faire
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (target.startsWith("/fiche/")) {
      dispatch(showAlert({ message: "Lance la révision avec « Cartes » ou « QCM », en haut de la fiche.", type: "success" }));
    }
  };

  return (
    <nav className="neu-bar-bottom fixed inset-x-0 bottom-0 z-20 px-4 py-3" inert={locked}>
      {/* Verrouillée pendant le tutoriel : visible mais grisée et inerte */}
      <div className={`mx-auto flex w-full max-w-md items-center justify-around transition-opacity ${locked ? "opacity-40" : ""}`}>
        <NavLink to="/" end className={linkClass}>
          <House size={20} />
          Accueil
        </NavLink>

        <NavLink to="/entrainement" onClick={handleTrainingClick} className={() => trainingLinkClass(isTrainingActive)}>
          <span
            className={`absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full transition-all group-hover:-translate-y-0.5 ${
              isTrainingActive ? "neu-pressed text-primary" : "neu-btn text-primary"
            }`}
          >
            <Dumbbell size={20} />
          </span>
          Entraînement
        </NavLink>

        <NavLink to="/fiches" className={linkClass}>
          <Library size={20} />
          Bibliothèque
        </NavLink>
      </div>
      {locked && (
        <p className="mt-1 text-center text-[11px] text-neutral-500 dark:text-neutral-400">
          Menus disponibles à la fin de ta première révision
        </p>
      )}
    </nav>
  );
}
