import { db } from "./db";

// * Private methodes
// * -----------------

function validationNameProfile(name) {
    if (name.length === 0) throw new Error("Veuillez entrer un nom.")
    if (name.length > 25) throw new Error("Le nom ne peut pas dépasser 25 caractères.")
}

/** vérifie si le profile existe */
async function checkProfileIfExist(name) {
    const selectProfile = await db.profile.where({name: name}).first()

    if (selectProfile) return true

    return false
}

// * CRUD
// * -----
/** création d'un nouveau profile */
export const addProfile = async (name) => {

    if (await checkProfileIfExist(name)) throw new Error("Ce nom de profil existe déjà.")

    validationNameProfile(name)
    return db.profile.add({name: name})
}

/** modification d' un profile */
export const editProfile = async (id, name) => {

    if (! await getProfile(id)) throw new Error("Profil introuvable.")
    if (await checkProfileIfExist(name)) throw new Error("Ce nom de profil existe déjà.")
    
    validationNameProfile(name)
    return db.profile.update(id, {name: name})
}

/** suppression d'un profile */
export const deleteProfile = async (id) => {

    if (! await getProfile(id)) throw new Error("Profil introuvable.")

    return db.profile.delete(id)
}

/** informations d'un profile */
export const getProfile = async (id) => {
    return db.profile.get(id)
}

/** liste de tous les profiles */
export const getProfiles = () => {
    return db.profile.toArray()
}