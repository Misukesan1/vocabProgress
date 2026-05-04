import { Card, CardBody, Button, useDisclosure } from "@heroui/react";
import { Info, Pencil, Trash } from "lucide-react";
import ModalFiche from "./ModalFiche";
import ModalConfirm from "./ModalConfirm";
import { deleteFiche } from "../database/fiche";
import { useDispatch } from "react-redux";
import { showAlert } from "../features/alertSlice";
import { useNavigate } from "react-router";
import { selectFiche } from "../features/ficheSlice";
import { useLiveQuery } from "dexie-react-hooks";
import { getFlashcardsFromFiche } from "../database/flashcard";

export default function FicheCard({ name, description, fiche }) {

  const flashcards = useLiveQuery(() => getFlashcardsFromFiche(fiche.id))
  const navigate = useNavigate()

  const {
    isOpen: isOpenModalFiche,
    onOpen: onOpenModalFiche,
    onOpenChange: onOpenChangeModalFiche,
  } = useDisclosure();
  const {
    isOpen: isOpenModalConfirm,
    onClose: onCloseModalConfirm,
    onOpen: onOpenModalConfirm,
    onOpenChange: onOpenChangeModalConfirm,
  } = useDisclosure();

  const dispatch = useDispatch();
  
  const handleDelete = async (fiche, onCloseModalConfirm) => {
    try {
      await deleteFiche(fiche.id);
      dispatch(showAlert({ message: "Fiche supprimée.", type: "success" }));
      onCloseModalConfirm();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDetails = () => {
    dispatch(selectFiche(fiche))
    navigate(`/fiche/${fiche.id}`)
  }

  return (
    <>
      <Card
        shadow="sm"
        radius="sm"
        className="mx-3 mb-1 my-1 border border-divider/50"
        onPress={() => navigate(`/fiche/${fiche.id}`)}
      >
        <CardBody className="px-4 py-3">
          <div className="flex flex-row items-center justify-between">
                      <div className="flex flex-col">
            <p className="font-semibold text-foreground">{name}</p>
            {description && (
              <p className="text-xs text-foreground/50">{description}</p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              isIconOnly
              size="sm"
              radius="full"
              variant="light"
              color="primary"
              onPress={handleDetails}
            >
              <Info size={15} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              radius="full"
              variant="light"
              onPress={onOpenModalFiche}
            >
              <Pencil size={15} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              radius="full"
              variant="light"
              color="danger"
              onPress={onOpenModalConfirm}
            >
              <Trash size={15} />
            </Button>
          </div>
          </div>

          <div>
            <p className="text-xs font-light text-foreground">Nombre de cartes : <span className="font-semibold">{flashcards?.length}</span></p>
          </div>
        </CardBody>
      </Card>

      <ModalFiche
        isOpen={isOpenModalFiche}
        onOpenChange={onOpenChangeModalFiche}
        fiche={fiche}
      />

      <ModalConfirm
        isOpen={isOpenModalConfirm}
        onOpenChange={onOpenChangeModalConfirm}
        message={`Etes-vous sur de vouloir supprimer cette fiche "${fiche.name}" ? Cette action supprimera également les ${flashcards?.length} cartes associées et est irréversible.`}
        onConfirm={() => handleDelete(fiche, onCloseModalConfirm)}
      />
    </>
  );
}
