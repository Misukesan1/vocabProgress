import { Link } from "react-router";
import { Layers, Settings } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="neu-bar-top sticky top-0 z-20 px-5 py-4">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="neu-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary">
            <Layers size={18} />
          </span>
          <h1 className="text-lg font-semibold tracking-tight text-neutral-700 dark:text-neutral-200">
            VocabProgress
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/options"
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
