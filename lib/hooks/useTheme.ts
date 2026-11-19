"use client";

import { useCallback, useEffect, useState } from "react";
import type { ThemePref } from "@/types";

const KEY = "mt.theme";

function readStored(): ThemePref {
  if (typeof window === "undefined") return "system";
  const v = localStorage.getItem(KEY);
  if (v === "light" || v === "dark" || v === "system") return v;
  return "system";
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePref>("system");

  useEffect(() => {
    setThemeState(readStored());
  }, []);

  const setTheme = useCallback((t: ThemePref) => {
    setThemeState(t);
    if (typeof window !== "undefined") localStorage.setItem(KEY, t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const apply = () => {
      const isDark =
        theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.toggle("dark", isDark);
    };
    apply();
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  return { theme, setTheme };
}
