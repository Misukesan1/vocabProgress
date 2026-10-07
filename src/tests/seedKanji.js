import { db } from "../database/db";
import { addProfile } from "../database/profile";
import { addFiche } from "../database/fiche";
import { addFlashcard } from "../database/flashcard";

// Recto : le kanji ; verso : le sens, puis les lectures on (katakana) · kun (hiragana)
const KANJIS = [
  ["一", "un\nイチ · ひと(つ)"],
  ["二", "deux\nニ · ふた(つ)"],
  ["三", "trois\nサン · みっ(つ)"],
  ["四", "quatre\nシ · よん, よっ(つ)"],
  ["五", "cinq\nゴ · いつ(つ)"],
  ["六", "six\nロク · むっ(つ)"],
  ["七", "sept\nシチ · なな(つ)"],
  ["八", "huit\nハチ · やっ(つ)"],
  ["九", "neuf\nキュウ, ク · ここの(つ)"],
  ["十", "dix\nジュウ · とお"],
  ["日", "jour, soleil\nニチ, ジツ · ひ, か"],
  ["月", "lune, mois\nゲツ, ガツ · つき"],
  ["火", "feu\nカ · ひ"],
  ["水", "eau\nスイ · みず"],
  ["木", "arbre\nモク, ボク · き"],
  ["金", "or, argent\nキン · かね"],
  ["土", "terre\nド, ト · つち"],
  ["山", "montagne\nサン · やま"],
  ["川", "rivière\nセン · かわ"],
  ["人", "personne\nジン, ニン · ひと"],
  ["大", "grand\nダイ, タイ · おお(きい)"],
  ["小", "petit\nショウ · ちい(さい), こ"],
];

/**
 * Données de test (mode dev) : ajoute la collection « Kanji » avec une fiche
 * de kanjis de base. N'efface rien ; échoue si la collection existe déjà.
 * Lancer depuis la console du navigateur : seedKanji()
 */
export const seedKanji = async () => {
  try {
    await db.transaction("rw", db.profile, db.fiche, db.flashcard, async () => {
      const profileId = await addProfile("Kanji");
      const ficheId = await addFiche("Kanjis de base", "Nombres, éléments, nature", profileId);
      for (const [front, back] of KANJIS) {
        await addFlashcard(ficheId, front, back);
      }
    });
    console.log(`Collection « Kanji » créée avec ${KANJIS.length} cartes.`);
  } catch (error) {
    console.error("seedKanji :", error?.message ?? error);
  }
};
