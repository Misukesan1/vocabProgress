import { db } from "./db";
import { normalizeSearch, searchFlashcards } from "../utils/search";

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
    // Texte gardé tel que saisi (pas de majuscule forcée : romaji, acronymes...)
    const front = frontCard.trim()
    const back = backCard.trim()
    if (await validationFlashcard({frontCard: front, backCard: back})) return db.flashcard.add({ficheId, frontCard: front, backCard: back, desactive})
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
    // Texte gardé tel que saisi (pas de majuscule forcée : romaji, acronymes...)
    const front = frontCard.trim()
    const back = backCard.trim()
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
 * Nombre de flashcards d'une fiche
 * @param {number} ficheId
 * @returns {Promise<number>}
 */
export const countFlashcardsFromFiche = (ficheId) => {
    return db.flashcard.where({ficheId: ficheId}).count()
}

/**
 * Avancement d'une fiche : nombre de cartes et de cartes maîtrisées
 * @param {number} ficheId
 * @returns {Promise<{total: number, mastered: number}>}
 */
export const getFicheProgress = async (ficheId) => {
    const flashcards = await db.flashcard.where({ficheId: ficheId}).toArray()
    return { total: flashcards.length, mastered: flashcards.filter(f => f.desactive).length }
}

/**
 * Chiffres d'une collection : fiches, cartes, cartes à réviser (non maîtrisées)
 * @param {number} profileId
 * @returns {Promise<{fiches: number, cards: number, toReview: number}>}
 */
export const getCollectionStats = async (profileId) => {
    const ficheIds = await db.fiche.where({profileId: profileId}).primaryKeys()
    const flashcards = ficheIds.length ? await db.flashcard.where('ficheId').anyOf(ficheIds).toArray() : []
    return { fiches: ficheIds.length, cards: flashcards.length, toReview: flashcards.filter(f => !f.desactive).length }
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
 * Activer ou désactiver une flashcard
 * @param {number} id 
 * @param {boolean} currentStatus le status actuel de la flashcard
 * @returns {Promise<Flashcard | undefined>}
 */
export const toggleStatusFlashcard = async (id, currentStatus) => {
    await db.flashcard.update(id, {desactive: !currentStatus})
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
        await db.flashcard.update(flashcard.id, {desactive: false})
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

/**
 * Recherche façon dictionnaire parmi toutes les cartes de toutes les collections :
 * recto ou verso contenant le texte (insensible à la casse et aux accents).
 * Tri : correspondance exacte, puis début de mot, puis contenu, puis ordre alphabétique.
 * @param {string} searchText
 * @returns {Promise<(Flashcard & {ficheName: string, profileName: string, rank: number})[]>}
 */
export const searchAllFlashcards = async (searchText) => {
    if (!normalizeSearch(searchText)) return []

    const [profiles, fiches, flashcards] = await Promise.all([
        db.profile.toArray(),
        db.fiche.toArray(),
        db.flashcard.toArray(),
    ])
    const profileNamesById = Object.fromEntries(profiles.map((profile) => [profile.id, profile.name]))
    const fichesById = Object.fromEntries(fiches.map((fiche) => [fiche.id, fiche]))

    return searchFlashcards(flashcards, searchText).map((flashcard) => {
        const fiche = fichesById[flashcard.ficheId]
        return {
            ...flashcard,
            ficheName: fiche?.name ?? '',
            profileName: profileNamesById[fiche?.profileId] ?? '',
        }
    })
}

/**
 * Nombre total de cartes, toutes collections confondues
 * @returns {Promise<number>}
 */
export const countAllFlashcards = () => {
    return db.flashcard.count()
}
