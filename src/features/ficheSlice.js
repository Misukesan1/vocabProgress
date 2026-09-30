import { createSlice } from "@reduxjs/toolkit";
import { getLastFiche } from "../utils/lastFiche";

/**
 * Gestion de la sélection d'une fiche dans l'application
 * (restaurée depuis localStorage au démarrage, sauvegardée dans store.js).
 * Elle appartient toujours à la collection sélectionnée : changer de
 * collection efface la fiche sélectionnée.
 */

export const ficheSlice = createSlice({
  name: "fiche",
  initialState: {
    selectedFiche: getLastFiche(),
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
