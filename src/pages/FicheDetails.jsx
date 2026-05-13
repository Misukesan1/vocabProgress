import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router";
import { deleteFiche, getFiche } from "../database/fiche";
import BoxContent from "../componnents/BoxContent";
import FlashCard from "../componnents/FlashCard";
import { selectFiche } from "../features/ficheSlice";
import { Button, useDisclosure } from "@heroui/react";
import { ArrowLeft, Pencil, Trash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  activeAllFlashcards,
  getErrorsFlashcards,
  getFlashcardsFromFiche,
  getSelectedFlashcards,
} from "../database/flashcard";
import ModalFlashcard from "../componnents/ModalFlashcard";
import { setFlashcards, setTrainingMode } from "../features/trainingSlice";
import { showAlert } from "../features/alertSlice";
import ModalConfirm from "../componnents/ModalConfirm";
import ModalTrainingChoice from "../componnents/ModalTrainingChoice";
import ModalFiche from "../componnents/ModalFiche";

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
  const difficileFlashcards = useLiveQuery(() => getErrorsFlashcards(Number(id)))
  const dispatch = useDispatch();
  const { isOpen: isOpenFicheModal, onOpen: onOpenFicheModal, onOpenChange: onOpenChangeFicheModal } = useDisclosure();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isOpenConfirmModal,
    onOpen: onOpenConfirmModal,
    onOpenChange: onOpenChangeConfirmModal
  } = useDisclosure();
  const { 
    isOpen: isOpenTrainingStart,
    onOpen: onOpenTrainingStart,
    onOpenChange: onOpenChangeTrainingStart} = useDisclosure()

    const {
    isOpen: isOpenConfirmFicheModal,
    onClose: onCloseConfirmFicheModal,
    onOpen: onOpenConfirmFicheModal,
    onOpenChange: onOpenChangeConfirmFicheModal,
  } = useDisclosure();

  const handleBackButton = () => {
    dispatch(selectFiche(null));
    navigate("/fiches");
  };

    const handleDelete = async (fiche) => {
      try {
        await deleteFiche(fiche.id);
        dispatch(selectFiche(null))
        dispatch(showAlert({ message: "Fiche supprimée.", type: "success" }));
        onCloseConfirmFicheModal();
        navigate("/fiches");
      } catch (error) {
        console.log(error);
      }
    };

  const handleStartTrainning = () => {
    const shuffled = [...selectedsFlashcards].sort(() => Math.random() - 0.5);
    dispatch(setFlashcards(shuffled));
    dispatch(setTrainingMode("all"))
    navigate(`/fiche/${id}/training`);
  };

  const handleHardStartTraining = () => {
    const shuffled = [...difficileFlashcards].sort(() => Math.random() - 0.5);
    dispatch(setFlashcards(shuffled));
    dispatch(setTrainingMode("hard"))
    navigate(`/fiche/${id}/training`);
  }

  const handleSelectAllFlashcards = () => {
    activeAllFlashcards(Number(id));
    dispatch(
      showAlert({
        message: "Toutes les cartes sont maintenant à revoir.",
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

      {selectedsFlashcards?.length > 0 && (
        <div className="mx-3">
          <Button
            size="sm"
            color="primary"
            radius="full"
            className="my-2"
            fullWidth
            onPress={onOpenTrainingStart}
          >
            Démarrer la révision
          </Button>
        </div>
      )}

      {/* Information de la fiche sélectionnée */}
<BoxContent>
  <div className="flex justify-between items-start">
    <div>
      <h2 className="text-2xl font-bold">
          {ficheDetailed?.name}
      </h2>
      {ficheDetailed?.description && (
          <p className="text-sm text-foreground/60 mt-1">
              {ficheDetailed?.description}
          </p>
      )}
    </div>
    <div className="flex flex-col gap-1">
      <Button
        size="sm"
        isIconOnly
        radius="full"
        onPress={onOpenFicheModal}
      >
        <Pencil size={17} />
      </Button>
      <Button
        size="sm"
        isIconOnly
        color="danger"
        radius="full"
        onPress={onOpenConfirmFicheModal}
      >
        <Trash size={17} />
      </Button>
    </div>
  </div>
    <div className="flex justify-around mt-3">
        <div className="flex flex-col items-center">
            <p className="text-xl font-bold text-warning">{flashcards?.filter(f => !f.desactive).length}</p>
            <p className="text-xs text-foreground/60">À apprendre</p>
        </div>
        <div className="flex flex-col items-center">
            <p className="text-xl font-bold text-danger">{difficileFlashcards?.length}</p>
            <p className="text-xs text-foreground/60">À revoir</p>
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

      <ModalFiche isOpen={isOpenFicheModal} onOpenChange={onOpenChangeFicheModal} fiche={selectedFiche}/>

      <ModalConfirm
        isOpen={isOpenConfirmFicheModal}
        onOpenChange={onOpenChangeConfirmFicheModal}
        message={`Etes-vous sur de vouloir supprimer cette fiche "${selectedFiche?.name}" ? Cette action supprimera également les ${flashcards?.length} cartes associées et est irréversible.`}
        onConfirm={() => handleDelete(selectedFiche, onCloseConfirmFicheModal)}
      />

      <ModalTrainingChoice 
        onAllCards={handleStartTrainning}
        onHardCards={handleHardStartTraining}
        onOpenChange={onOpenChangeTrainingStart}
        isOpen={isOpenTrainingStart}
        hardCards={difficileFlashcards}
      />

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
