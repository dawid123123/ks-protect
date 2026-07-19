'use client';

import { useTranslation } from '../lib/i18n/context';
import SectionIntro from './SectionIntro';

const faqKeys = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'] as const;

export default function FAQ() {
  const t = useTranslation();

  return (
    <section className="faq faq-v2">
      <div className="section-block faq-shell-v2">
        <SectionIntro
          eyebrow={t.faq.eyebrow}
          title={t.faq.title}
          lead={t.faq.lead}
        />

        <div className="faq-list faq-list-v2">
          {faqKeys.map((key) => {
            const item = t.faq.items[key];
            return (
              <details className="faq-item faq-item-v2" key={key}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            );
          })}
        </div>

        <div className="faq-cta-wrap">
          <p>{t.faq.ctaText}</p>
          <a href="/#contact" className="btn-primary">
            {t.nav.getQuote} <span>{'\u2197'}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
