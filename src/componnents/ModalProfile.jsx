import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Form,
} from "@heroui/react";
import { addProfile, editProfile, getProfile } from "../database/profile";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { selectProfile } from "../features/profileSlice";
import { showAlert } from "../features/alertSlice";

// Modification en cours afficher les caractères restants en temps reel

export default function ModalProfile({
  isOpen, // useDisclosure (heroUi)
  onOpenChange, // useDisclosure (heroUi)
  profile = null, // objet profile sélectionné (depuis le store)
  isNewProfile, // boolean pour savoir si c'est un create ou update à faire
}) {

  const [errorNameMessage, setErrorNameMessage] = useState("");
  const titleModal = !isNewProfile
  ? "Modifier la Collection."
  : "Créer une nouvelle Collection.";
  const textButtonSubmit = !isNewProfile ? "Modifier" : "Créer";
  const [nameValue, setNameValue] = useState(isNewProfile ? "" : profile?.name || "")
  
  const dispatch = useDispatch();

  // Soumission du formulaire
  async function handleSubmit(e, onClose) {
    e.preventDefault();
    const name = e.target[0].value;

    if (isNewProfile) {
      try {
        await addProfile(name);
        dispatch(
          showAlert({ message: "Nouvelle Collection créée.", type: "success" }),
        );
        onClose();
      } catch (error) {
        setErrorNameMessage(error.message);
      }
    } else {
      try {
        await editProfile(profile.id, name);
        const updatedProfile = await getProfile(profile.id)
        dispatch(showAlert({ message: "Collection modifiée.", type: "success" }));
        dispatch(selectProfile(updatedProfile));
        onClose();
      } catch (error) {
        setErrorNameMessage(error.message);
      }
    }
  }

  // Effacer les erreurs lorsque le modal s'ouvre
  useEffect(() => {
    setErrorNameMessage("")
    setNameValue("");
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
            <ModalHeader>{titleModal}</ModalHeader>
            <ModalBody>
              <Input
                label="Nom de la Collection"
                isInvalid={errorNameMessage.length > 0}
                errorMessage={errorNameMessage}
                onChange={() => setErrorNameMessage("")}
                validate={(value) => {
                  if (value.length > 25) return "Maximum 25 caractères.";
                }}
                defaultValue={isNewProfile ? "" : profile?.name}
                description={`${nameValue.length}/25`}
                onValueChange={setNameValue}
                maxLength={25}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" color="danger" onPress={onClose}>
                Retour
              </Button>
              <Button color="primary" type="submit">
                {textButtonSubmit}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </ModalContent>
    </Modal>
  );
}
