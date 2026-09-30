import { createSlice } from "@reduxjs/toolkit";

/**
 * Gestion de l'entrainement d'une fiche
 */

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
  },
  reducers: {
    // Démarre une nouvelle session (remplace toute session en cours)
    startTraining: (state, action) => {
      const { ficheId, flashcards } = action.payload;
      state.flashcards = flashcards;
      state.ficheId = ficheId;
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
    },
    nextRoundTraining: (state, action) => {
      state.flashcards = action.payload;
      state.isReversed = false;
      state.isFliped = false;
      state.tours += 1;
      state.currentIndex = 0;
      state.deselectWords = 0;
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
} = trainingSlice.actions;

export default trainingSlice.reducer;
