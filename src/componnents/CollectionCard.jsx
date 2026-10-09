import { useDispatch, useSelector } from "react-redux";
import { useLiveQuery } from "dexie-react-hooks";
import { getFichesFromProfile } from "../database/fiche";
import { selectProfile } from "../features/profileSlice";
import { selectFiche } from "../features/ficheSlice";
import DropdownMenuCollection from "./DropdownMenuCollection";

export default function CollectionCard({ collection }) {
  const dispatch = useDispatch();
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);
  const fiches = useLiveQuery(() => getFichesFromProfile(collection.id), [collection.id]);
  const isSelected = selectedProfile?.id === collection.id;

  // Changer de collection efface la fiche sélectionnée (re-cliquer la même la garde)
  const handleSelect = () => {
    if (isSelected) return;
    dispatch(selectProfile(collection));
    dispatch(selectFiche(null));
  };

  return (
    <div
      className={`neu-shape-control flex items-center gap-2 pr-3 transition-all ${
        isSelected
          ? "neu-pressed text-primary"
          : "neu-raised-sm text-neutral-700 hover:-translate-y-0.5 dark:text-neutral-200"
      }`}
    >
      <button
        type="button"
        onClick={handleSelect}
        aria-pressed={isSelected}
        className="neu-shape-control neu-focusable flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="truncate font-medium">{collection.name}</span>
        <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
          {fiches && `${fiches.length} fiche${fiches.length > 1 ? "s" : ""}`}
        </span>
      </button>
      <DropdownMenuCollection collection={collection} fiches={fiches} />
    </div>
  );
}
