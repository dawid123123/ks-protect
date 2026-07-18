'use client';

import { useTranslation } from '../lib/i18n/context';

export default function Footer() {
  const t = useTranslation();

  return (
    <footer className="footer footer-v2">
      <div className="footer-shell">
        <div className="footer-brand">
          <strong>
            KS <span>PROTECT</span>
          </strong>
          <p>{t.footer.tagline}</p>
        </div>
        <div className="footer-links">
          <a href="/#graphene">{t.nav.graphene}</a>
          <a href="/ppf">{t.nav.ppf}</a>
          <a href="/tint">{t.nav.tint}</a>
          <a href="/netverslun" target="_blank" rel="noopener noreferrer">
            {t.nav.shop}
          </a>
          <a href="/#contact">{t.nav.contact}</a>
        </div>
        <p className="footer-copy">{t.footer.copyright}</p>
      </div>
    </footer>
  );
}
