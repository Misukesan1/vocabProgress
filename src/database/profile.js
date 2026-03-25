import { db } from "./db";

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
 * @returns {Promise<boolean>} vrai si le nom de profil existe déjà
 */
async function checkProfileIfExist(name) {
  const selectProfile = await db.profile.where({ name: name }).first();
  if (selectProfile) return true;
  return false;
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
  if (await checkProfileIfExist(name))
    throw new Error("Ce nom de profil existe déjà.");

  validationNameProfile(name);
  return db.profile.add({ name: name });
};

/**
 * Modification d' un profile
 * @param {number} id 
 * @param {string} name 
 * @throws {Error} si le nom existe déjà
 * @returns {Promise<number>} 1 si la modification a été effectuée. sinon 0
 */
export const editProfile = async (id, name) => {
  if (!(await getProfile(id))) throw new Error("Profil introuvable.");
  if (await checkProfileIfExist(name))
    throw new Error("Ce nom de profil existe déjà.");

  validationNameProfile(name);
  return db.profile.update(id, { name: name });
};

/**
 * Suppression d'un profile
 * @param {number} id 
 * @throws {Error} si le profil est introuvable
 * @returns {Promise<void>} ne retourne rien (que la suppression se soit effectuée ou non)
 */
export const deleteProfile = async (id) => {
  if (!(await getProfile(id))) throw new Error("Profil introuvable.");
  return db.profile.delete(id);
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
