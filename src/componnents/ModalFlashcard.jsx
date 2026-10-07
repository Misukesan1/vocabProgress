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
import { useLiveQuery } from "dexie-react-hooks";
import { addFlashcard, deleteFlashcard, editFlashcard, getFlashcard, getFlashcardsFromFiche } from "../database/flashcard";
import { searchFlashcards } from "../utils/search";
import { showAlert } from "../features/alertSlice";
import ModalConfirm from "./common/ModalConfirm";

const MAX_SIMILAR = 5;

/**
 * Création / modification d'une carte.
 * En création, la modale reste ouverte après chaque ajout pour enchaîner la
 * saisie de vocabulaire (Entrée = champ suivant / ajouter, Maj+Entrée = retour à la ligne).
 * Pendant la saisie, les cartes de la fiche qui correspondent au champ en cours
 * sont listées (repère visuel contre les doublons, sans blocage).
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
  const [activeField, setActiveField] = useState("front");
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const closeRef = useRef(null);
  const dispatch = useDispatch();

  // Cartes de la fiche proches du texte saisi (création uniquement)
  const ficheFlashcards = useLiveQuery(
    () => (isNewFlashCard ? getFlashcardsFromFiche(ficheId) : []),
    [isNewFlashCard, ficheId],
  );
  const similarCards = searchFlashcards(ficheFlashcards ?? [], activeField === "back" ? backCard : frontCard);

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
                  onFocus={() => setActiveField("front")}
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
                  onFocus={() => setActiveField("back")}
                  isInvalid={!!errors.backcard}
                  errorMessage={errors.backcard}
                  maxLength={1000}
                />

                {similarCards.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <p className="px-1 text-xs text-neutral-500 dark:text-neutral-400">Déjà dans cette fiche</p>
                    {similarCards.slice(0, MAX_SIMILAR).map((card) => (
                      <div
                        key={card.id}
                        className={`neu-shape-control grid grid-cols-2 gap-3 px-3 py-2 text-sm ${
                          card.rank === 0 ? "neu-pressed text-primary" : "neu-raised-sm"
                        }`}
                      >
                        <span className={`break-words font-medium ${card.rank === 0 ? "" : "text-neutral-800 dark:text-neutral-100"}`}>
                          {card.frontCard}
                        </span>
                        <span className={`break-words ${card.rank === 0 ? "" : "text-neutral-600 dark:text-neutral-300"}`}>
                          {card.backCard}
                        </span>
                      </div>
                    ))}
                    {similarCards.length > MAX_SIMILAR && (
                      <p className="px-1 text-xs text-neutral-500 dark:text-neutral-400">
                        + {similarCards.length - MAX_SIMILAR} autre{similarCards.length - MAX_SIMILAR > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}
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
