import { Search } from "lucide-react";

const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "a-reviser", label: "À réviser" },
  { key: "maitrisees", label: "Maîtrisées" },
];

/**
 * Recherche + filtres des cartes d'une fiche (le filtrage est fait dans la page)
 */
export default function FlashcardFilter({ searchValue, onSearchValueChange, filter, onFilterChange, counts }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="neu-pressed neu-shape-control flex items-center gap-2 px-3 py-2 text-neutral-500 focus-within:text-primary dark:text-neutral-400">
        <Search size={16} />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
          placeholder="Rechercher une carte…"
          className="w-full bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
        />
      </label>

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
    </div>
  );
}
