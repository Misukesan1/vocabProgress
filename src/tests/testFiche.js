import {
  addFiche,
  deleteFiche,
  editFiche,
  getFiche,
  getFiches,
} from "../database/fiche";

export const testingFiche = async () => {
  try {
    // ? création d'une nouvelle fiche
    // await addFiche("fiche C", "", 18)
    // ? modification d'une fiche
    // await editFiche(4, "fiche Z", "validation en cours ...")
    // ? suppression d'une fiche
    // await deleteFiche(6)
    // ? information d'une fiche
    // const selectFiche = await getFiche(3)
    // console.log(selectFiche)
  } catch (error) {
    console.log(error);
  }

  const fiches = await getFiches();
  console.log("liste des fiches : ", fiches);
};
