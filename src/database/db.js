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