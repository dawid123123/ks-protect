'use client';

import { useTranslation } from '../lib/i18n/context';
import { brand, isDemo } from '../lib/brand';
import InstagramStrip from './InstagramStrip';

const MAP_QUERY = brand.mapQuery;
const MAP_EMBED_URL = MAP_QUERY
  ? `https://www.google.com/maps?q=${MAP_QUERY}&z=16&output=embed`
  : '';
const MAP_EXTERNAL_URL = MAP_QUERY
  ? `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`
  : '#';

const hourRows = [
  ['weekdays', 'weekdaysValue'],
  ['friday', 'fridayValue'],
  ['weekend', 'weekendValue'],
] as const;

export default function Footer() {
  const t = useTranslation();

  return (
    <footer className="footer footer-v2">
      <div className="footer-shell">
        <div className="footer-top">
          <div className="footer-brand">
            <strong>
              {brand.logoPrimary}
              {brand.logoAccent ? (
                <>
                  {' '}
                  <span>{brand.logoAccent}</span>
                </>
              ) : null}
            </strong>
            <p>{t.footer.tagline}</p>
          </div>

          <div className="footer-contact-block">
            <p className="footer-block-label">{t.footer.contactLabel}</p>
            <div className="footer-contact-list">
              <a href={brand.phoneTel}>
                <span>{t.contact.phone}</span>
                {t.footer.company.phone}
              </a>
              <a href={'mailto:' + brand.email}>
                <span>{t.contact.email}</span>
                {t.footer.company.email}
              </a>
              <div className="footer-address">
                <span>{t.contact.location}</span>
                {t.footer.company.address}
              </div>
            </div>

            <div className="footer-hours">
              <p className="footer-block-label">{t.footer.hoursLabel}</p>
              <dl className="footer-hours-list">
                {hourRows.map(([dayKey, valueKey]) => (
                  <div key={dayKey}>
                    <dt>{t.footer.hours[dayKey]}</dt>
                    <dd>{t.footer.hours[valueKey]}</dd>
                  </div>
                ))}
              </dl>
              <p className="footer-hours-note">{t.footer.hoursNote}</p>
            </div>
          </div>

          <div className="footer-map-block">
            <p className="footer-block-label">{t.footer.mapLabel}</p>
            {brand.showMap && MAP_EMBED_URL ? (
              <>
                <div className="footer-map">
                  <iframe
                    title={t.footer.mapLabel}
                    src={MAP_EMBED_URL}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <a
                  className="footer-map-link"
                  href={MAP_EXTERNAL_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.footer.openInMaps} <span>{'\u2197'}</span>
                </a>
              </>
            ) : (
              <p className="footer-address">{t.footer.company.address}</p>
            )}
          </div>
        </div>

        <InstagramStrip />

        <nav className="footer-links" aria-label="Footer">
          <a href="/#graphene">{t.nav.graphene}</a>
          <a href="/ppf">{t.nav.ppf}</a>
          <a href="/tint">{t.nav.tint}</a>
          <a href="/um-okkur">{t.nav.about}</a>
          <a href="/faq">{t.nav.faq}</a>
          <a href="/netverslun">{t.nav.shop}</a>
          <a href="/#contact">{t.nav.contact}</a>
        </nav>

        <div className="footer-bottom">
          <div className="footer-company-meta">
            <p>{t.footer.company.address}</p>
            <p>
              {t.footer.company.ktLabel}: {t.footer.company.kt}
              <span className="footer-meta-sep">{' \u00b7 '}</span>
              {t.footer.company.vskLabel}: {t.footer.company.vsk}
            </p>
            <p>
              {t.contact.email}:{' '}
              <a href={`mailto:${t.footer.company.email}`}>{t.footer.company.email}</a>
              <span className="footer-meta-sep">{' \u00b7 '}</span>
              {t.contact.phone}:{' '}
              <a href={brand.phoneTel}>{t.footer.company.phone}</a>
            </p>
          </div>
          <p className="footer-copy">
            {t.footer.copyright}{' '}
            <a href="/skilmalar" className="footer-legal-link">
              {t.footer.terms}
            </a>
          </p>
        </div>

        {isDemo && brand.agencyUrl ? (
          <p className="footer-agency">
            Sniðmát frá{' '}
            <a href={brand.agencyUrl} target="_blank" rel="noreferrer">
              {brand.agencyName}
            </a>
          </p>
        ) : null}
      </div>
    </footer>
  );
}
