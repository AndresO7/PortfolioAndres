"use client";

import { useSyncExternalStore } from "react";
import { content, type Content, type Locale } from "./content";

const KEY = "reel-locale";
let current: Locale | null = null;
const listeners = new Set<() => void>();

/** A saved choice wins; otherwise Spanish-speaking browsers start in Spanish. */
function detect(): Locale {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "en" || saved === "es") return saved;
  } catch {
    // storage can be blocked (private mode, sandboxed previews): fall through
  }
  return navigator.language?.toLowerCase().startsWith("es") ? "es" : "en";
}

const getSnapshot = (): Locale => (current ??= detect());
// The server always renders English; the client swaps before the slate lifts.
const getServerSnapshot = (): Locale => "en";
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export function setLocale(locale: Locale) {
  if (locale === current) return;
  current = locale;
  try {
    localStorage.setItem(KEY, locale);
  } catch {
    // not persisted; the switch still applies to this visit
  }
  document.documentElement.lang = locale;
  listeners.forEach((fn) => fn());
}

export const useLocale = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

/** The copy for the current language. Its identity changes only when the language does. */
export const useT = (): Content => content[useLocale()];
