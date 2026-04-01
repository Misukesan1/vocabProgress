import { addFlashcard, deleteFlashcard, editFlashcard, getFlashcard, toggleStatusFlashcard } from "../database/flashcard"

export const testingFlashcard = async () => {

    try {
    // ? création d'une nouvelle flashcard
    // const flashcardCreated = await addFlashcard(8, "Du texte", "Simple comme bonjour")

    // ? modification d'une flashcard
    // const flashcardUpdated = await editFlashcard(4, "face avant", "face arrière")

    // ? suppression d'une flashcard
    // const flashcardDeleted = await deleteFlashcard(7)

    // ? information d'une flashcard
    // const flashcardSelected = await getFlashcard(11)

    // ? activer/désactiver une flashcard
    const flashcardToToggle = await getFlashcard(4)
    const toggleFlashcard = await toggleStatusFlashcard(4, flashcardToToggle.desactive)
    console.log("je veux desactiver la card : ", flashcardToToggle)

    } catch (error) {
        console.log(error)
    }
}