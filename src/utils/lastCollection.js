const STORAGE_KEY = "vocabprogress:lastCollection";

/**
 * Collection sélectionnée persistée en localStorage pour la retrouver à la
 * réouverture de l'app (le profileSlice Redux, lui, est réinitialisé au reload).
 * La cohérence avec la base (collection renommée ou supprimée) est vérifiée
 * dans le Layout.
 */

export function getLastCollection() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLastCollection(collection) {
  try {
    if (collection) localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // stockage indisponible (navigation privée, quota dépassé, ...)
  }
}
