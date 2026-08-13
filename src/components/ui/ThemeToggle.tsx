import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300 hover:scale-105 active:scale-95"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun className={`absolute w-4 h-4 transition-all duration-300 ${theme === 'dark' ? 'scale-0 opacity-0 -rotate-90' : 'scale-100 opacity-100 rotate-0'}`} />
        <Moon className={`absolute w-4 h-4 transition-all duration-300 ${theme === 'light' ? 'scale-0 opacity-0 rotate-90' : 'scale-100 opacity-100 rotate-0'}`} />
      </div>
    </button>
  );
}
