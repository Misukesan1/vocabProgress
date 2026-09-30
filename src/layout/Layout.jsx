import { useEffect } from "react";
import { Outlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useLiveQuery } from "dexie-react-hooks";
import Header from "../componnents/layout/Header";
import BottomNav from "../componnents/layout/BottomNav";
import AlertToast from "../componnents/common/AlertToast";
import { getProfile } from "../database/profile";
import { getFiche } from "../database/fiche";
import { selectProfile } from "../features/profileSlice";
import { selectFiche } from "../features/ficheSlice";

export default function Layout() {
  const dispatch = useDispatch();
  const selectedProfile = useSelector((state) => state.profile.selectedProfile);
  const selectedFiche = useSelector((state) => state.fiche.selectedFiche);

  // Collection restaurée depuis localStorage : on la resynchronise avec la base
  // (profile null = supprimée). L'id est renvoyé avec le résultat car useLiveQuery
  // garde l'ancien résultat le temps que la requête de la nouvelle sélection aboutisse.
  const stored = useLiveQuery(
    async () =>
      selectedProfile
        ? { id: selectedProfile.id, profile: (await getProfile(selectedProfile.id)) ?? null }
        : undefined,
    [selectedProfile?.id],
  );

  useEffect(() => {
    if (!stored || stored.id !== selectedProfile?.id) return;
    if (stored.profile === null) {
      dispatch(selectProfile(null));
      dispatch(selectFiche(null));
    } else if (stored.profile.name !== selectedProfile.name) dispatch(selectProfile(stored.profile));
  }, [stored, selectedProfile, dispatch]);

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

  return (
    <div className="flex min-h-screen flex-col text-neutral-800 dark:text-neutral-100">
      <Header />
      <main className="flex-1 px-4 pb-24 pt-4">
        <Outlet />
      </main>
      <BottomNav />
      <AlertToast />
    </div>
  );
}
