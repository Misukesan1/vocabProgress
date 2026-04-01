import { db } from "./db";
import { getFiche } from "./fiche";

// flashcard: "++id, ficheId, frontCard, backCard, desactive"

// * Private methods
// * ----------------

async function ficheIfExist(ficheId) {
    const ficheSelected = await getFiche(ficheId)
    if (!ficheSelected) return false
        return true
}

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

export const addFlashcard = async (ficheId, frontCard, backCard, desactive = false) => {
    if (await validationFlashcard({frontCard, backCard})) return db.flashcard.add({ficheId, frontCard, backCard, desactive})
}

export const editFlashcard = async (id, frontCard, backCard) => {
    if (await validationFlashcard({frontCard, backCard})) return db.flashcard.update(id, {frontCard, backCard})
}

export const deleteFlashcard = (id) => {
    return db.flashcard.delete(id)
}

export const getFlashcard = async (id) => {
    return db.flashcard.get(id)
}

export const getFlashcardsFromFiche = (ficheId) => {
    return db.flashcard.where({ficheId: ficheId}).reverse().sortBy('id')
}

export const toggleStatusFlashcard = async (id, boolean) => {
    await db.flashcard.update(id, {desactive: !boolean})
    return db.flashcard.get(id)
}