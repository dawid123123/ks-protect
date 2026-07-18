'use client';

import Link from 'next/link';
import { useTranslation } from '../lib/i18n/context';

export default function NotFound() {
  const t = useTranslation();

  return (
    <main className="not-found-page">
      <div className="not-found-shell">
        <p className="not-found-kicker">{t.notFound.kicker}</p>
        <h1>{t.notFound.title}</h1>
        <p>{t.notFound.description}</p>
        <div className="not-found-actions">
          <Link href="/" className="btn-primary">
            {t.notFound.backHome}
          </Link>
          <Link href="/#contact" className="btn-ghost">
            {t.notFound.getQuote}
          </Link>
        </div>
      </div>
    </main>
  );
}
