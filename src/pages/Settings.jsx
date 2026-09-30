import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLiveQuery } from "dexie-react-hooks";
import { useDisclosure } from "@heroui/react";
import { Download, ShieldCheck, TriangleAlert, Upload } from "lucide-react";
import { db } from "../database/db";
import { exportBackup, restoreBackup, validateBackup } from "../database/backup";
import { downloadBackup, getLastBackupDate, readBackupFile, setLastBackupDate } from "../utils/backupFile";
import { selectProfile } from "../features/profileSlice";
import { selectFiche } from "../features/ficheSlice";
import { clearTraining } from "../features/trainingSlice";
import { showAlert } from "../features/alertSlice";
import ModalConfirm from "../componnents/common/ModalConfirm";

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
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [lastBackup, setLastBackup] = useState(getLastBackupDate);
  const [pendingBackup, setPendingBackup] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const { isOpen: isOpenRestore, onOpen: onOpenRestore, onOpenChange: onOpenChangeRestore } = useDisclosure();

  const counts = useLiveQuery(async () => ({
    profiles: await db.profile.count(),
    fiches: await db.fiche.count(),
    flashcards: await db.flashcard.count(),
  }));
  const isEmpty = counts?.profiles === 0;
  const needsReminder = !isEmpty && (!lastBackup || Date.now() - lastBackup.getTime() > REMINDER_DAYS * DAY_MS);

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

      // Les sélections / entraînements en cours pointent peut-être vers des ids disparus
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

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h2 className="px-1 text-base font-semibold text-neutral-700 dark:text-neutral-200">Options</h2>

      <section className="neu-raised neu-shape-card flex flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck size={22} className="mt-0.5 shrink-0 text-primary" />
          <div>
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">Sauvegarde de tes données</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Tes collections, fiches et cartes sont enregistrées uniquement dans ce navigateur. Télécharge
              régulièrement une sauvegarde et garde le fichier en lieu sûr (cloud, e-mail...) : elle te
              permettra de tout récupérer sur ce téléphone ou un autre appareil.
            </p>
          </div>
        </div>

        {counts && (
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Actuellement : {describe(counts)}.</p>
        )}

        <p
          className={`flex items-center gap-2 text-sm ${
            needsReminder ? "font-medium text-warning-600 dark:text-warning" : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {needsReminder && <TriangleAlert size={16} className="shrink-0" />}
          {formatLastBackup(lastBackup)}
        </p>

        <button
          type="button"
          onClick={handleExport}
          disabled={!counts || isEmpty}
          className="neu-btn neu-shape-control neu-focusable flex items-center justify-center gap-2 py-3 font-semibold text-primary disabled:opacity-50"
        >
          <Download size={18} />
          Télécharger une sauvegarde
        </button>
      </section>

      <section className="neu-raised neu-shape-card flex flex-col gap-4 p-5">
        <div>
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">Restaurer une sauvegarde</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Remplace toutes les données de ce navigateur par celles d'un fichier de sauvegarde. Tu verras son
            contenu avant de confirmer, et tes données actuelles seront d'abord téléchargées par sécurité.
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChosen}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
          className="neu-btn neu-shape-control neu-focusable flex items-center justify-center gap-2 py-3 text-sm font-medium text-neutral-700 disabled:opacity-50 dark:text-neutral-200"
        >
          <Upload size={17} />
          Choisir un fichier de sauvegarde
        </button>
      </section>

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
        confirmLabel="Restaurer"
        onConfirm={handleRestore}
      />
    </div>
  );
}
