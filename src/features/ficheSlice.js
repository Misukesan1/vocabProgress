import { createSlice } from "@reduxjs/toolkit";

/**
 * Gestion de la sélection d'une fiche dans l'application
 */

export const ficheSlice = createSlice({
  name: "fiche",
  initialState: {
    selectedFiche: null,
  },
  reducers: {
    selectFiche: (state, action) => {
      state.selectedFiche = action.payload;
    },
  },
});

// créateurs d'action
export const { selectFiche } = ficheSlice.actions;

export default ficheSlice.reducer;
