const STORAGE_KEY = "vocabprogress:lastFiche";

/**
 * Fiche sélectionnée persistée en localStorage pour la retrouver à la
 * réouverture de l'app (le ficheSlice Redux, lui, est réinitialisé au reload).
 * La cohérence avec la base (fiche renommée ou supprimée) est vérifiée
 * dans le Layout.
 */

export function getLastFiche() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLastFiche(fiche) {
  try {
    if (fiche) localStorage.setItem(STORAGE_KEY, JSON.stringify(fiche));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // stockage indisponible (navigation privée, quota dépassé, ...)
  }
}
