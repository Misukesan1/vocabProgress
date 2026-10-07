import { createSlice } from "@reduxjs/toolkit";

/**
 * Gestion de l'entrainement d'une fiche
 * `mode` : "cards" (carte à retourner) ou "quiz" (QCM : une carte, 6 réponses au choix).
 * En QCM, `quizCardId` / `quizChoiceIds` décrivent la question affichée (régénérée
 * quand la carte courante change), `quizAnswerId` la réponse choisie (null = pas encore
 * répondu) et `quizCorrect` le nombre de bonnes réponses du tour.
 */

const initialQuiz = {
  quizCardId: null,
  quizChoiceIds: [],
  quizAnswerId: null,
};

/** Route de la session selon son mode */
export const trainingPath = (ficheId, mode) => `/fiche/${ficheId}/${mode === "quiz" ? "qcm" : "training"}`;

export const trainingSlice = createSlice({
  name: "training",
  initialState: {
    flashcards: [],
    isReversed: false,
    isFliped: false,
    tours: 0,
    deselectWords: 0,
    totalDeselectWords: 0,
    currentIndex: 0,
    ficheId: null,
    mode: "cards",
    ...initialQuiz,
    quizCorrect: 0,
  },
  reducers: {
    // Démarre une nouvelle session (remplace toute session en cours)
    startTraining: (state, action) => {
      const { ficheId, flashcards, mode = "cards" } = action.payload;
      state.flashcards = flashcards;
      state.ficheId = ficheId;
      state.mode = mode;
      Object.assign(state, initialQuiz);
      state.quizCorrect = 0;
      state.isReversed = false;
      state.isFliped = false;
      state.tours = 0;
      state.deselectWords = 0;
      state.totalDeselectWords = 0;
      state.currentIndex = 0;
    },
    setFlashcards: (state, action) => {
      state.flashcards = action.payload;
    },
    incrementCurrentIndex: (state) => {
      state.currentIndex += 1;
    },
    flipCard: (state, action) => {
      state.isFliped = action.payload;
    },
    reverseCard: (state) => {
      state.isReversed = !state.isReversed
      // QCM : les réponses changent de face, la question est régénérée
      Object.assign(state, initialQuiz);
    },
    clearTraining: (state) => {
      state.flashcards = [];
      state.isReversed = false;
      state.isFliped = false;
      state.tours = 0;
      state.deselectWords = 0;
      state.totalDeselectWords = 0;
      state.currentIndex = 0;
      state.ficheId = null;
      state.mode = "cards";
      Object.assign(state, initialQuiz);
      state.quizCorrect = 0;
    },
    nextRoundTraining: (state, action) => {
      state.flashcards = action.payload;
      state.isReversed = false;
      state.isFliped = false;
      state.tours += 1;
      state.currentIndex = 0;
      state.deselectWords = 0;
      Object.assign(state, initialQuiz);
      state.quizCorrect = 0;
    },
    // Carte modifiée pendant la session : on remplace sa copie
    updateTrainingCard: (state, action) => {
      const index = state.flashcards.findIndex((card) => card.id === action.payload.id);
      if (index !== -1) state.flashcards[index] = action.payload;
    },
    // Carte supprimée pendant la session : la suivante prend sa place
    removeTrainingCard: (state, action) => {
      const index = state.flashcards.findIndex((card) => card.id === action.payload);
      if (index === -1) return;
      state.flashcards.splice(index, 1);
      if (index < state.currentIndex) state.currentIndex -= 1;
      state.isFliped = false;
      Object.assign(state, initialQuiz);
    },
    // QCM : nouvelle question pour la carte courante
    setQuizQuestion: (state, action) => {
      const { cardId, choiceIds } = action.payload;
      state.quizCardId = cardId;
      state.quizChoiceIds = choiceIds;
      state.quizAnswerId = null;
    },
    // QCM : réponse choisie (une seule par question)
    answerQuiz: (state, action) => {
      if (state.quizAnswerId !== null) return;
      state.quizAnswerId = action.payload;
      if (action.payload === state.quizCardId) state.quizCorrect += 1;
    },
    deselectWord: (state) => {
      state.deselectWords += 1;
      state.totalDeselectWords += 1;
    },
  },
});

// créateurs d'action
export const {
  setFlashcards,
  clearTraining,
  flipCard,
  incrementCurrentIndex,
  nextRoundTraining,
  deselectWord,
  reverseCard,
  startTraining,
  updateTrainingCard,
  removeTrainingCard,
  setQuizQuestion,
  answerQuiz,
} = trainingSlice.actions;

export default trainingSlice.reducer;
