'use client';

import { heroImage } from './siteImages';
import { useTranslation } from '../lib/i18n/context';

export default function Hero() {
  const t = useTranslation();
  const quickLinks = [
    { href: '/ppf', label: t.hero.quickLinks.ppfConfigurator },
    { href: '/tint', label: t.hero.quickLinks.tintConfigurator },
    { href: '/netverslun', label: t.hero.quickLinks.onlineShop },
    { href: '/#contact', label: t.hero.quickLinks.getQuote },
  ];

  return (
    <section className="hero hero-v2" id="home">
      <div className="hero-shell">
        <div className="hero-panel hero-panel-copy">
          <div className="hero-kicker">
            <span />
            {t.hero.kicker}
          </div>
          <h1 className="hero-title">
            <span className="hero-title-line">{t.hero.titleLine1}</span>
            <span className="hero-title-line hero-title-accent">
              {t.hero.titleLine2}
            </span>
            <span className="hero-title-line">{t.hero.titleLine3}</span>
          </h1>
          <p className="hero-description">{t.hero.description}</p>
          <div className="hero-actions">
            <a className="btn-primary" href="/#contact">
              {t.hero.getFreeQuote}
            </a>
            <a className="btn-ghost" href="#graphene">
              {t.hero.exploreServices} <span>{'\u2197'}</span>
            </a>
          </div>
          <div className="hero-stats hero-stats-v2">
            <div>
              <h2>7+</h2>
              <p>{t.hero.statsExperience}</p>
            </div>
            <div>
              <h2>100+</h2>
              <p>{t.hero.statsCars}</p>
            </div>
            <div>
              <h2>100%</h2>
              <p>{t.hero.statsSatisfaction}</p>
            </div>
          </div>
          <div className="hero-quick-links">
            {quickLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="hero-panel hero-panel-media">
          <div className="hero-image hero-image-v2">
            <img src={heroImage} alt={t.hero.imageAlt} />
            <div className="hero-media-badge">
              <span>12</span>
              {t.hero.warranty}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
