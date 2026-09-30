import { Dexie } from "dexie";

export const db = new Dexie("dbVocabProgress");
db.version(2).stores({
  profile: "++id, name",
  fiche: "++id, name, description, [profileId+name]",
  flashcard: "++id, ficheId, frontCard, backCard, desactive",
});

db.version(3).stores({
  profile: "++id, name",
  fiche: "++id, name, description, [profileId+name]",
  flashcard: "++id, ficheId, frontCard, backCard, desactive, errors",
}).upgrade(tx => {
  return tx.table("flashcard").toCollection().modify(flashcard => {
    if (flashcard.errors === undefined) flashcard.errors = 0
  })
});

db.version(4).stores({
  profile: "++id, name",
  fiche: "++id, name, description, [profileId+name]",
  flashcard: "++id, ficheId, frontCard, backCard, desactive, errors",
}).upgrade(tx => {
  return tx.table("flashcard").toCollection().modify(flashcard => {
    if (flashcard.errors === undefined) flashcard.errors = 0
  })
});

// Suppression du statut "à revoir" : le champ errors n'est plus utilisé.
// Seul l'index est retiré ; les cartes existantes ne sont PAS réécrites
// (données réelles sur téléphone, sans sauvegarde possible : aucune
// migration ne doit modifier ou supprimer des données utilisateur).
db.version(5).stores({
  profile: "++id, name",
  fiche: "++id, name, description, [profileId+name]",
  flashcard: "++id, ficheId, frontCard, backCard, desactive",
});
