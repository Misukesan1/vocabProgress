import {
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Input,
  Form,
} from "@heroui/react";
import BottomSheet from "./common/BottomSheet";
import { addProfile, editProfile, getProfile } from "../database/profile";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectProfile } from "../features/profileSlice";
import { showAlert } from "../features/alertSlice";

export default function ModalProfile({
  isOpen, // useDisclosure (heroUi)
  onOpenChange, // useDisclosure (heroUi)
  profile = null, // objet collection sélectionnée (depuis le store)
  isNewProfile, // boolean pour savoir si c'est un create ou update à faire
}) {

  const [errorNameMessage, setErrorNameMessage] = useState("");
  const titleModal = !isNewProfile
  ? "Modifier la collection"
  : "Nouvelle collection";
  const textButtonSubmit = !isNewProfile ? "Modifier" : "Créer";
  const [nameValue, setNameValue] = useState(isNewProfile ? "" : profile?.name || "")

  const dispatch = useDispatch();
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);

  // Soumission du formulaire
  async function handleSubmit(e, onClose) {
    e.preventDefault();
    const name = e.target[0].value;

    if (isNewProfile) {
      try {
        await addProfile(name);
        dispatch(
          showAlert({ message: "Nouvelle collection créée.", type: "success" }),
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
        if (selectedProfile?.id === profile.id) dispatch(selectProfile(updatedProfile));
        onClose();
      } catch (error) {
        setErrorNameMessage(error.message);
      }
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
          <Form className="contents" onSubmit={(e) => handleSubmit(e, onClose)}>
            <DrawerHeader>{titleModal}</DrawerHeader>
            <DrawerBody>
              <Input
                label="Nom de la collection"
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
            </DrawerBody>
            <DrawerFooter>
              <Button variant="light" onPress={onClose}>
                Annuler
              </Button>
              <Button color="primary" type="submit">
                {textButtonSubmit}
              </Button>
            </DrawerFooter>
          </Form>
        )}
      </DrawerContent>
    </BottomSheet>
  );
}
