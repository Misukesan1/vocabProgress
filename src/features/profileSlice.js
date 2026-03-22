import { createSlice } from "@reduxjs/toolkit";

/**
 * Gestion de la sélection d'un profil dans l'application
 */

export const profileSlice = createSlice({
  name: "profile",
  initialState: {
    selectedProfile: null,
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
