import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { translations, type Language, type TranslationKey } from "./i18n";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: <K extends TranslationKey>(
    key: K,
    ...args: (typeof translations)[K]["en"] extends (...args: infer A) => string
      ? A
      : []
  ) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "konbini_language";

function getInitialLang(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "ja" || stored === "en") return stored;
    // Auto-detect Japanese browser
    if (navigator.language?.startsWith("ja")) return "ja";
  } catch {
    // ignore
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => getInitialLang());

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (<K extends TranslationKey>(key: K, ...args: unknown[]): string => {
      const entry = translations[key];
      const value = entry[lang];
      if (typeof value === "function") {
        return (value as (...a: unknown[]) => string)(...args);
      }
      return value as string;
    }) as LanguageContextType["t"],
    [lang]
  );

  // Keep document title + html lang attribute in sync with current language
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang === "ja" ? "ja" : "en";
    const title = translations.documentTitle[lang];
    if (typeof title === "string") {
      document.title = title;
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
