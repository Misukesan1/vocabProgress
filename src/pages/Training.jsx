import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import FlashCardTraining from "../componnents/FlashCardTraining";
import BoxContent from "../componnents/BoxContent";
import { Button, Progress, Switch } from "@heroui/react";
import { ArrowLeft, BadgeCheck, BookAlert, CheckCheck } from "lucide-react";
import {
  clearTraining,
  deselectWord,
  flipCard,
  incrementCurrentIndex,
  nextRoundTraining,
  reverseCard,
} from "../features/trainingSlice";
import {
  getErrorsFlashcards,
  getSelectedFlashcards,
  incrementError,
  toggleStatusFlashcard,
} from "../database/flashcard";
import { useLiveQuery } from "dexie-react-hooks";
import { showAlert } from "../features/alertSlice";
import { useState } from "react";

export default function Training() {
  const { id } = useParams();
  const flashcardsList = useSelector((state) => state.training.flashcards);
  const currentIndex = useSelector((state) => state.training.currentIndex);
  const isFlipped = useSelector((state) => state.training.isFliped);
  const isReversed = useSelector((state) => state.training.isReversed);
  const turnNumber = useSelector((state) => state.training.tours);
  const wordsDeselected = useSelector((state) => state.training.deselectWords);
  const trainingMode = useSelector((state) => state.training.trainingMode)
  const totalWordsDeselected = useSelector(
    (state) => state.training.totalDeselectWords,
  );
  const progress = Math.round(
    ((currentIndex + 1) / flashcardsList.length) * 100,
  );

  const selectedFiche = useSelector((state) => state.fiche.selectedFiche);
  // const selectedsFlashcards = useLiveQuery(
  //   () => (selectedFiche ? getSelectedFlashcards(selectedFiche?.id) : []),
  //   [selectedFiche],
  // );
  const selectedsFlashcards = useLiveQuery(() => {
    if (!selectedFiche) return []
    if (trainingMode === "hard") return getErrorsFlashcards(selectedFiche?.id)
      return getSelectedFlashcards(selectedFiche?.id)
  }, [selectedFiche, trainingMode])

  const [toggleReversed, setToggleReversed] = useState(isReversed)
  const [sessionStart] = useState(new Date()); // date de début de session, ne change jamais
  const [turnStart, setTurnStart] = useState(new Date()); // date de début du tour, se remet à jour
  const [formatedTimeTurn, setFormattedTimeTurn] = useState("");
  const [formatedTimeSession, setFormattedTimeSession] = useState("");
  const [endTraining, setEndTraining] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const calculateTime = () => {
    if (currentIndex === flashcardsList.length - 1) {
        const now = new Date()
        const diffTurn = now - turnStart
        const secTurn = Math.floor((diffTurn / 1000) % 60)
        const minTurn = Math.floor(diffTurn / 1000 / 60)
        setFormattedTimeTurn(`${minTurn}:${secTurn.toString().padStart(2, "0")}`)
        const diffSession = now - sessionStart
        const secSession = Math.floor((diffSession / 1000) % 60)
        const minSession = Math.floor(diffSession / 1000 / 60)
        setFormattedTimeSession(`${minSession}:${secSession.toString().padStart(2, "0")}`)
    }
}

  /**
   * Au clic sur la carte ou sur le bouton suivant
   */
  const onPress = () => {
    if (isFlipped) {
      calculateTime()
      dispatch(flipCard(false));
      dispatch(incrementCurrentIndex());
    } else {
      dispatch(flipCard(!isFlipped));
    }
  };

  const reverseCardTraining = () => {
    dispatch(reverseCard())
    setToggleReversed(!toggleReversed)
  }

  const deselectFlashcard = () => {
    try {
      toggleStatusFlashcard(
        flashcardsList[currentIndex].id,
        flashcardsList[currentIndex].desactive,
      );
      calculateTime()
      dispatch(flipCard(false));
      dispatch(incrementCurrentIndex());
      dispatch(deselectWord());
      if (selectedsFlashcards?.length === 1) setEndTraining(true);
      dispatch(
        showAlert({
          message: "Vous maîtrisez cette carte.",
          type: "success",
        }),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const pressBtnARevoir = () => {
    try {
      incrementError(flashcardsList[currentIndex].id)
      calculateTime()
      dispatch(
        showAlert({
          message: `Vous marquez cette carte comme "difficile".`,
          type: "success",
        }),
      );
      dispatch(flipCard(false));
      dispatch(incrementCurrentIndex());
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * clic sur le bouton continuer pour commencer un nouveau tour
   */
  const againTraining = () => {
    setTurnStart(new Date());
    const cards = trainingMode === "hard" 
        ? selectedsFlashcards.filter(f => f.errors > 0)
        : selectedsFlashcards
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    dispatch(nextRoundTraining(shuffled))
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
          // setEndTraining(false)
          navigate(`/fiche/${id}`);
        }}
      >
        Quitter la révision
      </Button>

      {/* Information de la fiche sélectionnée à réviser et de l'entrainement en cours */}
      <BoxContent>
        <h2 className="text-center">
          Révision de la fiche :{" "}
          <span className="font-bold">{selectedFiche?.name}</span>
        </h2>
        <div className="mt-1">
          <p className="flex justify-between mb-1">
            Progression :{" "}
            <span className="font-light">
              {flashcardsList[currentIndex] !== undefined
                ? `${currentIndex + 1}/${flashcardsList.length}`
                : `${flashcardsList.length}/${flashcardsList.length}`}
            </span>
          </p>
          <Progress
            size="md"
            aria-label="Révision en cours ..."
            className="w-full"
            value={progress}
          />
        </div>
        <div className="mt-1">
          <p>
            Tour n° : <span className="font-light">{turnNumber + 1}</span>
          </p>
          <p>
            Nombre de cartes maîtrisées :{" "}
            <span className="font-light">{totalWordsDeselected}</span>
          </p>
        </div>
      </BoxContent>

      {flashcardsList[currentIndex] !== undefined &&
        <BoxContent>
          <div className="flex flex-col justify-center items-center gap-1">
            <Switch size="sm" isSelected={toggleReversed} onChange={reverseCardTraining} />
            <p className="text-xs font-light">{toggleReversed ? "Face B / Face A" : "Face A / Face B"}</p>
          </div>
        </BoxContent>
      }

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
          isReversed={isReversed}
        />
      )}

      {/* Affichage des options lorsque la carte est retournée */}
      {isFlipped && (
        <div className="w-60 grid grid-cols-3 mx-auto gap-2">

          <div className="flex flex-col justify-center items-center">
            <Button onPress={pressBtnARevoir} radius="full" isIconOnly variant="flat" color="danger">
              <BookAlert />
            </Button>
            <p className="text-xs font-light">A revoir</p>
          </div>

          <div className="flex flex-col justify-center items-center">
            <Button onPress={onPress} radius="full" isIconOnly variant="flat" color="primary">
              <CheckCheck />
            </Button>
            <p className="text-xs font-light">Je connais</p>
          </div>

          <div className="flex flex-col justify-center items-center">
            <Button onPress={deselectFlashcard} radius="full" isIconOnly variant="flat" color="success">
              <BadgeCheck />
            </Button>
            <p className="text-xs font-light">Je maîtrise</p>
          </div>

        </div>
      )}

      {/* Affichage de fin d'entrainement pour relancer un tour ou si tous les mots ont été déselectionnés */}
      {flashcardsList[currentIndex] === undefined && (
        <BoxContent>
          {selectedsFlashcards?.length === 0 || endTraining ? (
            <>
              <p className="text-center font-bold">Révision arrêtée.</p>
              <p className="text-center mb-3">
                Temps total de la révision : {formatedTimeSession}
              </p>
            </>
          ) : (
            <>
              <p className="text-center font-bold">Tour terminé !</p>
              <p className="text-center mb-3">
                Vous avez maîtrisé {wordsDeselected} cartes sur un total de{" "}
                {flashcardsList.length}.
              </p>
              <p className="text-center mb-3">
                Temps total de la révision : {formatedTimeSession}
              </p>
            </>
          )}

          <div className="flex justify-center gap-3">
            {(selectedsFlashcards?.length > 0 && !endTraining) && (
              <Button
                size="sm"
                color="primary"
                radius="full"
                className="w-fit"
                onPress={againTraining}
              >
                Continuer à réviser
              </Button>
            )}
            <Button
              size="sm"
              color="danger"
              radius="full"
              className="w-fit"
              onPress={() => {
                if (endTraining) navigate(`/fiche/${id}`);
                calculateTime()
                dispatch(clearTraining());
                setEndTraining(true);
              }}
            >
              {endTraining ? "Quitter la révision" : "Arrêter"}
            </Button>
          </div>
        </BoxContent>
      )}
    </>
  );
}
