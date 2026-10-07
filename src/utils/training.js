import { normalizeSearch } from "./search";

/** QCM : nombre de réponses proposées (la bonne + les leurres) */
export const QUIZ_CHOICES = 6;

/** QCM : nombre minimum de cartes dans la fiche pour pouvoir le lancer */
export const QUIZ_MIN_CARDS = QUIZ_CHOICES + 1;

/**
 * Mélange (Fisher-Yates) sans modifier le tableau d'origine
 * @template T
 * @param {T[]} cards
 * @returns {T[]}
 */
export function shuffle(cards) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Durée au format m:ss
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  return `${Math.floor(totalSec / 60)}:${(totalSec % 60).toString().padStart(2, "0")}`;
}

/**
 * Réponses d'une question de QCM : la carte et des leurres de la même fiche
 * (maîtrisées comprises), dans un ordre aléatoire. Un leurre n'a jamais la même
 * réponse que la bonne carte (sinon deux réponses seraient justes) ni qu'un autre leurre.
 * @template {{id: number, frontCard: string, backCard: string}} T
 * @param {T} card la carte de la question
 * @param {T[]} ficheCards toutes les cartes de la fiche
 * @param {boolean} isReversed true = question au verso, réponses au recto
 * @returns {T[]}
 */
export function buildQuizChoices(card, ficheCards, isReversed) {
  const answerOf = (flashcard) => normalizeSearch(isReversed ? flashcard.frontCard : flashcard.backCard);
  const usedAnswers = new Set([answerOf(card)]);
  const distractors = [];

  for (const flashcard of shuffle(ficheCards)) {
    if (distractors.length === QUIZ_CHOICES - 1) break;
    const answer = answerOf(flashcard);
    if (flashcard.id === card.id || usedAnswers.has(answer)) continue;
    usedAnswers.add(answer);
    distractors.push(flashcard);
  }

  return shuffle([card, ...distractors]);
}
