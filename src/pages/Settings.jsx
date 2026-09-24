import { Button, Switch, useDisclosure } from "@heroui/react";
import BoxContent from "../componnents/BoxContent";
import { db } from "../database/db";
import ModalConfirm from "../componnents/ModalConfirm";
import { useDispatch } from "react-redux";
import { showAlert } from "../features/alertSlice";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Download, TriangleAlert, Upload } from "lucide-react";
import { selectFiche } from "../features/ficheSlice";
import { selectProfile } from "../features/profileSlice";
import { clearTraining } from "../features/trainingSlice";
import { exportBackup, restoreBackup, validateBackup } from "../database/backup";
import { downloadBackup, getLastBackupDate, readBackupFile, setLastBackupDate } from "../utils/backupFile";

const DAY_MS = 24 * 60 * 60 * 1000;
const REMINDER_DAYS = 7;

const plural = (count, word) => `${count} ${word}${count > 1 ? "s" : ""}`;
const describe = ({ profiles, fiches, flashcards }) =>
  `${plural(profiles, "collection")}, ${plural(fiches, "fiche")} et ${plural(flashcards, "carte")}`;

function formatLastBackup(date) {
  if (!date) return "Aucune sauvegarde téléchargée depuis cet appareil.";
  const days = Math.floor((Date.now() - date.getTime()) / DAY_MS);
  const when = days === 0 ? "aujourd'hui" : days === 1 ? "hier" : `il y a ${days} jours`;
  return `Dernière sauvegarde : ${when} (${date.toLocaleDateString("fr-FR")}).`;
}

