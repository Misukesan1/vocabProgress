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
import {
  activeAllFlashcards,
  getFlashcardsFromFiche,
  getSelectedFlashcards,
} from "../database/flashcard";
import ModalFlashcard from "../componnents/ModalFlashcard";
import { setFlashcards } from "../features/trainingSlice";
import { showAlert } from "../features/alertSlice";
import ModalConfirm from "../componnents/ModalConfirm";

export default function FicheDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [flashCardSelected, setFlashCardSelected] = useState(null);
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);
  const selectedFiche = useSelector((state) => state.fiche.selectedFiche);
  const trainingInProgress = useSelector((state) => state.training.flashcards);
  const ficheDetailed = useLiveQuery(() => getFiche(Number(id)), [id]);
  const flashcards = useLiveQuery(
    () => (selectedFiche ? getFlashcardsFromFiche(selectedFiche?.id) : []),
    [selectedFiche],
  );
  const hasDesactive = flashcards?.some((e) => e.desactive); // boolean pour vérifier si au moins une flashcard est désactivée pour afficher le bouton
  const selectedsFlashcards = useLiveQuery(
    () => (selectedFiche ? getSelectedFlashcards(selectedFiche?.id) : []),
    [selectedFiche],
  );
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isOpenConfirmModal,
    onOpen: onOpenConfirmModal,
    onOpenChange: onOpenChangeConfirmModal
  } = useDisclosure();

  const handleBackButton = () => {
    dispatch(selectFiche(null));
    navigate("/fiches");
  };

  const handleStartTrainning = () => {
    const shuffled = [...selectedsFlashcards].sort(() => Math.random() - 0.5);
    dispatch(setFlashcards(shuffled));
    navigate(`/fiche/${id}/training`);
  };

  const handleSelectAllFlashcards = () => {
    activeAllFlashcards(Number(id));
    dispatch(
      showAlert({
        message: "Toutes les flashcards ont été sélectionnées.",
        type: "success",
      }),
    );
  };

  useEffect(() => {
    if (!selectedProfile) navigate("/");
    if (!selectedFiche) navigate("/fiches");
    if (trainingInProgress.length > 0) navigate(`/fiche/${id}/training`);
  }, [selectedProfile, selectedFiche, trainingInProgress]);

  if (trainingInProgress.length > 0) return null;

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

      {flashcards?.length > 0 && (
        <div className="mx-3">
          <Button
            size="sm"
            color="primary"
            radius="full"
            className="my-2"
            fullWidth
            onPress={handleStartTrainning}
          >
            Démarrer la révision
          </Button>
        </div>
      )}

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
    <div className="flex justify-around mt-3">
        <div className="flex flex-col items-center">
            <p className="text-xl font-bold text-warning">{flashcards?.filter(f => !f.desactive).length}</p>
            <p className="text-xs text-foreground/60">À apprendre</p>
        </div>
        <div className="flex flex-col items-center">
            <p className="text-xl font-bold text-success">{flashcards?.filter(f => f.desactive).length}</p>
            <p className="text-xs text-foreground/60">Maîtrisées</p>
        </div>
        <div className="flex flex-col items-center">
            <p className="text-xl font-bold text-primary">{flashcards?.length}</p>
            <p className="text-xs text-foreground/60">Total</p>
        </div>
    </div>
</BoxContent>

      <div className="flex flex-col justify-center mx-3 mt-3">
        <Button
          size="sm"
          color="secondary"
          radius="full"
          className="my-1"
          fullWidth
          onPress={() => {
            setFlashCardSelected(null);
            onOpen();
          }}
        >
          Créer une carte
        </Button>
        {hasDesactive && (
          <Button
            size="sm"
            color="secondary"
            radius="full"
            variant="ghost"
            className="my-1"
            fullWidth
            onPress={onOpenConfirmModal}
          >
            Remettre toutes les cartes en révision
          </Button>
        )}
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
          <p className="text-center">Aucunes cartes</p>
        </BoxContent>
      )}

      <ModalFlashcard
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        flashcard={flashCardSelected}
        ficheId={Number(id)}
      />

      <ModalConfirm
        isOpen={isOpenConfirmModal}
        onOpenChange={onOpenChangeConfirmModal}
        message={"Etes-vous sur de vouloir remettre toutes les cartes en révision ?"}
        onConfirm={handleSelectAllFlashcards}
      />
    </>
  );
}
