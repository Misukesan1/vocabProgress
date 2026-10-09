import { Link, useLocation } from "react-router";
import { Layers, Settings } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header({ locked = false }) {
  const { pathname } = useLocation();

  return (
    <header className="neu-bar-top sticky top-0 z-20 px-5 py-4">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
        {/* Verrouillé pendant le tutoriel, comme la barre du bas */}
        <Link
          to="/"
          title="Retour à l'accueil"
          inert={locked}
          className={`neu-focusable flex items-center gap-2.5 rounded-full transition-opacity ${locked ? "opacity-40" : ""}`}
        >
          <span className="neu-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary">
            <Layers size={18} />
          </span>
          <h1 className="text-lg font-semibold tracking-tight text-neutral-700 dark:text-neutral-200">VocabProgress</h1>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/options"
            state={{ from: pathname }} // pendant le tutoriel, Options propose d'y revenir
            aria-label="Options et sauvegarde"
            title="Options et sauvegarde"
            className="neu-btn neu-focusable flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 hover:-translate-y-0.5 dark:text-neutral-300"
          >
            <Settings size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
