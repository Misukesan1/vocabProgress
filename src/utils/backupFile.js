const LAST_BACKUP_KEY = "vocabprogress:lastBackup";

/**
 * Téléchargement d'une sauvegarde en fichier JSON
 * (sur téléphone, le fichier arrive dans les Téléchargements / l'app Fichiers).
 * @param {Object} backup
 * @param {string} [suffix] ajouté au nom du fichier (ex. "avant-import")
 */
export function downloadBackup(backup, suffix = "") {
  const date = new Date().toISOString().slice(0, 10);
  const name = `vocabprogress-sauvegarde-${date}${suffix ? `-${suffix}` : ""}.json`;
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Lecture d'un fichier choisi par l'utilisateur
 * @param {File} file
 * @throws {Error} si le fichier n'est pas du JSON lisible
 * @returns {Promise<unknown>}
 */
export async function readBackupFile(file) {
  try {
    return JSON.parse(await file.text());
  } catch {
    throw new Error("Fichier illisible : choisis un fichier de sauvegarde .json.");
  }
}

/** Date de la dernière sauvegarde téléchargée (pour le rappel), ou null */
export function getLastBackupDate() {
  try {
    const raw = localStorage.getItem(LAST_BACKUP_KEY);
    return raw ? new Date(raw) : null;
  } catch {
    return null;
  }
}

export function setLastBackupDate(date = new Date()) {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, date.toISOString());
  } catch {
    // stockage indisponible (navigation privée, quota dépassé, ...)
  }
}
