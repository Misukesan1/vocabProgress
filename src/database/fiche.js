import { db } from "./db";

/**
 * @typedef {Object} Fiche
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {number} profilId
 */

// * Private methods
// * ----------------

/**
 * Validation d'une fiche (nouvelle ou modification)
 * @param {Object} params les paramètres de validation
 * @param {number|null} params.id id de la fiche (optionnel si c'est une nouvelle fiche)
 * @param {string} params.name
 * @param {string} params.description
 * @param {number} params.profileId
 * @throws {Object} objet contenant les messages d'erreurs
 * @returns {Promise<true>} true si la validation est réussie
 */
async function validationFiche({ id = null, name, description, profileId }) {
  const errors = {};
  const oldFiche = id ? await getFiche(id) : null;
  const nameChanged = !oldFiche || oldFiche.name !== name;

  if (id && !oldFiche) errors.id = "Fiche introuvable.";
  if (name.length === 0) errors.name = "Champ requis.";
  if (name.length > 50) errors.name = "Maximum 50 caractères.";

  if (nameChanged && (await checkFicheIfExist(name, profileId)))
    errors.name = "Ce nom de fiche existe déjà.";

  if (description.length > 500) errors.description = "Maximum 500 caractères.";
  if (profileId && !(await db.profile.get(profileId)))
    errors.profileId = "Profil introuvable.";

  if (Object.keys(errors).length > 0) throw errors;

  return true;
}

/**
 * Vérifie si le nom de la fiche existe déjà
 * @param {string} name 
 * @param {number} profileId 
 * @returns {Promise<boolean>}
 */
async function checkFicheIfExist(name, profileId) {
  const selectFiche = await db.fiche
    .where({ profileId: profileId, name: name })
    .first();
  if (selectFiche) return true;
  return false;
}

// * CRUD
// * -----

/**
 * Création d'une nouvelle fiche
 * @param {string} name 
 * @param {string} description 
 * @param {number} profileId 
 * @throws {Object} objet avec les erreurs de validation
 * @returns {Promise<number>} id de la fiche crée
 */
export const addFiche = async (name, description, profileId) => {
  if (await validationFiche({ name, description, profileId }))
    return db.fiche.add({
      name: name,
      description: description,
      profileId: profileId,
    });
};

/**
 * Modification d'une fiche
 * @param {number} id 
 * @param {string} name 
 * @param {string} description 
 * @param {number} profileId 
 * @throws {Object} Erreurs de validation
 * @returns {Promise<number>} 1 si la modification s'est bien effectuée | 0
 */
export const editFiche = async (id, name, description, profileId) => {
  if (await validationFiche({ id, name, description, profileId }))
    return db.fiche.update(id, { name: name, description: description });
};

/**
 * Supprime une fiche
 * @param {number} id 
 * @returns {Promise<void>}
 */
export const deleteFiche = (id) => {
  return db.fiche.delete(id);
};

/**
 * Information d'une fiche
 * @param {number} id 
 * @returns {Promise<Fiche|undefined>}
 */
export const getFiche = (id) => {
  return db.fiche.get(id);
};

/**
 * Liste de toutes le fiches d'un profil
 * @param {number} profileId 
 * @returns {Promise<Fiche[]>}
 */
export const getFichesFromProfile = (profileId) => {
  return db.fiche.where({ profileId: profileId }).toArray();
};

/**
 * Liste de toutes les fiches de tous les profils
 * @returns {Promise<Fiche[]>}
 */
export const getFiches = () => {
  return db.fiche.toArray();
};
