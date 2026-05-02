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
  },
  reducers: {
    setFlashcards: (state, action) => {
      state.flashcards = action.payload;
    },
    incrementCurrentIndex: (state) => {
      state.currentIndex += 1;
    },
    flipCard: (state, action) => {
      state.isFliped = action.payload;
    },
    clearTraining: (state) => {
      state.flashcards = [];
      state.isReversed = false;
      state.isFliped = false;
      state.tours = 0;
      state.deselectWords = 0;
      state.totalDeselectWords = 0;
      state.currentIndex = 0;
    },
    nextRoundTraining: (state, action) => {
      state.flashcards = action.payload;
      state.isReversed = false;
      state.isFliped = false;
      state.tours += 1;
      state.currentIndex = 0;
      state.deselectWords = 0;
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
} = trainingSlice.actions;

export default trainingSlice.reducer;
