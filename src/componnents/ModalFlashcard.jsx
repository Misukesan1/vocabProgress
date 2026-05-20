import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { addFlashcard, deleteFlashcard, editFlashcard } from "../database/flashcard";
import { useDispatch } from "react-redux";
import { showAlert } from "../features/alertSlice";
import ModalConfirm from "./ModalConfirm";

export default function ModalFlashcard({
  isOpen,
  onOpenChange,
  flashcard = null,
  ficheId,
}) {
  const isNewFlashCard = flashcard === null;
  const [frontCard, setFrontCard] = useState(isNewFlashCard ? "" : flashcard?.frontCard || "")
  const [backCard, setBackCard] = useState(isNewFlashCard ? "" : flashcard?.backCard || "")
  const [errorFrontCardMessage, setErrorFrontCardMessage] = useState("");
  const [errorBackCardMessage, setErrorBackCardMessage] = useState("");
  const dispatch = useDispatch();

  const { isOpen: isOpenConfirmDeleteModal, onOpen: onOpenConfirmDeleteModal, onOpenChange: onOpenChangeConfirmDeleteModal } = useDisclosure();

  const handleSubmit = async (e, onClose) => {
    e.preventDefault();
    const frontCard = e.target[0].value;
    const backCard = e.target[1].value;

    try {
      if (isNewFlashCard) {
        await addFlashcard(ficheId, frontCard, backCard);
        dispatch(
          showAlert({ message: "Nouvelle carte créée.", type: "success" }),
        );
        onClose();
      } else {
        await editFlashcard(flashcard.id, frontCard, backCard);
        dispatch(
          showAlert({ message: "Carte modifiée.", type: "success" }),
        );
        onClose();
      }
    } catch (error) {
      console.log(error);
      if (error.frontcard) setErrorFrontCardMessage(error.frontcard);
      if (error.backcard) setErrorBackCardMessage(error.backcard);
    }
  };

   const handleConfirmDelete = async () => {
      try {
        await deleteFlashcard(flashcard.id);
        dispatch(showAlert({ message: "Flashcard supprimée.", type: "success" }));
      } catch (error) {
        console.log(error);
      }
    };

    const handleDeleteFlashcard = (onClose) => {
      onClose()
      onOpenConfirmDeleteModal()
    }

  useEffect(() => {
    setErrorFrontCardMessage("");
    setErrorBackCardMessage("");
    setFrontCard(isNewFlashCard ? "" : flashcard?.frontCard || "")
    setBackCard(isNewFlashCard ? "" : flashcard?.backCard || "")
  }, [isOpen]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <Form className="contents" onSubmit={(e) => handleSubmit(e, onClose)}>
              <ModalHeader>
                {isNewFlashCard
                  ? "Nouvelle carte."
                  : "Modifier la carte."}
              </ModalHeader>
              <ModalBody className="gap-3">
                <Textarea
                  label="Recto"
                  onChange={() => setErrorFrontCardMessage("")}
                  isInvalid={errorFrontCardMessage.length > 0}
                  errorMessage={errorFrontCardMessage}
                  defaultValue={isNewFlashCard ? "" : flashcard?.frontCard}
                  description={`${frontCard.length}/1000`}
                  onValueChange={setFrontCard}
                  maxLength={1000}
                />
                <Textarea
                  label="Verso"
                  onChange={() => setErrorBackCardMessage("")}
                  isInvalid={errorBackCardMessage.length > 0}
                  errorMessage={errorBackCardMessage}
                  defaultValue={isNewFlashCard ? "" : flashcard?.backCard}
                  description={`${backCard.length}/1000`}
                  onValueChange={setBackCard}
                  maxLength={1000}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" color="danger" onPress={onClose}>
                  Retour
                </Button>
                <Button color="primary" type="submit">
                  {isNewFlashCard ? "Créer" : "Modifier"}
                </Button>
                {flashcard &&
                  <Button onPress={() => handleDeleteFlashcard(onClose)} color="danger">
                    Supprimer
                  </Button>
                }
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>

      <ModalConfirm
        isOpen={isOpenConfirmDeleteModal}
        onOpenChange={onOpenChangeConfirmDeleteModal}
        message="Etes-vous sur de vouloir supprimer cette flashcard ?"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
