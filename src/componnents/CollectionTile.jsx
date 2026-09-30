import { useDispatch, useSelector } from "react-redux";
import { useLiveQuery } from "dexie-react-hooks";
import { getCollectionStats } from "../database/flashcard";
import { selectProfile } from "../features/profileSlice";
import { selectFiche } from "../features/ficheSlice";
import { getCollectionColor } from "../utils/collectionColor";

/**
 * Tuile d'une collection dans le ruban de l'accueil : clic = sélection
 */
export default function CollectionTile({ collection }) {
  const dispatch = useDispatch();
  const isSelected = useSelector((state) => state.profile.selectedProfile?.id === collection.id);
  const stats = useLiveQuery(() => getCollectionStats(collection.id), [collection.id]);

  // Changer de collection efface la fiche sélectionnée
  const handleSelect = () => {
    if (isSelected) return;
    dispatch(selectProfile(collection));
    dispatch(selectFiche(null));
  };

  return (
    <button
      type="button"
      onClick={handleSelect}
      aria-pressed={isSelected}
      className={`neu-shape-card neu-focusable flex w-36 shrink-0 flex-col gap-2 p-4 text-left transition-all ${
        isSelected ? "neu-pressed" : "neu-raised hover:-translate-y-0.5"
      }`}
    >
      <span className={`h-1.5 w-8 rounded-full ${getCollectionColor(collection.id)}`} />
      <span
        className={`truncate font-semibold ${isSelected ? "text-primary" : "text-neutral-800 dark:text-neutral-100"}`}
      >
        {collection.name}
      </span>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        {stats ? `${stats.fiches} fiche${stats.fiches > 1 ? "s" : ""} · ${stats.cards} carte${stats.cards > 1 ? "s" : ""}` : " "}
      </span>
    </button>
  );
}
