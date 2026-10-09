import { createSlice } from "@reduxjs/toolkit";

/**
 * Notifications des actions de l'application (affichées par AlertToast).
 * `long` : message à lire, affiché plus longtemps. `undoable` : bouton « Annuler »
 * qui exécute l'action enregistrée avec setUndo (utils/undo.js).
 */

export const alertSlice = createSlice({
  name: "alert",
  initialState: {
    message: "",
    type: "success",
    isVisible: false,
    long: false,
    undoable: false,
  },
  reducers: {
    showAlert: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.long = !!action.payload.long;
      state.undoable = !!action.payload.undoable;
      state.isVisible = true;
    },
    hideAlert: (state) => {
      state.isVisible = false;
    },
  },
});

// créateurs d'action
export const { showAlert, hideAlert } = alertSlice.actions;

export default alertSlice.reducer;
