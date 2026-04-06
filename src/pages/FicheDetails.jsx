import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router";
import { getFiche } from "../database/fiche";
import BoxContent from "../componnents/BoxContent";
import FlashCard from "../componnents/FlashCard";
import { selectFiche } from "../features/ficheSlice";
import { Button, useDisclosure } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getFlashcardsFromFiche } from "../database/flashcard";
import ModalFlashcard from "../componnents/ModalFlashcard";

export default function FicheDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [flashCardSelected, setFlashCardSelected] = useState(null);
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);
  const selectedFiche = useSelector((state) => state.fiche.selectedFiche);
  const ficheDetailed = useLiveQuery(() => getFiche(Number(id)), [id]);
  const flashcards = useLiveQuery(
    () => (selectedFiche ? getFlashcardsFromFiche(selectedFiche?.id) : []),
    [selectedFiche],
  );
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleBackButton = () => {
    dispatch(selectFiche(null));
    navigate("/fiches");
  };

  useEffect(() => {
    if (!selectedProfile) navigate("/");
    if (!selectedFiche) navigate("/fiches");
  }, [selectedProfile, selectedFiche]);

  return (
    <>
      <Button
        size="sm"
        color="danger"
        radius="full"
        className="ml-3 w-fit"
        variant="light"
        startContent={<ArrowLeft size={16} />}
        onPress={handleBackButton}
      >
        Retour
      </Button>

      {/* Information de la fiche sélectionnée */}
      <BoxContent>
        <h2 className="text-2xl font-bold text-center">
          {ficheDetailed?.name}
        </h2>

        {ficheDetailed?.description && (
          <p className="text-sm text-foreground/60 text-center mt-1">
            {ficheDetailed?.description}
          </p>
        )}
      </BoxContent>

      <h2 className="text-1xl font-bold text-center mt-5">Flashcards</h2>

      <div className="flex justify-center mx-3">
        <Button
          size="sm"
          color="primary"
          radius="full"
          className="my-2"
          fullWidth
          onPress={() => {
            setFlashCardSelected(null);
            onOpen();
          }}
        >
          Créer une flashcard
        </Button>
      </div>

      {flashcards?.length > 0 ? (
        flashcards?.map((flashcard) => (
          <FlashCard
            key={flashcard.id}
            flashcard={flashcard}
            onEdit={() => {
              setFlashCardSelected(flashcard);
              onOpen();
            }}
          />
        ))
      ) : (
        <BoxContent>
          <p className="text-center">Aucunes flashcards</p>
        </BoxContent>
      )}

      <ModalFlashcard
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        flashcard={flashCardSelected}
        ficheId={Number(id)}
      />
    </>
  );
}
