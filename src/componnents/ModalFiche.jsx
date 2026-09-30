import {
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Input,
  Textarea,
  Form,
} from "@heroui/react";
import BottomSheet from "./common/BottomSheet";
import { addFiche, editFiche } from "../database/fiche";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { showAlert } from "../features/alertSlice";

export default function ModalFiche({ isOpen, onOpenChange, fiche = null }) {

  const isNewFiche = fiche === null;
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);
  const [name, setName] = useState(isNewFiche ? "" : fiche?.name || "")
  const [description, setDescription] = useState(isNewFiche ? "" : fiche?.description || "")
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
          showAlert({ message: "Nouvelle fiche créée.", type: "success" }),
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

  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
    >
      <DrawerContent>
        {(onClose) => (
          <Form onSubmit={(e) => handleSubmit(e, onClose)} className="contents">
            <DrawerHeader>
              {isNewFiche ? "Nouvelle fiche" : "Modifier la fiche"}
            </DrawerHeader>
            <DrawerBody className="gap-3">
              <Input
                label="Nom de la fiche"
                defaultValue={isNewFiche ? "" : fiche?.name}
                isInvalid={errorNameMessage.length > 0}
                errorMessage={errorNameMessage}
                description={`${name.length}/50`}
                onValueChange={setName}
                maxLength={50}
                onChange={() => setErrorNameMessage("")}
              />
              <Textarea
                label="Description"
                defaultValue={isNewFiche ? "" : fiche?.description}
                isInvalid={errorDescriptionMessage.length > 0}
                errorMessage={errorDescriptionMessage}
                description={`${description.length}/500`}
                onValueChange={setDescription}
                maxLength={500}
                onChange={() => setErrorDescriptionMessage("")}
              />
            </DrawerBody>
            <DrawerFooter>
              <Button variant="light" onPress={onClose}>
                Annuler
              </Button>
              <Button color="primary" type="submit">
                {isNewFiche ? "Créer" : "Modifier"}
              </Button>
            </DrawerFooter>
          </Form>
        )}
      </DrawerContent>
    </BottomSheet>
  );
}
