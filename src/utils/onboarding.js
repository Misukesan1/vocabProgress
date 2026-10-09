import { useLocation } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../database/db";

const TUTORIAL_KEY = "vocabprogress:tutorialPending";
const SKIPPED_KEY = "vocabprogress:tutorialSkipped";

/**
 * Ouverture des premiers pas : le tutoriel (collection, fiche, cartes, première
 * révision) continue jusqu'au récap, dont « C'est parti ! » le termine (finishTutorial)
 */
export function markTutorialPending() {
  try {
    localStorage.setItem(TUTORIAL_KEY, "1");
  } catch {
    // stockage indisponible : pas de récap, l'app reste utilisable
  }
}

/**
 * Tutoriel commencé et pas encore validé sur le récap ? Une révision lancée
 * pendant ce temps est la première : un seul tour, puis le récap.
 * @returns {boolean}
 */
export function isTutorialPending() {
  try {
    return localStorage.getItem(TUTORIAL_KEY) === "1";
  } catch {
    return false;
  }
}

/** « C'est parti ! » sur le récap, ou données effacées / restaurées : l'app se déverrouille */
export function finishTutorial() {
  try {
    localStorage.removeItem(TUTORIAL_KEY);
  } catch {
    // rien à nettoyer
  }
}

/** « Découvrir l'appli par moi-même » : plus de tutoriel ni de verrouillage */
export function skipTutorial() {
  try {
    localStorage.removeItem(TUTORIAL_KEY);
    localStorage.setItem(SKIPPED_KEY, "1");
  } catch {
    // stockage indisponible : le tutoriel restera proposé
  }
}

/** Données effacées : on revient à la toute première utilisation (bienvenue + tutoriel) */
export function resetTutorial() {
  try {
    localStorage.removeItem(TUTORIAL_KEY);
    localStorage.removeItem(SKIPPED_KEY);
  } catch {
    // rien à nettoyer
  }
}

export function isTutorialSkipped() {
  try {
    return localStorage.getItem(SKIPPED_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Tutoriel passé (« Découvrir l'appli par moi-même ») ? L'accueil vide n'affiche
 * alors plus la bienvenue.
 * @returns {boolean}
 */
export function useTutorialSkipped() {
  useLocation(); // relit le marqueur à chaque navigation
  return isTutorialSkipped();
}

/**
 * Est-on dans le tutoriel ? Accueil sans aucune collection (bienvenue), puis dès
 * l'ouverture des premiers pas et jusqu'à « C'est parti ! » sur le récap, quelle
 * que soit la page (accueil, Options...). Les menus (barre du bas, logo) y sont verrouillés.
 * Jamais une fois le tutoriel passé, ni terminé : supprimer ensuite toutes ses cartes
 * ne reverrouille pas l'app (seule la suppression de toutes les collections ramène à la bienvenue).
 * @returns {boolean}
 */
export function useInTutorial() {
  const { pathname } = useLocation(); // relit le marqueur à chaque navigation
  const collectionCount = useLiveQuery(() => db.profile.count());
  if (isTutorialSkipped()) return false;
  return collectionCount === 0 || pathname.startsWith("/premiers-pas") || isTutorialPending();
}
