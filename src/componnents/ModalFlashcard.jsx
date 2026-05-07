import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  Textarea,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { addFlashcard, editFlashcard } from "../database/flashcard";
import { useDispatch } from "react-redux";
import { showAlert } from "../features/alertSlice";

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

  useEffect(() => {
    setErrorFrontCardMessage("");
    setErrorBackCardMessage("");
    setFrontCard(isNewFlashCard ? "" : flashcard?.frontCard || "")
    setBackCard(isNewFlashCard ? "" : flashcard?.backCard || "")
  }, [isOpen]);

  return (
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
            </ModalFooter>
          </Form>
        )}
      </ModalContent>
    </Modal>
  );
}
