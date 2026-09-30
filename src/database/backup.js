import { db } from "./db";

/**
 * Sauvegarde / restauration de toutes les données (collections, fiches, cartes)
 * dans un fichier JSON. Les ids sont conservés pour garder les liens entre tables.
 */

const BACKUP_APP = "vocabProgress";
const BACKUP_FORMAT = 1;

/**
 * @typedef {Object} Backup
 * @property {string} app
 * @property {number} format
 * @property {string} exportedAt date ISO
 * @property {Object[]} profiles
 * @property {Object[]} fiches
 * @property {Object[]} flashcards
 */

/**
 * Toutes les données de l'application
 * @returns {Promise<Backup>}
 */
export const exportBackup = async () => {
  const [profiles, fiches, flashcards] = await Promise.all([
    db.profile.toArray(),
    db.fiche.toArray(),
    db.flashcard.toArray(),
  ]);
  return { app: BACKUP_APP, format: BACKUP_FORMAT, exportedAt: new Date().toISOString(), profiles, fiches, flashcards };
};

const isId = (value) => Number.isInteger(value) && value > 0;
const isText = (value) => typeof value === "string";

/**
 * Vérifie qu'un objet est une sauvegarde valide et cohérente, et la normalise
 * (seuls les champs connus sont gardés).
 * @param {unknown} data contenu JSON du fichier
 * @throws {Error} message lisible si le fichier n'est pas une sauvegarde valide
 * @returns {Backup}
 */
export const validateBackup = (data) => {
  if (!data || data.app !== BACKUP_APP || !Array.isArray(data.profiles) || !Array.isArray(data.fiches) || !Array.isArray(data.flashcards)) {
    throw new Error("Ce fichier n'est pas une sauvegarde VocabProgress.");
  }
  if (data.format > BACKUP_FORMAT) {
    throw new Error("Cette sauvegarde vient d'une version plus récente de l'application.");
  }

  const profiles = data.profiles.map((p) => {
    if (!isId(p?.id) || !isText(p.name)) throw new Error("Sauvegarde invalide : collection mal formée.");
    return { id: p.id, name: p.name };
  });
  const profileIds = new Set(profiles.map((p) => p.id));

  const fiches = data.fiches.map((f) => {
    if (!isId(f?.id) || !isText(f.name) || !profileIds.has(f.profileId)) {
      throw new Error("Sauvegarde invalide : fiche mal formée ou sans collection.");
    }
    return { id: f.id, name: f.name, description: isText(f.description) ? f.description : "", profileId: f.profileId };
  });
  const ficheIds = new Set(fiches.map((f) => f.id));

  const flashcards = data.flashcards.map((c) => {
    if (!isId(c?.id) || !isText(c.frontCard) || !isText(c.backCard) || !ficheIds.has(c.ficheId)) {
      throw new Error("Sauvegarde invalide : carte mal formée ou sans fiche.");
    }
    // errors : conservé tel quel (ancien compteur « à revoir »), 0 par défaut
    const errors = Number.isInteger(c.errors) && c.errors >= 0 ? c.errors : 0;
    return { id: c.id, ficheId: c.ficheId, frontCard: c.frontCard, backCard: c.backCard, desactive: c.desactive === true, errors };
  });

  return { ...data, profiles, fiches, flashcards };
};

/**
 * Remplace TOUTES les données par celles de la sauvegarde.
 * Transaction unique : en cas d'erreur, rien n'est modifié.
 * @param {Backup} backup sauvegarde déjà validée par validateBackup
 * @returns {Promise<void>}
 */
export const restoreBackup = (backup) => {
  return db.transaction("rw", db.profile, db.fiche, db.flashcard, async () => {
    await Promise.all([db.flashcard.clear(), db.fiche.clear(), db.profile.clear()]);
    await db.profile.bulkAdd(backup.profiles);
    await db.fiche.bulkAdd(backup.fiches);
    await db.flashcard.bulkAdd(backup.flashcards);
  });
};
