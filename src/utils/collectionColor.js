/**
 * Couleur d'accent d'une collection, dérivée de son id (rien n'est stocké en base).
 * Classes écrites en entier pour que Tailwind les génère.
 */
const COLLECTION_COLORS = [
  "bg-primary",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
];

export function getCollectionColor(collectionId) {
  return COLLECTION_COLORS[(collectionId ?? 0) % COLLECTION_COLORS.length];
}
