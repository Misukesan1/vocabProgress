import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

/**
 * Onglet Entraînement sans fiche sélectionnée (voir BottomNav)
 */
export default function Entrainement() {
  const navigate = useNavigate();
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);

  return (
    <div className="neu-raised neu-shape-card mx-auto mt-10 flex max-w-sm flex-col items-center gap-4 p-6 text-center">
      <p className="text-neutral-600 dark:text-neutral-300">
        {selectedProfile
          ? `Aucune fiche sélectionnée. Choisis une fiche de « ${selectedProfile.name} » pour lancer un entraînement.`
          : "Aucune fiche sélectionnée. Choisis une collection puis une fiche pour lancer un entraînement."}
      </p>
      <button
        type="button"
        onClick={() => navigate("/fiches")}
        className="neu-btn neu-shape-control neu-focusable px-4 py-2 text-sm font-medium text-primary"
      >
        {selectedProfile ? "Voir mes fiches" : "Voir mes collections"}
      </button>
    </div>
  );
}
