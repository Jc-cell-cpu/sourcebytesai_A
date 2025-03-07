"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Define a generic object type for translations
type Translations = Record<string, any>;

const defaultLang = "en";

const LanguageContext = createContext<{
  lang: string;
  setLang: (lang: string) => void;
  translations: Translations;
}>({
  lang: defaultLang,
  setLang: () => {},
  translations: {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState(defaultLang);
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    const storedLang = localStorage.getItem("language") || defaultLang;
    setLang(storedLang);
    loadTranslations(storedLang);
  }, []);

  const loadTranslations = async (language: string) => {
    try {
      const res = await import(`@/../public/messages/${language}.json`);
      setTranslations(res.default || {});
    } catch (error) {
      console.error("Error loading translation file:", error);
      setTranslations({});
    }
  };

  const changeLanguage = (language: string) => {
    setLang(language);
    localStorage.setItem("language", language);
    loadTranslations(language);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
