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
    // ? modification d'un profil
    // await editProfile(1, "Quentin")
    // ? suppression d'un profil
    // await deleteProfile(5)
    // ? informations d'un profil
    // const selectProfile = await getProfile(77)
  } catch (error) {
    console.log(error);
  }

  // ? liste de tous les profils
  const profiles = await getProfiles();
  console.log("liste des profiles : ", profiles);
};
