import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  useDisclosure,
} from "@heroui/react";
import { Check, Ellipsis, Pencil, Trash, X } from "lucide-react";
import ModalFiche from "./ModalFiche";
import { deleteFiche } from "../database/fiche";
import { useDispatch } from "react-redux";
import { selectFiche } from "../features/ficheSlice";
import { showAlert } from "../features/alertSlice";
import { useNavigate } from "react-router";
import ModalConfirm from "./ModalConfirm";
import { activeAllFlashcards } from "../database/flashcard";

export default function DropdownMenuFiche({ fiche, flashcards }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isOpen: isOpenFicheModal,
    onOpen: onOpenFicheModal,
    onOpenChange: onOpenChangeFicheModal,
  } = useDisclosure();

  const {
    isOpen: isOpenConfirmFicheModal,
    onClose: onCloseConfirmFicheModal,
    onOpen: onOpenConfirmFicheModal,
    onOpenChange: onOpenChangeConfirmFicheModal,
  } = useDisclosure();

  const {
    isOpen: isOpenConfirmModal,
    onOpen: onOpenConfirmModal,
    onOpenChange: onOpenChangeConfirmModal,
  } = useDisclosure();

  const handleDelete = async (fiche) => {
    try {
      await deleteFiche(fiche.id);
      dispatch(selectFiche(null));
      dispatch(showAlert({ message: "Fiche supprimée.", type: "success" }));
      onCloseConfirmFicheModal();
      navigate("/fiches");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectAllFlashcards = () => {
    activeAllFlashcards(Number(fiche.id));
    dispatch(
      showAlert({
        message: "Toutes les cartes sont maintenant à revoir.",
        type: "success",
      }),
    );
  };

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly>
            <Ellipsis size={18} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions">
          {flashcards?.filter((card) => card.desactive).length > 0 && (
            <DropdownItem
              key="activate"
              onPress={onOpenConfirmModal}
              startContent={<Check size={15} />}
              className="text-primary"
              color="primary"
            >
              Remettre les cartes en révision
            </DropdownItem>
          )}

          <DropdownItem
            key="update"
            onPress={onOpenFicheModal}
            startContent={<Pencil size={15} />}
            className="text-secondary"
            color="secondary"
          >
            Modifier
          </DropdownItem>
          <DropdownItem
            key="delete"
            onPress={onOpenConfirmFicheModal}
            startContent={<Trash size={15} />}
            className="text-danger"
            color="danger"
          >
            Supprimer
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <ModalFiche
        isOpen={isOpenFicheModal}
        onOpenChange={onOpenChangeFicheModal}
        fiche={fiche}
      />

      <ModalConfirm
        isOpen={isOpenConfirmFicheModal}
        onOpenChange={onOpenChangeConfirmFicheModal}
        message={`Etes-vous sur de vouloir supprimer cette fiche "${fiche?.name}" ? 
          ${
            flashcards?.length === 0
              ? `Cette fiche ne contient pas de cartes et cette action est irréversible.`
              : `Cette action supprimera également les ${flashcards?.length} cartes associées et est irréversible.`
          }`}
        onConfirm={() => handleDelete(fiche, onCloseConfirmFicheModal)}
      />

      <ModalConfirm
        isOpen={isOpenConfirmModal}
        onOpenChange={onOpenChangeConfirmModal}
        message={
          "Etes-vous sur de vouloir remettre toutes les cartes en révision ?"
        }
        onConfirm={handleSelectAllFlashcards}
      />
    </>
  );
}