export default function Settings() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isOpenRestore, onOpen: onOpenRestore, onOpenChange: onOpenChangeRestore } = useDisclosure();
  const dispatch = useDispatch();

  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Sauvegarde / restauration
  const fileInputRef = useRef(null);
  const [lastBackup, setLastBackup] = useState(getLastBackupDate);
  const [pendingBackup, setPendingBackup] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const counts = useLiveQuery(async () => ({
    profiles: await db.profile.count(),
    fiches: await db.fiche.count(),
    flashcards: await db.flashcard.count(),
  }));
  const isEmpty = counts?.profiles === 0;
  const needsReminder = !isEmpty && (!lastBackup || Date.now() - lastBackup.getTime() > REMINDER_DAYS * DAY_MS);

  const handleDeleteDatabase = async () => {
    await db.profile.clear();
    await db.fiche.clear();
    await db.flashcard.clear();
    dispatch(selectFiche(null))
    dispatch(selectProfile(null))
  };

  const handleExport = async () => {
    try {
      downloadBackup(await exportBackup());
      const now = new Date();
      setLastBackupDate(now);
      setLastBackup(now);
      dispatch(showAlert({ message: "Sauvegarde téléchargée.", type: "success" }));
    } catch {
      dispatch(showAlert({ message: "La sauvegarde a échoué.", type: "danger" }));
    }
  };

  // Choix du fichier : on valide tout AVANT de proposer la restauration
  const handleFileChosen = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de re-choisir le même fichier
    if (!file) return;
    try {
      setPendingBackup(validateBackup(await readBackupFile(file)));
      onOpenRestore();
    } catch (error) {
      dispatch(showAlert({ message: error.message, type: "danger" }));
    }
  };

  const handleRestore = async () => {
    if (!pendingBackup || isBusy) return;
    setIsBusy(true);
    try {
      // Filet de sécurité : les données actuelles sont téléchargées avant d'être remplacées
      if (!isEmpty) downloadBackup(await exportBackup(), "avant-restauration");
      await restoreBackup(pendingBackup);
      dispatch(clearTraining());
      dispatch(selectFiche(null));
      dispatch(selectProfile(null));
      dispatch(showAlert({ message: "Sauvegarde restaurée.", type: "success" }));
    } catch {
      dispatch(showAlert({ message: "La restauration a échoué : tes données n'ont pas été modifiées.", type: "danger" }));
    } finally {
      setIsBusy(false);
      setPendingBackup(null);
    }
  };

  const backupCounts = pendingBackup && {
    profiles: pendingBackup.profiles.length,
    fiches: pendingBackup.fiches.length,
    flashcards: pendingBackup.flashcards.length,
  };
  const backupDate = pendingBackup?.exportedAt ? new Date(pendingBackup.exportedAt) : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>

      {/* Sauvegarde des données */}
      <BoxContent>
        <div className="flex flex-col gap-3">
          <p className="font-semibold">Sauvegarde de tes données</p>
          <p className="text-sm text-default-500">
            Tes collections, fiches et cartes sont enregistrées uniquement dans ce navigateur. Télécharge
            régulièrement une sauvegarde et garde le fichier en lieu sûr (cloud, e-mail...).
          </p>
          {counts && <p className="text-sm">Actuellement : {describe(counts)}.</p>}
          <p className={`flex items-center gap-2 text-sm ${needsReminder ? "font-medium text-warning" : "text-default-500"}`}>
            {needsReminder && <TriangleAlert size={16} className="shrink-0" />}
            {formatLastBackup(lastBackup)}
          </p>
          <Button
            color="primary"
            radius="full"
            startContent={<Download size={18} />}
            onPress={handleExport}
            isDisabled={!counts || isEmpty}
          >
            Télécharger une sauvegarde
          </Button>
        </div>
      </BoxContent>

      {/* Restauration */}
      <BoxContent>
        <div className="flex flex-col gap-3">
          <p className="font-semibold">Restaurer une sauvegarde</p>
          <p className="text-sm text-default-500">
            Remplace toutes les données de ce navigateur par celles d'un fichier de sauvegarde. Tu verras son
            contenu avant de confirmer, et tes données actuelles seront d'abord téléchargées par sécurité.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChosen}
            className="hidden"
          />
          <Button
            variant="bordered"
            radius="full"
            startContent={<Upload size={17} />}
            onPress={() => fileInputRef.current?.click()}
            isDisabled={isBusy}
          >
            Choisir un fichier de sauvegarde
          </Button>
        </div>
      </BoxContent>

      {/* Formater données */}
      <BoxContent>
        <div className="flex justify-between items-center gap-3">
          <p>Effacer toutes les données.</p>
          <Button onPress={onOpen} size="sm" color="danger" radius="full">
            Effacer
          </Button>
        </div>
      </BoxContent>

      {/* DarkMode */}
      <BoxContent>
        <div className="flex justify-between items-center">
          Mode {theme === "dark" ? "clair" : "sombre"}
          <Switch
            isSelected={theme === "dark"}
            onValueChange={(isSelected) => {
              isSelected ? setTheme("dark") : setTheme("light");
            }}
            aria-label="dark mode"
          />
        </div>
      </BoxContent>

      <ModalConfirm
        message={
          "Etes-vous sur de vouloir effacer toutes les données ? Cette action est irréversible."
        }
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onConfirm={() => {
          handleDeleteDatabase();
          dispatch(
            showAlert({
              message: "Toutes les données ont été supprimées.",
              type: "success",
            }),
          );
        }}
      />

      <ModalConfirm
        isOpen={isOpenRestore}
        onOpenChange={onOpenChangeRestore}
        message={
          backupCounts &&
          `Cette sauvegarde${backupDate ? ` du ${backupDate.toLocaleDateString("fr-FR")}` : ""} contient ${describe(
            backupCounts,
          )}. Elle va remplacer toutes tes données actuelles${counts && !isEmpty ? ` (${describe(counts)})` : ""}.${
            isEmpty ? "" : " Une sauvegarde de tes données actuelles sera téléchargée juste avant."
          }`
        }
        onConfirm={handleRestore}
      />
    </>
  );
}
