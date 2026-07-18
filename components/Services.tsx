'use client';

import { useTranslation } from '../lib/i18n/context';
import SectionIntro from './SectionIntro';

const packageKeys = ['bronze', 'silver', 'gold', 'diamond'] as const;
const packageHrefs: Record<(typeof packageKeys)[number], string> = {
  bronze: 'https://ksprotect.is/services/bronz/',
  silver: 'https://ksprotect.is/services/silfur/',
  gold: 'https://ksprotect.is/services/gull/',
  diamond: 'https://ksprotect.is/services/demants/',
};

const benefitKeys = ['hydrophobic', 'heat', 'dust', 'chemical'] as const;

export default function Graphene() {
  const t = useTranslation();

  const packages = packageKeys.map((key, index) => ({
    tier: index + 1,
    featured: key === 'gold',
    href: packageHrefs[key],
    ...t.services.packages[key],
  }));

  return (
    <section className="services services-v2" id="graphene">
      <div className="section-block">
        <SectionIntro
          eyebrow={t.services.eyebrow}
          title={t.services.title}
          lead={t.services.lead}
        />

        <div className="serviceGrid serviceGrid-v2">
          {packages.map((item) => (
            <article
              className={'serviceCard serviceCard-v2' + (item.featured ? ' featured' : '')}
              key={item.name}
            >
              {item.featured && (
                <span className="popular-badge">{t.services.mostPopular}</span>
              )}
              <div className="package-top">
                <div
                  className="package-tier"
                  aria-label={
                    t.services.tierLabel + ' ' + item.tier + ' ' + t.services.tierOf
                  }
                >
                  <div className="package-tier-stars">
                    {[1, 2, 3, 4].map((level) => (
                      <span
                        key={level}
                        className={'tier-star' + (level <= item.tier ? ' on' : '')}
                      >
                        {'\u2605'}
                      </span>
                    ))}
                  </div>
                </div>
                <small>{item.tag}</small>
              </div>
              <h3>{item.name}</h3>
              <ul className="service-list">
                {item.items.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <p className="package-note">{item.note}</p>
              <a href={item.href} target="_blank" rel="noreferrer" className="service-link">
                {t.services.viewPackage} <span>{'\u2197'}</span>
              </a>
            </article>
          ))}
        </div>

        <div className="graphene-benefits graphene-benefits-v2">
          <SectionIntro
            eyebrow={t.services.benefitsEyebrow}
            title={t.services.benefitsTitle}
          />
          <div className="benefitGrid benefitGrid-v2">
            {benefitKeys.map((key, index) => (
              <article className="benefitCard benefitCard-v2" key={key}>
                <span>{'0' + (index + 1)}</span>
                <h3>{t.services.benefits[key].title}</h3>
                <p>{t.services.benefits[key].text}</p>
              </article>
            ))}
          </div>
          <a href="/#contact" className="primary-btn graphene-cta">
            {t.services.getFreeQuote}
          </a>
        </div>
      </div>
    </section>
  );
}
