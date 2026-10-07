/**
 * Normalise un texte pour la recherche : minuscules, sans accents
 * @param {string} text
 * @returns {string}
 */
export const normalizeSearch = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/**
 * Pertinence (façon dictionnaire) d'une carte pour un texte déjà normalisé :
 * 0 = recto ou verso identique, 1 = commence par, 2 = contient, null = pas de correspondance
 * @param {{frontCard: string, backCard: string}} flashcard
 * @param {string} text texte normalisé (normalizeSearch)
 * @returns {number | null}
 */
export const matchRank = (flashcard, text) => {
  const ranks = [flashcard.frontCard, flashcard.backCard]
    .map((value) => {
      const normalized = normalizeSearch(value);
      if (normalized === text) return 0;
      if (normalized.startsWith(text)) return 1;
      if (normalized.includes(text)) return 2;
      return null;
    })
    .filter((rank) => rank !== null);
  return ranks.length ? Math.min(...ranks) : null;
};

/**
 * Cartes correspondant au texte, triées : identiques, commencent par, contiennent, puis A-Z
 * @template {{frontCard: string, backCard: string}} T
 * @param {T[]} flashcards
 * @param {string} searchText
 * @returns {(T & {rank: number})[]}
 */
export const searchFlashcards = (flashcards, searchText) => {
  const text = normalizeSearch(searchText);
  if (!text) return [];
  return flashcards
    .map((flashcard) => ({ ...flashcard, rank: matchRank(flashcard, text) }))
    .filter((flashcard) => flashcard.rank !== null)
    .sort((a, b) => a.rank - b.rank || a.frontCard.localeCompare(b.frontCard, "fr"));
};
