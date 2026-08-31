import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router";
import { deleteFiche, getFiche } from "../database/fiche";
import BoxContent from "../componnents/BoxContent";
import FlashCard from "../componnents/FlashCard";
import { selectFiche } from "../features/ficheSlice";
import { Button, useDisclosure } from "@heroui/react";
import { ArrowLeft, Pencil, Play, Plus, Trash, TriangleAlert } from "lucide-react";
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
import FlashcardFilter from "../componnents/FlashcardFilter";
import DropdownMenuFiche from "../componnents/DropdownMenuFiche";

export default function FicheDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [flashCardSelected, setFlashCardSelected] = useState(null); // indication pour la creation/modification de la carte
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
  const difficileFlashcards = useLiveQuery(() =>
    getErrorsFlashcards(Number(id)),
  );
  const [searchValue, setSearchValue] = useState("")
  const [filterValue, setFilterValue] = useState("all")
  const filteredFlashcards = flashcards?.slice().filter(
    (card) => {
      return card.frontCard.toLowerCase().includes(searchValue.toLowerCase()) ||
      card.backCard.toLowerCase().includes(searchValue.toLowerCase())
  }).filter(
    (card) => {
      if (filterValue === "all") return card
      if (filterValue === "difficiles") return card.errors > 0
      if (filterValue === "maitrisees") return card.desactive
    }
  )
  const dispatch = useDispatch();
  const {
    isOpen: isOpenFicheModal,
    onOpen: onOpenFicheModal,
    onOpenChange: onOpenChangeFicheModal,
  } = useDisclosure();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isOpenConfirmModal,
    onOpen: onOpenConfirmModal,
    onOpenChange: onOpenChangeConfirmModal,
  } = useDisclosure();
  const {
    isOpen: isOpenTrainingStart,
    onOpen: onOpenTrainingStart,
    onOpenChange: onOpenChangeTrainingStart,
  } = useDisclosure();

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
      dispatch(selectFiche(null));
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
    dispatch(setTrainingMode("all"));
    navigate(`/fiche/${id}/training`);
  };

  const handleHardStartTraining = () => {
    const shuffled = [...difficileFlashcards].sort(() => Math.random() - 0.5);
    dispatch(setFlashcards(shuffled));
    dispatch(setTrainingMode("hard"));
    navigate(`/fiche/${id}/training`);
  };

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
      {/* Retour vers la liste des fiches de la collection sélectionnée */}
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{ficheDetailed?.name}</h2>
            {ficheDetailed?.description && (
              <p className="text-sm text-foreground/60 mt-1">
                {ficheDetailed?.description}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <DropdownMenuFiche 
              fiche={selectedFiche} 
              flashcards={flashcards}
            />
            <Button
              color="primary"
              radius="md"
              isIconOnly
              onPress={() => {
                setFlashCardSelected(null);
                onOpen();
              }}
            >
              <Plus size={18} />
            </Button>
            {/* <Button
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
            </Button> */}
          </div>
        </div>
        <div className="grid grid-cols-4 mt-3">
          <div className="flex flex-col items-center">
            <p className="text-xl font-bold text-warning">
              {flashcards?.filter((f) => !f.desactive).length}
            </p>
            <p className="text-xs text-foreground/60">À apprendre</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xl font-bold text-danger">
              {difficileFlashcards?.length}
            </p>
            <p className="text-xs text-foreground/60">À revoir</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xl font-bold text-success">
              {flashcards?.filter((f) => f.desactive).length}
            </p>
            <p className="text-xs text-foreground/60">Maîtrisées</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xl font-bold text-primary">
              {flashcards?.length}
            </p>
            <p className="text-xs text-foreground/60">Total</p>
          </div>
        </div>
        <Button 
          color="primary" 
          size="sm" 
          className="mx-auto mt-5"
          startContent={<Play size={15} />}
          onPress={handleStartTrainning}
        >Lancer la révision</Button>

        {difficileFlashcards?.length > 0 &&
          <Button 
            color="danger" 
            size="sm" 
            className="mx-auto mt-1"
            startContent={<TriangleAlert size={15} />}
            onPress={handleHardStartTraining}
          >Cartes "à revoir"</Button>
        }
        
      </BoxContent>

      {/* Pas de cartes dans la fiche */}
      {flashcards?.length === 0 && (
        <BoxContent>
          <div className="flex flex-col justify-center items-center">
            <p className="font-light">Aucune cartes dans cette fiche</p>
            <Button
              className="mt-2 mx-auto"
              size="sm"
              radius="full"
              color="primary"
              startContent={<Plus size={18} />}
              onPress={() => {
                setFlashCardSelected(null);
                onOpen();
              }}
            >
              Ajouter ma première carte
            </Button>
          </div>
        </BoxContent>
      )}

      {/* Filtre des flashcards */}
      {flashcards?.length > 0 && (
        <BoxContent>
          <FlashcardFilter
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            filter={filterValue}
            onFilterChange={setFilterValue}
            flashcards={flashcards}
          />
        </BoxContent>
      )}

      {/* <div className="flex flex-col justify-center mx-3 mt-3">
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
      </div> */}

      {/* Affichage des cartes de la fiche */}
      {filteredFlashcards?.length > 0 &&
        filteredFlashcards?.map((flashcard) => (
          <FlashCard
            key={flashcard.id}
            flashcard={flashcard}
            onEdit={() => {
              setFlashCardSelected(flashcard);
              onOpen();
            }}
          />
        ))}

      <ModalFiche
        isOpen={isOpenFicheModal}
        onOpenChange={onOpenChangeFicheModal}
        fiche={selectedFiche}
      />

      <ModalConfirm
        isOpen={isOpenConfirmFicheModal}
        onOpenChange={onOpenChangeConfirmFicheModal}
        message={
         `Etes-vous sur de vouloir supprimer cette fiche "${selectedFiche?.name}" ? 
          ${(flashcards?.length === 0) 
            ? `Cette fiche ne contient pas de cartes et cette action est irréversible.` 
            : `Cette action supprimera également les ${flashcards?.length} cartes associées et est irréversible.`}`}
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
        message={
          "Etes-vous sur de vouloir remettre toutes les cartes en révision ?"
        }
        onConfirm={handleSelectAllFlashcards}
      />
    </>
  );
}
