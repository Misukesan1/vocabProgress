import {
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import BottomSheet from "./common/BottomSheet";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { addFlashcard, deleteFlashcard, editFlashcard, getFlashcard } from "../database/flashcard";
import { showAlert } from "../features/alertSlice";
import ModalConfirm from "./common/ModalConfirm";

/**
 * Création / modification d'une carte.
 * En création, la modale reste ouverte après chaque ajout pour enchaîner la
 * saisie de vocabulaire (Entrée = champ suivant / ajouter, Maj+Entrée = retour à la ligne).
 * Remonter la modale avec une `key` différente à chaque ouverture pour
 * réinitialiser les champs.
 * `onEdited(carte)` / `onDeleted(id)` (optionnels) préviennent l'appelant après
 * une modification / suppression (ex. la session d'entraînement en cours).
 */
export default function ModalFlashcard({ isOpen, onOpenChange, flashcard = null, ficheId, onEdited, onDeleted }) {
  const isNewFlashCard = flashcard === null;
  const [frontCard, setFrontCard] = useState(flashcard?.frontCard ?? "");
  const [backCard, setBackCard] = useState(flashcard?.backCard ?? "");
  const [errors, setErrors] = useState({});
  const [addedCount, setAddedCount] = useState(0);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const closeRef = useRef(null);
  const dispatch = useDispatch();

  const {
    isOpen: isOpenConfirmDelete,
    onOpen: onOpenConfirmDelete,
    onOpenChange: onOpenChangeConfirmDelete,
  } = useDisclosure();

  const handleSubmit = async (onClose) => {
    try {
      if (isNewFlashCard) {
        await addFlashcard(ficheId, frontCard, backCard);
        setAddedCount((count) => count + 1);
        setFrontCard("");
        setBackCard("");
        frontRef.current?.focus();
      } else {
        await editFlashcard(flashcard.id, frontCard, backCard);
        if (onEdited) {
          const updated = await getFlashcard(flashcard.id);
          if (updated) onEdited(updated);
        }
        dispatch(showAlert({ message: "Carte modifiée.", type: "success" }));
        onClose();
      }
    } catch (error) {
      setErrors(error);
    }
  };

  // Entrée sur le recto passe au verso (s'il est vide), Entrée sur le verso ajoute
  const handleKeyDown = (e, onClose, field) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    if (field === "front" && !backCard.trim()) backRef.current?.focus();
    else handleSubmit(onClose);
  };

  const handleConfirmDelete = async () => {
    await deleteFlashcard(flashcard.id);
    onDeleted?.(flashcard.id);
    dispatch(showAlert({ message: "Carte supprimée.", type: "success" }));
    closeRef.current?.();
  };

  return (
    <>
      <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-0.5">
                {isNewFlashCard ? "Nouvelles cartes" : "Modifier la carte"}
                {isNewFlashCard && (
                  <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                    {addedCount > 0
                      ? `${addedCount} carte${addedCount > 1 ? "s" : ""} ajoutée${addedCount > 1 ? "s" : ""}`
                      : "Recto, Entrée, verso, Entrée : la carte est ajoutée."}
                  </span>
                )}
              </DrawerHeader>
              <DrawerBody className="gap-3">
                <Textarea
                  ref={frontRef}
                  autoFocus
                  label="Recto"
                  minRows={1}
                  value={frontCard}
                  onValueChange={(value) => {
                    setFrontCard(value);
                    setErrors((prev) => ({ ...prev, frontcard: undefined }));
                  }}
                  onKeyDown={(e) => handleKeyDown(e, onClose, "front")}
                  isInvalid={!!errors.frontcard}
                  errorMessage={errors.frontcard}
                  maxLength={1000}
                />
                <Textarea
                  ref={backRef}
                  label="Verso"
                  minRows={1}
                  value={backCard}
                  onValueChange={(value) => {
                    setBackCard(value);
                    setErrors((prev) => ({ ...prev, backcard: undefined }));
                  }}
                  onKeyDown={(e) => handleKeyDown(e, onClose, "back")}
                  isInvalid={!!errors.backcard}
                  errorMessage={errors.backcard}
                  maxLength={1000}
                />
              </DrawerBody>
              <DrawerFooter>
                {!isNewFlashCard && (
                  <Button
                    color="danger"
                    variant="light"
                    className="mr-auto"
                    onPress={() => {
                      // La modale reste ouverte sous la confirmation : la fermer ici la
                      // démonterait (key liée à isOpen chez l'appelant) avec la confirmation
                      closeRef.current = onClose;
                      onOpenConfirmDelete();
                    }}
                  >
                    Supprimer
                  </Button>
                )}
                <Button variant="light" onPress={onClose}>
                  {isNewFlashCard && addedCount > 0 ? "Terminé" : "Annuler"}
                </Button>
                <Button color="primary" onPress={() => handleSubmit(onClose)}>
                  {isNewFlashCard ? "Ajouter" : "Enregistrer"}
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </BottomSheet>

      <ModalConfirm
        isOpen={isOpenConfirmDelete}
        onOpenChange={onOpenChangeConfirmDelete}
        message="Supprimer définitivement cette carte ?"
        confirmLabel="Supprimer"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
