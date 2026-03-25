import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Form,
} from "@heroui/react";
import { addFiche, editFiche } from "../database/fiche";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { showAlert } from "../features/alertSlice";

export default function ModalFiche({ isOpen, onOpenChange, fiche = null }) {
    
  const isNewFiche = fiche === null;
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);
  const [errorNameMessage, setErrorNameMessage] = useState("");
  const [errorDescriptionMessage, setErrorDescriptionMessage] = useState("");

  const dispatch = useDispatch();

  async function handleSubmit(e, onClose) {
    e.preventDefault();
    const name = e.target[0].value;
    const description = e.target[1].value;

    try {
      if (isNewFiche) {
        await addFiche(name, description, selectedProfile.id);
        dispatch(
          showAlert({ message: "Nouvelle fiche crée.", type: "success" }),
        );
        onClose();
      } else {
        await editFiche(fiche.id, name, description, selectedProfile.id);
        dispatch(showAlert({ message: "Fiche modifiée.", type: "success" }));
        onClose();
      }
    } catch (error) {
      if (error.name) setErrorNameMessage(error.name);
      if (error.description) setErrorDescriptionMessage(error.description);
    }
  }

  useEffect(() => {
    setErrorNameMessage("");
    setErrorDescriptionMessage("");
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
          <Form onSubmit={(e) => handleSubmit(e, onClose)} className="contents">
            <ModalHeader>
              {isNewFiche ? "Créer une nouvelle fiche." : "Modifier la fiche."}
            </ModalHeader>
            <ModalBody className="gap-3">
              <Input
                label="Nom de la fiche"
                defaultValue={isNewFiche ? "" : fiche?.name}
                isInvalid={errorNameMessage.length > 0}
                errorMessage={errorNameMessage}
                onChange={() => setErrorNameMessage("")}
              />
              <Textarea
                label="Description"
                defaultValue={isNewFiche ? "" : fiche?.description}
                isInvalid={errorDescriptionMessage.length > 0}
                errorMessage={errorDescriptionMessage}
                onChange={() => setErrorDescriptionMessage("")}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" color="danger" onPress={onClose}>
                Retour
              </Button>
              <Button color="primary" type="submit">
                {isNewFiche ? "Créer" : "Modifier"}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </ModalContent>
    </Modal>
  );
}
