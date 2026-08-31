import { db } from "./db";

/**
 * @typedef {Object} Flashcard
 * @property {number} id
 * @property {string} frontCard
 * @property {string} backCard
 * @property {boolean} desactive
 * @property {number} ficheId
 * @property {number} errors
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
export const addFlashcard = async (ficheId, frontCard, backCard, desactive = false, errors = 0) => {
    const front = frontCard.trim().charAt(0).toUpperCase() + frontCard.trim().slice(1)
    const back = backCard.trim().charAt(0).toUpperCase() + backCard.trim().slice(1)
    if (await validationFlashcard({frontCard: front, backCard: back})) return db.flashcard.add({ficheId, frontCard: front, backCard: back, desactive, errors})
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
    const front = frontCard.trim().charAt(0).toUpperCase() + frontCard.trim().slice(1)
    const back = backCard.trim().charAt(0).toUpperCase() + backCard.trim().slice(1)
    if (await validationFlashcard({frontCard: front, backCard: back})) return db.flashcard.update(id, {frontCard: front, backCard: back})
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
 * Liste des flashcards a afficher pour l'entrainement
 * @param {number} ficheId 
 * @returns {Promise<Flashcard[]>}
 */
export const getSelectedFlashcards = (ficheId) => {
    return db.flashcard.where({ficheId: ficheId}).filter(f => !f.desactive).toArray()
}

/**
 * Liste des flashcards qui sont désactivées
 * @param {number} ficheId 
 * @returns {Promise<Flashcard[]>} 
 */
export const getDeselectedFlashcards = (ficheId) => {
    return db.flashcard.where({ficheId: ficheId}).filter(f => f.desactive).toArray()
}

/**
 * Liste des flashcards avec erreurs
 * @param {number} ficheId 
 * @returns {Promise<Flashcard[]>} 
 */
export const getErrorsFlashcards = (ficheId) => {
    return db.flashcard.where({ficheId: ficheId}).filter(f => f.errors > 0).reverse().sortBy('errors')
}

/**
 * Activer ou désactiver une flashcard
 * @param {number} id 
 * @param {boolean} currentStatus le status actuel de la flashcard
 * @returns {Promise<Flashcard | undefined>}
 */
export const toggleStatusFlashcard = async (id, currentStatus) => {
    if (!currentStatus) await db.flashcard.update(id, {errors: 0})
    await db.flashcard.update(id, {desactive: !currentStatus})
    return db.flashcard.get(id)
}

/**
 * Incrémenter l'erreur de la flahcard de 1
 * @param {number} id 
 * @returns {Promise<Flashcard | undefined>}
 */
export const incrementError = async (id) => {
    const selectFlashcard = await db.flashcard.get(id)
    await db.flashcard.update(id, {errors: selectFlashcard.errors += 1})
    return db.flashcard.get(id)
}

/**
 * Réinitialiser les erreurs de la flashcard à 0
 * @param {number} id 
 * @returns {Promise<Flashcard | undefined>}
 */
export const resetErrors = async (id) => {
    await db.flashcard.update(id, {errors: 0})
    return db.flashcard.get(id)
}
/**
 * Activer toutes les flashcards d'une fiche
 * @param {number} idFiche
 * @return {void}
 */
export const activeAllFlashcards = async (idFiche) => {
    const flashcards = await db.flashcard.where({ficheId: idFiche}).toArray()
    for (const flashcard of flashcards) {
        await db.flashcard.update(flashcard.id, {desactive: false, errors: 0})
    }
}

/**
 * Recherche les flashcards de toutes les fiches d'un profil dont le recto ou le verso
 * contient le texte recherché (insensible à la casse)
 * @param {number} profileId
 * @param {string} searchText
 * @returns {Promise<(Flashcard & {ficheName: string})[]>}
 */
export const searchFlashcardsInProfile = async (profileId, searchText) => {
    const text = searchText.trim().toLowerCase()
    if (!text) return []

    const fiches = await db.fiche.where({ profileId }).toArray()
    if (fiches.length === 0) return []
    const ficheNamesById = Object.fromEntries(fiches.map((fiche) => [fiche.id, fiche.name]))

    const flashcards = await db.flashcard.where('ficheId').anyOf(fiches.map((fiche) => fiche.id)).toArray()
    return flashcards
        .filter((flashcard) =>
            flashcard.frontCard.toLowerCase().includes(text) ||
            flashcard.backCard.toLowerCase().includes(text)
        )
        .map((flashcard) => ({ ...flashcard, ficheName: ficheNamesById[flashcard.ficheId] }))
}