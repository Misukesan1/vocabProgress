import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
} from "@heroui/react";
import { Ellipsis, Pencil, Trash } from "lucide-react";
import { useDispatch } from "react-redux";
import ModalFlashcard from "./ModalFlashcard";
import ModalConfirm from "./common/ModalConfirm";
import { deleteFlashcard } from "../database/flashcard";
import { showAlert } from "../features/alertSlice";

/**
 * Actions sur la carte affichée pendant un entraînement : modifier, supprimer.
 * `onEdited(carte)` / `onDeleted(id)` permettent à la session de se mettre à jour.
 */
export default function DropdownMenuTrainingCard({ flashcard, onEdited, onDeleted }) {
  const dispatch = useDispatch();
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onOpenChange: onOpenChangeEdit } = useDisclosure();
  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onOpenChange: onOpenChangeDelete } = useDisclosure();

  const handleDelete = async () => {
    await deleteFlashcard(flashcard.id);
    onDeleted(flashcard.id);
    dispatch(showAlert({ message: "Carte supprimée.", type: "success" }));
  };

  const handleAction = (key) => {
    if (key === "update") onOpenEdit();
    if (key === "delete") onOpenDelete();
  };

  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <button
            type="button"
            aria-label="Actions de la carte"
            className="neu-btn neu-focusable flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 dark:text-neutral-400"
          >
            <Ellipsis size={16} />
          </button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Actions de la carte" onAction={handleAction}>
          <DropdownItem key="update" startContent={<Pencil size={15} />}>
            Modifier
          </DropdownItem>
          <DropdownItem key="delete" startContent={<Trash size={15} />} className="text-danger" color="danger">
            Supprimer
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <ModalFlashcard
        key={`training-card-${flashcard.id}-${isOpenEdit}`}
        isOpen={isOpenEdit}
        onOpenChange={onOpenChangeEdit}
        flashcard={flashcard}
        ficheId={flashcard.ficheId}
        onEdited={onEdited}
        onDeleted={onDeleted}
      />

      <ModalConfirm
        isOpen={isOpenDelete}
        onOpenChange={onOpenChangeDelete}
        message="Supprimer définitivement cette carte ?"
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
      />
    </>
  );
}
