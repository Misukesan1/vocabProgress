import { Card, CardBody, Divider, Button, useDisclosure } from "@heroui/react";
import { Check, Pencil, Trash, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteFlashcard, toggleStatusFlashcard } from "../database/flashcard";
import ModalConfirm from "./ModalConfirm";
import { showAlert } from "../features/alertSlice";

export default function FlashCard({ flashcard, onEdit }) {
  const isDisabled = flashcard?.desactive;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const dispatch = useDispatch();

  const handleConfirmDelete = async () => {
    try {
      await deleteFlashcard(flashcard.id);
      dispatch(showAlert({ message: "Flashcard supprimée.", type: "success" }));
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggle = async () => {
    await toggleStatusFlashcard(flashcard.id, flashcard.desactive);
  };

  return (
    <Card
      shadow="sm"
      radius="sm"
      className={`mx-3 mb-1 my-1 border ${isDisabled ? "border-divider/20 bg-foreground/5" : "border-divider/50"}`}
    >
      <CardBody className="px-3 py-2 flex flex-row gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-foreground/50 font-semibold uppercase">
              Recto
            </p>
            <p
              className={isDisabled ? "text-foreground/30" : "text-foreground"}
            >
              {flashcard?.frontCard}
            </p>
          </div>
          <Divider className={isDisabled ? "opacity-30" : ""} />
          <div className="flex flex-col gap-1">
            <p className="text-xs text-foreground/50 font-semibold uppercase">
              Verso
            </p>
            <p
              className={isDisabled ? "text-foreground/30" : "text-foreground"}
            >
              {flashcard?.backCard}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1 justify-center items-center">
          <Button
            isIconOnly
            size="sm"
            radius="full"
            variant="light"
            onPress={onEdit}
          >
            <Pencil
              size={15}
              className={isDisabled ? "text-foreground/30" : "text-foreground"}
            />
          </Button>
          <Button
            isIconOnly
            size="sm"
            radius="full"
            variant="light"
            color="danger"
            onPress={onOpen}
          >
            <Trash size={15} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            radius="full"
            variant="light"
            color={isDisabled ? "default" : "success"}
            onPress={handleToggle}
          >
            {isDisabled ? (
              <X size={15} className="text-foreground/30" />
            ) : (
              <Check size={15} />
            )}
          </Button>
        </div>
      </CardBody>

      <ModalConfirm
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        message="Etes-vous sur de vouloir supprimer cette flashcard ?"
        onConfirm={handleConfirmDelete}
      />
    </Card>
  );
}
