const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "a-reviser", label: "À réviser" },
  { key: "maitrisees", label: "Maîtrisées" },
];

/**
 * Filtres des cartes d'une fiche (le filtrage est fait dans la page)
 */
export default function FlashcardFilter({ filter, onFilterChange, counts }) {
  return (
    <div className="flex gap-2">
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onFilterChange(key)}
          className={`neu-shape-control neu-focusable px-3 py-1.5 text-xs font-medium transition-all ${
            filter === key
              ? "neu-pressed text-primary"
              : "neu-btn text-neutral-600 dark:text-neutral-300"
          }`}
        >
          {label} <span className="opacity-60">{counts[key]}</span>
        </button>
      ))}
    </div>
  );
}
