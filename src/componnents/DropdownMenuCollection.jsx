import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
} from "@heroui/react";
import { Ellipsis, Pencil, Trash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import ModalProfile from "./ModalProfile";
import ModalConfirm from "./common/ModalConfirm";
import { deleteProfile } from "../database/profile";
import { selectProfile } from "../features/profileSlice";
import { selectFiche } from "../features/ficheSlice";
import { clearTraining } from "../features/trainingSlice";
import { showAlert } from "../features/alertSlice";

/**
 * Actions d'une collection : modifier, supprimer (avec ses fiches et ses cartes)
 */
export default function DropdownMenuCollection({ collection, fiches }) {
  const dispatch = useDispatch();
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);
  const trainingFicheId = useSelector((state) => state.training.ficheId);

  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onOpenChange: onOpenChangeEdit } = useDisclosure();
  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onOpenChange: onOpenChangeDelete } = useDisclosure();

  const handleDelete = async () => {
    const ficheIds = (fiches ?? []).map((fiche) => fiche.id);
    await deleteProfile(collection.id);

    // L'entraînement en cours portait sur une fiche supprimée
    if (ficheIds.includes(trainingFicheId)) dispatch(clearTraining());

    if (selectedProfile?.id === collection.id) {
      dispatch(selectProfile(null));
      dispatch(selectFiche(null));
    }
    dispatch(showAlert({ message: "Collection supprimée.", type: "success" }));
  };

  const handleAction = (key) => {
    if (key === "update") onOpenEdit();
    if (key === "delete") onOpenDelete();
  };

  const ficheCount = fiches?.length ?? 0;

  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <button
            type="button"
            aria-label={`Actions de la collection ${collection.name}`}
            className="neu-btn neu-focusable flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-600 dark:text-neutral-300"
          >
            <Ellipsis size={16} />
          </button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Actions de la collection" onAction={handleAction}>
          <DropdownItem key="update" startContent={<Pencil size={15} />}>
            Modifier
          </DropdownItem>
          <DropdownItem key="delete" startContent={<Trash size={15} />} className="text-danger" color="danger">
            Supprimer
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <ModalProfile
        key={`edit-collection-${collection.id}-${isOpenEdit}`}
        isOpen={isOpenEdit}
        onOpenChange={onOpenChangeEdit}
        profile={collection}
        isNewProfile={false}
      />

      <ModalConfirm
        isOpen={isOpenDelete}
        onOpenChange={onOpenChangeDelete}
        message={
          ficheCount
            ? `Supprimer la collection « ${collection.name} », ${ficheCount > 1 ? `ses ${ficheCount} fiches` : "sa fiche"} et toutes leurs cartes ? Cette action est irréversible.`
            : `Supprimer la collection « ${collection.name} » ? Cette action est irréversible.`
        }
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
      />
    </>
  );
}
