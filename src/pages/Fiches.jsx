import { useSelector } from "react-redux";
import { useLiveQuery } from "dexie-react-hooks";
import { useDisclosure } from "@heroui/react";
import { Plus } from "lucide-react";
import { getProfiles } from "../database/profile";
import { getFichesFromProfile } from "../database/fiche";
import CollectionCard from "../componnents/CollectionCard";
import FicheCard from "../componnents/FicheCard";
import ModalProfile from "../componnents/ModalProfile";
import ModalFiche from "../componnents/ModalFiche";

export default function Fiches() {
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);
  const collections = useLiveQuery(() => getProfiles());
  const fiches = useLiveQuery(
    () => (selectedProfile ? getFichesFromProfile(selectedProfile.id) : []),
    [selectedProfile],
  );

  const {
    isOpen: isOpenNewCollection,
    onOpen: onOpenNewCollection,
    onOpenChange: onOpenChangeNewCollection,
  } = useDisclosure();

  const {
    isOpen: isOpenNewFiche,
    onOpen: onOpenNewFiche,
    onOpenChange: onOpenChangeNewFiche,
  } = useDisclosure();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-200">
            Collections
          </h2>
          <button
            type="button"
            onClick={onOpenNewCollection}
            className="neu-btn neu-shape-control neu-focusable flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary"
          >
            <Plus size={14} />
            Nouvelle
          </button>
        </div>

        {collections?.length === 0 && (
          <div className="neu-raised neu-shape-card p-6 text-center text-neutral-600 dark:text-neutral-300">
            Aucune collection pour l'instant. Organise ton vocabulaire en collections, puis en fiches de cartes à réviser : crée ta première collection pour commencer.
          </div>
        )}

        <div className="flex flex-col gap-2">
          {collections?.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      {selectedProfile && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-200">
              Fiches — {selectedProfile.name}
            </h2>
            <button
              type="button"
              onClick={onOpenNewFiche}
              className="neu-btn neu-shape-control neu-focusable flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary"
            >
              <Plus size={14} />
              Nouvelle
            </button>
          </div>

          {fiches?.length === 0 && (
            <div className="neu-raised neu-shape-card p-6 text-center text-neutral-600 dark:text-neutral-300">
              Aucune fiche dans cette collection.
            </div>
          )}

          <div className="flex flex-col gap-2">
            {fiches?.map((fiche) => (
              <FicheCard key={fiche.id} fiche={fiche} />
            ))}
          </div>
        </section>
      )}

      <ModalProfile
        key={`new-collection-${isOpenNewCollection}`}
        isOpen={isOpenNewCollection}
        onOpenChange={onOpenChangeNewCollection}
        isNewProfile={true}
      />
      <ModalFiche
        key={`new-fiche-${isOpenNewFiche}`}
        isOpen={isOpenNewFiche}
        onOpenChange={onOpenChangeNewFiche}
      />
    </div>
  );
}
