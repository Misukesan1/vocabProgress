import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

export default function ModalTrainingChoice({
  isOpen,
  onOpenChange,
  onAllCards,
  onHardCards,
  hardCards,
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
            <ModalHeader>Lancer la révision</ModalHeader>
            <ModalBody>
              <p className="text-center text-foreground/60 text-sm">
                Quelles cartes voulez-vous réviser ?
              </p>
            </ModalBody>
            <ModalFooter className="flex flex-col gap-2">
              <Button
                color="primary"
                radius="full"
                fullWidth
                onPress={() => {
                  onAllCards();
                  onClose();
                }}
              >
                Toutes les cartes
              </Button>
              {hardCards?.length > 0 && (
                <Button
                  color="danger"
                  radius="full"
                  fullWidth
                  variant="flat"
                  onPress={() => {
                    onHardCards();
                    onClose();
                  }}
                >
                  Cartes difficiles uniquement
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
