import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Activer le thème clair" : "Activer le thème sombre"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="neu-btn neu-focusable flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 hover:-translate-y-0.5 dark:text-neutral-300"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
