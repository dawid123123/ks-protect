'use client';

import { useTranslation } from '../lib/i18n/context';
import { brand } from '../lib/brand';

const sectionKeys = [
  'general',
  'delivery',
  'returns',
  'services',
  'warranty',
  'payments',
  'liability',
  'photos',
  'prices',
  'taxes',
  'privacy',
  'jurisdiction',
] as const;

export default function Terms() {
  const t = useTranslation();

  return (
    <section className="terms terms-v2">
      <div className="section-block terms-shell-v2">
        <header className="terms-hero">
          <p className="eyebrow">{t.terms.eyebrow}</p>
          <h1>{t.terms.title}</h1>
          <p className="terms-lead">{t.terms.lead}</p>
          <p className="terms-updated">{t.terms.updated}</p>
        </header>

        <div className="terms-toc" aria-label={t.terms.tocLabel}>
          {sectionKeys.map((key, index) => (
            <a key={key} href={`#terms-${key}`}>
              {String(index + 1).padStart(2, '0')}. {t.terms.sections[key].title}
            </a>
          ))}
        </div>

        <div className="terms-body">
          {sectionKeys.map((key) => {
            const section = t.terms.sections[key];
            return (
              <article className="terms-section" id={`terms-${key}`} key={key}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </article>
            );
          })}
        </div>

        <div className="terms-contact">
          <p>{t.terms.contactText}</p>
          <a href={'mailto:' + brand.email}>{brand.email}</a>
          <span className="terms-contact-sep">{'\u00b7'}</span>
          <a href={brand.phoneTel}>{brand.phoneDisplay}</a>
        </div>
      </div>
    </section>
  );
}
