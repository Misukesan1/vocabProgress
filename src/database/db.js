import { Dexie } from "dexie";

export const db = new Dexie("dbVocabProgress");
db.version(2).stores({
  profile: "++id, name",
  fiche: "++id, name, description, [profileId+name]",
  flashcard: "++id, ficheId, frontCard, backCard, desactive",
});
