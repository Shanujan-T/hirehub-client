import { THEME_KEY } from "./constants";

export type ThemePreference = "light" | "dark";
export type ResolvedTheme = ThemePreference;

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function normalizeStoredTheme(stored: string | null): ThemePreference {
  if (stored === "dark" || stored === "light") return stored;
  if (stored === "system") return systemPrefersDark() ? "dark" : "light";
  return "light";
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference;
}

export function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "light";
  return normalizeStoredTheme(localStorage.getItem(THEME_KEY));
}

export function applyTheme(preference: ThemePreference): ResolvedTheme {
  if (typeof document === "undefined") return "light";
  const resolved = resolveTheme(preference);
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.setAttribute("data-theme", resolved);
  root.setAttribute("data-theme-preference", preference);
  localStorage.setItem(THEME_KEY, preference);
  return resolved;
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.isContentEditable) return true;
  return false;
}
