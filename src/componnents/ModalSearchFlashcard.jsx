import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
} from "@heroui/react";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Search } from "lucide-react";
import { searchFlashcardsInProfile } from "../database/flashcard";

export default function ModalSearchFlashcard({ isOpen, onOpenChange, profileId }) {
  const [searchValue, setSearchValue] = useState("");

  const results = useLiveQuery(
    () => searchFlashcardsInProfile(profileId, searchValue),
    [profileId, searchValue],
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) setSearchValue("");
      }}
      placement="center"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContent>
        <>
          <ModalHeader>Rechercher une carte parmi les fiches</ModalHeader>
          <ModalBody className="gap-3 pb-6">
            <Input
              value={searchValue}
              onValueChange={setSearchValue}
              startContent={<Search size={18} />}
              size="lg"
              placeholder="Rechercher parmi toutes les cartes"
              variant="bordered"
              autoFocus
            />

            {searchValue.length === 0 && (
              <p className="text-center text-foreground/50">
                Tapez du texte pour rechercher une carte.
              </p>
            )}

            {searchValue.length > 0 && results?.length === 0 && (
              <p className="text-center text-foreground/50">
                Aucune carte trouvée.
              </p>
            )}

            {results?.length > 0 && (
              <div className="flex flex-col gap-2">
                {results.map((flashcard) => (
                  <div
                    key={flashcard.id}
                    className="rounded-md border border-divider/50 px-3 py-2"
                  >
                    <p className="text-xs text-foreground/50">{flashcard.ficheName}</p>
                    <p className="font-semibold">{flashcard.frontCard}</p>
                    <p className="text-sm text-foreground/70">{flashcard.backCard}</p>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
        </>
      </ModalContent>
    </Modal>
  );
}
