import { createSlice } from "@reduxjs/toolkit";
import { getLastCollection } from "../utils/lastCollection";

/**
 * Gestion de la sélection d'un profil dans l'application
 * (restauré depuis localStorage au démarrage, sauvegardé dans store.js)
 */

export const profileSlice = createSlice({
  name: "profile",
  initialState: {
    selectedProfile: getLastCollection(),
  },
  reducers: {
    selectProfile: (state, action) => {
      state.selectedProfile = action.payload;
    },
  },
});

// créateurs d'action
export const { selectProfile } = profileSlice.actions;

export default profileSlice.reducer;
