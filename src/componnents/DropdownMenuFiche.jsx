import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
} from "@heroui/react";
import { Ellipsis, Pencil, RotateCcw, Trash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import ModalFiche from "./ModalFiche";
import ModalConfirm from "./common/ModalConfirm";
import { deleteFiche } from "../database/fiche";
import { activeAllFlashcards } from "../database/flashcard";
import { selectFiche } from "../features/ficheSlice";
import { clearTraining } from "../features/trainingSlice";
import { showAlert } from "../features/alertSlice";

/**
 * Actions d'une fiche : modifier, remettre les cartes en révision, supprimer
 */
export default function DropdownMenuFiche({ fiche, flashcards }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const trainingFicheId = useSelector((state) => state.training.ficheId);
  const masteredCount = flashcards?.filter((card) => card.desactive).length ?? 0;

  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onOpenChange: onOpenChangeEdit } = useDisclosure();
  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onOpenChange: onOpenChangeDelete } = useDisclosure();
  const { isOpen: isOpenReset, onOpen: onOpenReset, onOpenChange: onOpenChangeReset } = useDisclosure();

  const handleDelete = async () => {
    await deleteFiche(fiche.id);
    if (trainingFicheId === fiche.id) dispatch(clearTraining());
    dispatch(selectFiche(null));
    dispatch(showAlert({ message: "Fiche supprimée.", type: "success" }));
    navigate("/fiches");
  };

  const handleResetAll = async () => {
    await activeAllFlashcards(fiche.id);
    dispatch(showAlert({ message: "Toutes les cartes sont à nouveau en révision.", type: "success" }));
  };

  const handleAction = (key) => {
    if (key === "update") onOpenEdit();
    if (key === "reset") onOpenReset();
    if (key === "delete") onOpenDelete();
  };

  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <button
            type="button"
            aria-label="Actions de la fiche"
            className="neu-btn neu-focusable flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-600 dark:text-neutral-300"
          >
            <Ellipsis size={18} />
          </button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Actions de la fiche"
          onAction={handleAction}
          disabledKeys={masteredCount === 0 ? ["reset"] : []}
        >
          <DropdownItem key="update" startContent={<Pencil size={15} />}>
            Modifier
          </DropdownItem>
          <DropdownItem key="reset" startContent={<RotateCcw size={15} />}>
            Remettre les cartes en révision
          </DropdownItem>
          <DropdownItem key="delete" startContent={<Trash size={15} />} className="text-danger" color="danger">
            Supprimer
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <ModalFiche key={`edit-fiche-${isOpenEdit}`} isOpen={isOpenEdit} onOpenChange={onOpenChangeEdit} fiche={fiche} />

      <ModalConfirm
        isOpen={isOpenReset}
        onOpenChange={onOpenChangeReset}
        message={
          masteredCount > 1
            ? `Remettre les ${masteredCount} cartes maîtrisées en révision ?`
            : "Remettre la carte maîtrisée en révision ?"
        }
        confirmLabel="Remettre en révision"
        onConfirm={handleResetAll}
      />

      <ModalConfirm
        isOpen={isOpenDelete}
        onOpenChange={onOpenChangeDelete}
        message={
          flashcards?.length
            ? `Supprimer la fiche « ${fiche?.name} » et ${flashcards.length > 1 ? `ses ${flashcards.length} cartes` : "sa carte"} ? Cette action est irréversible.`
            : `Supprimer la fiche « ${fiche?.name} » ? Cette action est irréversible.`
        }
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
      />
    </>
  );
}
