'use client';

import { useLanguage } from '../lib/i18n/context';
import type { Language } from '../lib/i18n/types';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      {(['is', 'en'] as Language[]).map((code) => (
        <button
          key={code}
          type="button"
          className={'lang-switcher-btn' + (lang === code ? ' active' : '')}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
