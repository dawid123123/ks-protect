'use client';

import { useTranslation } from '../lib/i18n/context';
import { isDemo } from '../lib/brand';
import SectionIntro from './SectionIntro';

const packageKeys = ['silver', 'gold', 'diamond'] as const;

/** Real site links to old WP package pages; demo stays inside the template. */
const packageHrefs: Record<(typeof packageKeys)[number], string> = {
  silver: 'https://ksprotect.is/services/silfur/',
  gold: 'https://ksprotect.is/services/gull/',
  diamond: 'https://ksprotect.is/services/demants/',
};

const demoPackageHref = '/#contact';

const benefitKeys = ['hydrophobic', 'heat', 'dust', 'chemical'] as const;

function BenefitIcon({ type }: { type: (typeof benefitKeys)[number] }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (type === 'hydrophobic') {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 3.5c3.5 4.2 6 7.4 6 10.8a6 6 0 1 1-12 0c0-3.4 2.5-6.6 6-10.8Z" />
      </svg>
    );
  }

  if (type === 'heat') {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>
    );
  }

  if (type === 'dust') {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M4 16c1.8-2.2 3.6-3.3 5.5-3.3M14.5 12.7C16.8 11.2 18.7 9 20 6.5M8 20c1.2-1.5 2.5-2.2 3.8-2.2" />
        <circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="17" cy="16" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <path d="M12 3 4 7v6c0 5 3.4 7.7 8 9 4.6-1.3 8-4 8-9V7l-8-4Z" />
      <path d="m9.5 12 1.8 1.8L15.5 10" />
    </svg>
  );
}

export default function Graphene() {
  const t = useTranslation();

  const packages = packageKeys.map((key, index) => ({
    featured: key === 'gold',
    href: isDemo ? demoPackageHref : packageHrefs[key],
    external: !isDemo,
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
                <small>{item.tag}</small>
              </div>
              <h3>{item.name}</h3>
              <ul className="service-list">
                {item.items.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <p className="package-note">{item.note}</p>
              <a
                href={item.href}
                className="service-link"
                {...(item.external
                  ? { target: '_blank', rel: 'noreferrer' }
                  : {})}
              >
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
            {benefitKeys.map((key) => (
              <article className="benefitCard benefitCard-v2" key={key}>
                <div className="benefit-card-body">
                  <div className="benefit-card-icon-stage" aria-hidden="true">
                    <BenefitIcon type={key} />
                  </div>
                  <h3>{t.services.benefits[key].title}</h3>
                  <p>{t.services.benefits[key].text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="graphene-cta-wrap">
            <a href="/#contact" className="btn-primary graphene-cta">
              {t.nav.getQuote} <span>{'\u2197'}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
