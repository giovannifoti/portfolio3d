"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const active = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", active);
    setDark(active);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="focus-ring grid h-10 w-10 place-items-center rounded-lg text-zinc-700 transition hover:bg-zinc-900/5 dark:text-zinc-200 dark:hover:bg-white/10"
      aria-label={dark ? "Attiva tema chiaro" : "Attiva tema scuro"}
      title={dark ? "Tema chiaro" : "Tema scuro"}
    >
      {dark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
