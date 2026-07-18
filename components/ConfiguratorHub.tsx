'use client';

import Link from 'next/link';
import { useTranslation } from '../lib/i18n/context';
import { verifiedCarPhotos } from './siteImages';
import SectionIntro from './SectionIntro';

export default function ConfiguratorHub() {
  const t = useTranslation();

  const cards = [
    {
      href: '/ppf',
      ...t.configuratorHub.ppf,
      image: verifiedCarPhotos[2],
      accent: 'ppf',
    },
    {
      href: '/tint',
      ...t.configuratorHub.tint,
      image: verifiedCarPhotos[1],
      accent: 'tint',
    },
  ];

  return (
    <section className="configurator-hub configurator-hub-v2" id="configurators">
      <div className="section-block">
        <SectionIntro
          eyebrow={t.configuratorHub.eyebrow}
          title={t.configuratorHub.title}
          lead={t.configuratorHub.lead}
        />

        <div className="configurator-hub-grid configurator-hub-grid-v2">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={
                'configurator-hub-card configurator-hub-card-v2 configurator-hub-card-' +
                card.accent
              }
            >
              <div className="configurator-hub-media">
                <img src={card.image} alt="" loading="lazy" />
              </div>
              <div className="configurator-hub-copy">
                <span>{card.eyebrow}</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <span className="configurator-hub-cta">
                  {card.cta} <span aria-hidden="true">{'\u2197'}</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
