import { db } from "./db";

/**
 * @typedef {Object} Flashcard
 * @property {number} id
 * @property {string} frontCard
 * @property {string} backCard
 * @property {boolean} desactive
 * @property {number} ficheId
 */

// * Private methods
// * ----------------

/**
 * Validation d'une flashcard 
 * @param {Object} params les paramètres de validations de la flashcard
 * @param {string} params.frontCard la face recto
 * @param {string} params.backCard la face verso
 * @throws {Object} un objet avec les erreurs de validation
 * @returns {Promise<true>} true si la validation est réussie
 */
async function validationFlashcard({frontCard, backCard}) {
    const errors = {}

    if (frontCard.length === 0) errors.frontcard = "Champ requis."
    if (frontCard.length > 1000) errors.frontcard = "Maximum 1000 caractères."
    if (backCard.length === 0) errors.backcard = "Champ requis."
    if (backCard.length > 1000) errors.backcard = "Maximum 1000 caractères."

    if (Object.keys(errors).length > 0) throw errors

    return true
}

// * CRUD
// * -----

/**
 * Création d'une flashcard
 * @param {number} ficheId 
 * @param {string} frontCard 
 * @param {string} backCard 
 * @param {boolean} desactive 
 * @throws {Object} objet avec les erreurs de validation
 * @returns {Promise<number>} l'id de la flashcard crée
 */
export const addFlashcard = async (ficheId, frontCard, backCard, desactive = false) => {
    if (await validationFlashcard({frontCard, backCard})) return db.flashcard.add({ficheId, frontCard, backCard, desactive})
}

/**
 * Modification d'une flashcard
 * @param {number} id 
 * @param {string} frontCard 
 * @param {string} backCard 
 * @throws {Object} objet avec les erreurs de validation
 * @returns {Promise<number>} 1 si la modification à trouvé un résultat
 */
export const editFlashcard = async (id, frontCard, backCard) => {
    if (await validationFlashcard({frontCard, backCard})) return db.flashcard.update(id, {frontCard, backCard})
}

/**
 * Suppression d'une flashcard
 * @param {number} id 
 * @returns {Promise<void>}
 */
export const deleteFlashcard = (id) => {
    return db.flashcard.delete(id)
}

/**
 * Informations d'une flashcard
 * @param {number} id 
 * @returns {Promise<Flashcard | undefined>} 
 */
export const getFlashcard = async (id) => {
    return db.flashcard.get(id)
}

/**
 * Liste des flashcards d'une fiche dans l'ordre décroissant
 * @param {number} ficheId 
 * @returns {Promise<Flashcard[]>}
 */
export const getFlashcardsFromFiche = (ficheId) => {
    return db.flashcard.where({ficheId: ficheId}).reverse().sortBy('id')
}

/**
 * Activer ou désactiver une flashcard
 * @param {number} id 
 * @param {boolean} currentStatus le status actuel de la flashcard
 * @returns {Promise<Flashcard | undefined>}
 */
export const toggleStatusFlashcard = async (id, currentStatus) => {
    await db.flashcard.update(id, {desactive: !currentStatus})
    return db.flashcard.get(id)
}