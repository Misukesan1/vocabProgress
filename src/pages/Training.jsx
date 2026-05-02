import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import FlashCardTraining from "../componnents/FlashCardTraining";
import BoxContent from "../componnents/BoxContent";
import { Button, Progress } from "@heroui/react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import {
  clearTraining,
  deselectWord,
  flipCard,
  incrementCurrentIndex,
  nextRoundTraining,
} from "../features/trainingSlice";
import {
  getSelectedFlashcards,
  toggleStatusFlashcard,
} from "../database/flashcard";
import { useLiveQuery } from "dexie-react-hooks";
import { showAlert } from "../features/alertSlice";

export default function Training() {
  const { id } = useParams();
  const flashcardsList = useSelector((state) => state.training.flashcards);
  const currentIndex = useSelector((state) => state.training.currentIndex);
  const isFlipped = useSelector((state) => state.training.isFliped);
  const turnNumber = useSelector((state) => state.training.tours);
  const wordsDeselected = useSelector((state) => state.training.deselectWords);
  const totalWordsDeselected = useSelector(
    (state) => state.training.totalDeselectWords,
  );
  const progress = Math.round((currentIndex / flashcardsList.length) * 100);

  const selectedFiche = useSelector((state) => state.fiche.selectedFiche);
  const selectedsFlashcards = useLiveQuery(
    () => (selectedFiche ? getSelectedFlashcards(selectedFiche?.id) : []),
    [selectedFiche],
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  /**
   * Au clic sur la carte ou sur le bouton suivant
   */
  const onPress = () => {
    if (isFlipped) {
      dispatch(flipCard(false));
      dispatch(incrementCurrentIndex());
    } else {
      dispatch(flipCard(!isFlipped));
    }
  };

  const deselectFlashcard = () => {
    try {
      toggleStatusFlashcard(
        flashcardsList[currentIndex].id,
        flashcardsList[currentIndex].desactive,
      );
      dispatch(flipCard(false));
      dispatch(incrementCurrentIndex());
      dispatch(deselectWord());
      dispatch(
        showAlert({
          message: "Vous avez déselectionné la carte.",
          type: "success",
        }),
      );
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * clic sur le bouton continuer pour commencer un nouveau tour
   */
  const againTraining = () => {
    const shuffled = [...selectedsFlashcards].sort(() => Math.random() - 0.5);
    dispatch(nextRoundTraining(shuffled));
  };

  return (
    <>
      <Button
        size="sm"
        color="danger"
        radius="full"
        className="ml-3 w-fit"
        variant="light"
        startContent={<ArrowLeft size={16} />}
        onPress={() => {
          dispatch(clearTraining());
          navigate(`/fiche/${id}`);
        }}
      >
        Arrêter l'entrainement
      </Button>

      {/* Information de la fiche sélectionnée à réviser et de l'entrainement en cours */}
      <BoxContent>
        <h2 className="text-center">
          Révision de la fiche :{" "}
          <span className="font-bold">{selectedFiche.name}</span>
        </h2>
        <div className="mt-1">
          <p className="flex justify-between mb-1">
            Progression :{" "}
            <span className="font-light">
              {currentIndex + 1}/{flashcardsList.length}
            </span>
          </p>
          <Progress
            size="md"
            aria-label="Entrainement en cours ..."
            className="max-w-md"
            value={progress}
          />
        </div>
        <div className="mt-1">
          <p>
            Tour n° : <span className="font-light">{turnNumber + 1}</span>
          </p>
          <p>
            Nombre total de mots désélectionnés :{" "}
            <span className="font-light">{totalWordsDeselected}</span>
          </p>
        </div>
      </BoxContent>


      {!isFlipped && flashcardsList[currentIndex] !== undefined && (
        <p className="text-center mt-2 font-light italic">
          Cliquez sur la carte pour la retourner.
        </p>
      )}

      {/* Affichage de la carte actuelle */}
      {flashcardsList[currentIndex] !== undefined && (
        <FlashCardTraining
          frontCard={flashcardsList[currentIndex]?.frontCard}
          backCard={flashcardsList[currentIndex]?.backCard}
          isFlipped={isFlipped}
          onPress={onPress}
        />
      )}

      {/* Affichage des options lorsque la carte est retournée */}
      {isFlipped && (
        <div className="flex justify-between items-center mx-3">
          <Button
            size="sm"
            color="secondary"
            radius="full"
            className="w-fit"
            startContent={<X size={16} />}
            onPress={deselectFlashcard}
          >
            Déselectionner la flashcard
          </Button>
          <Button
            size="sm"
            color="primary"
            radius="full"
            className="w-fit"
            endContent={<ArrowRight size={16} />}
            onPress={onPress}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Affichage de fin d'entrainement pour relancer un tour ou si tous les mots ont été déselectionnés */}
      {flashcardsList[currentIndex] === undefined && (
        <BoxContent>
          <p className="text-center font-bold">Entrainement terminé !</p>
          {selectedsFlashcards?.length === 0 ? (
            <p className="text-center mb-3">
              Vous avez déselectionné tous les mots de la liste.
            </p>
          ) : (
            <p className="text-center mb-3">
              Vous avez déselectionné {wordsDeselected} mots sur un total de{" "}
              {flashcardsList.length}.
            </p>
          )}

          <div className="flex justify-center gap-3">
            {selectedsFlashcards?.length > 0 && (
              <Button
                size="sm"
                color="primary"
                radius="full"
                className="w-fit"
                onPress={againTraining}
              >
                Continuer
              </Button>
            )}
            <Button
              size="sm"
              color="danger"
              radius="full"
              className="w-fit"
              onPress={() => {
                dispatch(clearTraining());
                navigate(`/fiche/${id}`);
              }}
            >
              Quitter
            </Button>
          </div>
        </BoxContent>
      )}
    </>
  );
}
