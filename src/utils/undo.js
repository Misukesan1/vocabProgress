// Action « Annuler » de la dernière notification (hors Redux : une fonction n'y est pas sérialisable)
let undoAction = null;

/** À appeler juste avant showAlert({ ..., undoable: true }) */
export function setUndo(action) {
  undoAction = action;
}

export function runUndo() {
  const action = undoAction;
  undoAction = null;
  action?.();
}
