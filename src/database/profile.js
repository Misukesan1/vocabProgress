import { db } from "./db";
import { deleteFiche, getFichesFromProfile } from "./fiche";

/**
 * @typedef {Object} Profile
 * @property {number} id
 * @property {string} name
 */

// * Private methods
// * ----------------

/**
 * Validation du nom (requis et max 25 caractères)
 * @param {string} name 
 * @throws {Error} si il y a une erreur de validation
 */
function validationNameProfile(name) {
  if (name.length === 0) throw new Error("Champ requis.");
  if (name.length > 25)
    throw new Error("Maximum 25 caractères.");
}

/**
 * Vérifie si le profile existe
 * @param {string} name
 * @param {number} [exceptId] id du profil à ignorer (celui qu'on modifie)
 * @returns {Promise<boolean>} vrai si le nom de profil existe déjà
 */
async function checkProfileIfExist(name, exceptId) {
  const selectProfile = await db.profile.where({ name: name }).first();
  return !!selectProfile && selectProfile.id !== exceptId;
}

// * CRUD
// * -----

/**
 * Création d'un nouveau profile
 * @param {string} name 
 * @throws {Error} si le nom existe déjà ou qu'il y a des erreurs de validation
 * @returns {Promise<number>} id du profil crée
 */
export const addProfile = async (name) => {
  const normalizedName = name.trim().charAt(0).toUpperCase() + name.trim().slice(1)
  if (await checkProfileIfExist(normalizedName))
    throw new Error("Ce nom de collection existe déjà.");

  validationNameProfile(normalizedName);
  return db.profile.add({ name: normalizedName });
};

/**
 * Modification d' un profile
 * @param {number} id 
 * @param {string} name 
 * @throws {Error} si le nom existe déjà
 * @returns {Promise<number>} 1 si la modification a été effectuée. sinon 0
 */
export const editProfile = async (id, name) => {
  const normalizedName = name.trim().charAt(0).toUpperCase() + name.trim().slice(1)
  if (!(await getProfile(id))) throw new Error("Collection introuvable.");
  if (await checkProfileIfExist(normalizedName, id))
    throw new Error("Ce nom de collection existe déjà.");

  validationNameProfile(normalizedName);
  return db.profile.update(id, { name: normalizedName });
};

/**
 * Suppression d'un profile et les fiches et flashcards associées.
 * @param {number} id 
 * @returns {Promise<void>}
 */
export const deleteProfile = (id) => {
  // Transaction : tout est supprimé, ou rien si une étape échoue
  return db.transaction("rw", db.profile, db.fiche, db.flashcard, async () => {
    const ficheToDelete = await getFichesFromProfile(id)
    for (const fiche of ficheToDelete) {
      await deleteFiche(fiche.id)
    }
    await db.profile.delete(id);
  });
};

/**
 * Supprimer tous les profils
 * @returns {Promise<void>} 
 */
export const deleteAllProfiles = async () => {
  return db.profile.clear()
}

/**
 * Informations d'un profil
 * @param {number} id 
 * @returns {Promise<Profile|undefined>} retourne l'objet dexie du profil trouvé ou undefined
 */
export const getProfile = async (id) => {
  return db.profile.get(id);
};

/**
 * Liste de tous les profiles
 * @returns {Promise<Profile[]>} tableau avec tous les profils
 */
export const getProfiles = () => {
  return db.profile.toArray();
};
