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
}) {
    
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
          <>
            <ModalHeader>
              <Button
                variant="light"
                isDisabled
                className="mx-auto"
                isIconOnly
                color="danger"
                radius="full"
                size="lg"
              >
                <TriangleAlert size={32} />
              </Button>
            </ModalHeader>
            <ModalBody>
              <p className="text-center">{message}</p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" color="danger" onPress={onClose}>
                Annuler
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
              >
                Confirmer
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
