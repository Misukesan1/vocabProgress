import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useLiveQuery } from "dexie-react-hooks";
import Header from "../componnents/layout/Header";
import BottomNav from "../componnents/layout/BottomNav";
import AlertToast from "../componnents/common/AlertToast";
import { getProfile, getProfiles } from "../database/profile";
import { getFiche } from "../database/fiche";
import { selectProfile } from "../features/profileSlice";
import { selectFiche } from "../features/ficheSlice";
import { clearTraining } from "../features/trainingSlice";
import { resetTutorial, useInTutorial } from "../utils/onboarding";

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);
  const selectedFiche = useSelector((state) => state.fiche.selectedFiche);
  const trainingFicheId = useSelector((state) => state.training.ficheId);
  // Pendant le tutoriel, barre du bas et logo sont verrouillés. La ⚙ reste
  // libre (restaurer une sauvegarde) ; la page Options offre alors un retour à l'accueil.
  const inTutorial = useInTutorial();

  // Collection restaurée depuis localStorage : on la resynchronise avec la base
  // (profile null = supprimée). L'id est renvoyé avec le résultat car useLiveQuery
  // garde l'ancien résultat le temps que la requête de la nouvelle sélection aboutisse.
  const stored = useLiveQuery(
    async () =>
      selectedProfile
        ? {
            id: selectedProfile.id,
            profile: (await getProfile(selectedProfile.id)) ?? null,
            isDbEmpty: (await getProfiles()).length === 0,
          }
        : undefined,
    [selectedProfile?.id],
  );

  useEffect(() => {
    if (!stored || stored.id !== selectedProfile?.id) return;
    if (stored.profile === null) {
      // Base vidée hors de l'appli (outils du navigateur...) : bienvenue + tutoriel reviennent,
      // sur l'accueil (ailleurs, les menus verrouillés laisseraient bloqué)
      if (stored.isDbEmpty) {
        resetTutorial();
        navigate("/");
      }
      dispatch(selectProfile(null));
      dispatch(selectFiche(null));
    } else if (stored.profile.name !== selectedProfile.name) dispatch(selectProfile(stored.profile));
  }, [stored, selectedProfile, dispatch, navigate]);

  // Même resynchronisation pour la fiche sélectionnée (supprimée / modifiée)
  const storedFiche = useLiveQuery(
    async () =>
      selectedFiche ? { id: selectedFiche.id, fiche: (await getFiche(selectedFiche.id)) ?? null } : undefined,
    [selectedFiche?.id],
  );

  useEffect(() => {
    if (!storedFiche || storedFiche.id !== selectedFiche?.id) return;
    const { fiche } = storedFiche;
    if (fiche === null) dispatch(selectFiche(null));
    else if (fiche.name !== selectedFiche.name || fiche.description !== selectedFiche.description) {
      dispatch(selectFiche(fiche));
    }
  }, [storedFiche, selectedFiche, dispatch]);

  // Session restaurée depuis localStorage : abandonnée si sa fiche n'existe plus
  const trainingFiche = useLiveQuery(
    async () =>
      trainingFicheId ? { id: trainingFicheId, fiche: (await getFiche(trainingFicheId)) ?? null } : undefined,
    [trainingFicheId],
  );

  useEffect(() => {
    if (trainingFiche?.id === trainingFicheId && trainingFiche.fiche === null) dispatch(clearTraining());
  }, [trainingFiche, trainingFicheId, dispatch]);

  return (
    <div className="flex min-h-screen flex-col text-neutral-800 dark:text-neutral-100">
      <Header locked={inTutorial} />
      {/* Verrouillée, la barre du bas est plus haute (légende) : plus de marge pour ne rien masquer */}
      <main className={`flex-1 px-4 pt-4 ${inTutorial ? "pb-36" : "pb-24"}`}>
        <Outlet />
      </main>
      <BottomNav locked={inTutorial} />
      <AlertToast />
    </div>
  );
}
