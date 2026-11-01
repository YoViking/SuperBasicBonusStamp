import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LanguageCode,
  CurrencyCode,
  Translations,
  translations,
  LANGUAGE_OPTIONS,
  CURRENCY_OPTIONS,
} from './translations';

const LANGUAGE_STORAGE_KEY = '@sbbs_language';
const CURRENCY_STORAGE_KEY = '@sbbs_currency';

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currency: CurrencyCode;
  setCurrency: (curr: CurrencyCode) => void;
  currencySymbol: string;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'sv',
  setLanguage: () => {},
  currency: 'SEK',
  setCurrency: () => {},
  currencySymbol: 'kr',
  t: translations.sv,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('sv');
  const [currency, setCurrencyState] = useState<CurrencyCode>('SEK');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((saved) => {
        if (saved && LANGUAGE_OPTIONS.some((o) => o.code === saved)) {
          setLanguageState(saved as LanguageCode);
        }
      })
      .catch(() => {});

    AsyncStorage.getItem(CURRENCY_STORAGE_KEY)
      .then((saved) => {
        if (saved && CURRENCY_OPTIONS.some((o) => o.code === saved)) {
          setCurrencyState(saved as CurrencyCode);
        }
      })
      .catch(() => {});
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang).catch(() => {});
  };

  const setCurrency = (curr: CurrencyCode) => {
    setCurrencyState(curr);
    AsyncStorage.setItem(CURRENCY_STORAGE_KEY, curr).catch(() => {});
  };

  const currencySymbol = useMemo(() => {
    return (
      CURRENCY_OPTIONS.find((c) => c.code === currency)?.symbol || 'kr'
    );
  }, [currency]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      currency,
      setCurrency,
      currencySymbol,
      t: translations[language] || translations.sv,
    }),
    [language, currency, currencySymbol]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
