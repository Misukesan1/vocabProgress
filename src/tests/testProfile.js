import {
  addProfile,
  deleteProfile,
  editProfile,
  getProfile,
  getProfiles,
} from "../database/profile";

export const testingProfile = async () => {
  try {

    // ? creation d'un nouveau profile
    // await addProfile("Albert")
    // console.log("nouveau profile crée")
    // ? modification d'un profil
    // await editProfile(1, "Quentin")
    // console.log("modification du profil")
    // ? suppression d'un profil
    // await deleteProfile(5)
    // console.log("suppression du profil")
    // ? informations d'un profil
    // const selectProfile = await getProfile(77)
    // console.log("détails du profil : ", selectProfile)

  } catch (error) {
    console.log(error);
  }

  // ? liste de tous les profils
  const profiles = await getProfiles();
  console.log("liste des profiles : ", profiles);
  
};
