import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LanguageCode,
  Translations,
  translations,
  LANGUAGE_OPTIONS,
} from './translations';

const LANGUAGE_STORAGE_KEY = '@sbbs_language';

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'sv',
  setLanguage: () => {},
  t: translations.sv,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('sv');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((saved) => {
        if (saved && LANGUAGE_OPTIONS.some((o) => o.code === saved)) {
          setLanguageState(saved as LanguageCode);
        }
      })
      .catch(() => {});
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang).catch(() => {});
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language] || translations.sv,
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
