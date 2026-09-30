import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { TriangleAlert } from "lucide-react";

export default function ModalConfirm({
  isOpen, // useDisclosure (heroUi)
  onOpenChange, // useDisclosure (heroUi)
  message, // message d'information pour le modal de confirmation
  onConfirm, // fonction a exécuter lors de la confirmation du modal
  confirmLabel = "Confirmer",
}) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex justify-center text-danger">
              <TriangleAlert size={32} />
            </ModalHeader>
            <ModalBody>
              <p className="text-center">{message}</p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Annuler
              </Button>
              <Button
                color="danger"
                onPress={async () => {
                  await onConfirm();
                  onClose();
                }}
              >
                {confirmLabel}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
