// ============================================================
// useTheme — Theme management hook (Part H)
// Tutr app
//
// Reads/writes "tutr:theme" from localStorage.
// Values: "auto" | "light" | "dark"
//
// "auto" → follows prefers-color-scheme media query.
// "light" / "dark" → override OS preference.
//
// Applies:
//   • data-theme attribute on <html> ("light" | "dark")
//   • "dark" CSS class on <html> (for Tailwind dark: variants
//     and the .dark {} CSS block in index.css)
// ============================================================

import { useState, useEffect, useCallback } from "react";

export type ThemePreference = "auto" | "light" | "dark";

const STORAGE_KEY = "tutr:theme";

function getStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "auto";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "auto") return stored;
  return "auto";
}

function resolveEffectiveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "auto") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference;
}

function applyToDOM(effective: "light" | "dark") {
  const root = document.documentElement;
  // Set data-theme so the CSS media query selector :root:not([data-theme="light"]) works correctly
  root.setAttribute("data-theme", effective);
  // Toggle Tailwind dark class for dark: utility variants
  if (effective === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreference>(getStoredPreference);

  // Apply theme to DOM whenever preference changes
  useEffect(() => {
    const effective = resolveEffectiveTheme(theme);
    applyToDOM(effective);
  }, [theme]);

  // When "auto": subscribe to OS preference changes
  useEffect(() => {
    if (theme !== "auto") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      applyToDOM(e.matches ? "dark" : "light");
    };

    if (mq.addEventListener) {
      mq.addEventListener("change", handleChange);
      return () => mq.removeEventListener("change", handleChange);
    }

    // Fallback for Safari < 14
    mq.addListener(handleChange);
    return () => mq.removeListener(handleChange);
  }, [theme]);

  const setTheme = useCallback((preference: ThemePreference) => {
    localStorage.setItem(STORAGE_KEY, preference);
    setThemeState(preference);
    // Eagerly apply without waiting for the effect to re-run
    applyToDOM(resolveEffectiveTheme(preference));
  }, []);

  return { theme, setTheme };
}
