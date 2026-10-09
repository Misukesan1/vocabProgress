const STORAGE_KEY = "vocabprogress:training";

/**
 * Session d'entraînement persistée en localStorage : un rechargement de la page
 * (ou l'app fermée par le téléphone) reprend la révision sur la carte en cours.
 * Sauvegardée à chaque changement dans store.js.
 */

export function getLastTraining() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const training = raw ? JSON.parse(raw) : null;
    return training?.ficheId && Array.isArray(training.flashcards) ? training : null;
  } catch {
    return null;
  }
}

export function setLastTraining(training) {
  try {
    if (training?.ficheId) localStorage.setItem(STORAGE_KEY, JSON.stringify(training));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // stockage indisponible (navigation privée, quota dépassé, ...)
  }
}
