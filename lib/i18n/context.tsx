'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { translations, type Translations } from './translations';
import { DEFAULT_LANGUAGE, type Language } from './types';
import { isDemo } from '../brand';
import { applyDemoCopy } from './demoCopy';

const STORAGE_KEY = 'ks-protect-lang';

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolveCopy(lang: Language): Translations {
  const base = translations[lang];
  return isDemo ? applyDemoCopy(base) : base;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'is' || stored === 'en') {
      setLangState(stored);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    document.documentElement.lang = lang;
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.body.classList.toggle('demo-mode', isDemo);
  }, [lang, ready]);

  const setLang = (next: Language) => {
    setLangState(next);
  };

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: resolveCopy(lang),
    }),
    [lang]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export function useTranslation() {
  return useLanguage().t;
}

export function formatLocalizedPrice(lang: Language, value: number) {
  return (
    value.toLocaleString(lang === 'is' ? 'is-IS' : 'en-US') + ' kr.'
  );
}
