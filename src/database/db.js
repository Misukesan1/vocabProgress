import { Dexie } from "dexie";

export const db = new Dexie("dbVocabProgress");
db.version(1).stores({
  profile: "++id, name",
  fiches: "++id, name, description, profileId",
  flashcards: "++id, ficheId, frontCard, backCard, desactive",
});
