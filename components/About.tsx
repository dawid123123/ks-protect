'use client';

import Link from 'next/link';
import { aboutPagePhotos } from './siteImages';
import { useTranslation } from '../lib/i18n/context';

export default function About() {
  const t = useTranslation();
  const a = t.about;

  return (
    <section className="about about-v2">
      <div className="section-block about-shell-v2">
        <header className="about-hero-panel">
          <p className="eyebrow">{a.eyebrow}</p>
          <h1>{a.title}</h1>
          <p className="about-hero-lead">{a.lead}</p>
        </header>

        <div className="about-feature-grid">
          <div className="about-story-card">
            <p className="about-story-kicker">{a.introKicker}</p>
            <p>{a.introText}</p>
          </div>
          <div className="about-media-mosaic" aria-hidden="true">
            {aboutPagePhotos.map((src, index) => (
              <img
                key={src}
                src={src}
                alt=""
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        </div>

        <div className="about-section-label">
          <h2>{a.techSectionTitle}</h2>
        </div>

        <div className="about-tech-grid">
          <article className="about-tech-card about-tech-graphene">
            <span className="about-tech-label">{a.graphene.label}</span>
            <h3>{a.graphene.title}</h3>
            <p>{a.graphene.text}</p>
          </article>
          <article className="about-tech-card about-tech-ceramic">
            <span className="about-tech-label">{a.ceramic.label}</span>
            <h3>{a.ceramic.title}</h3>
            <p>{a.ceramic.text}</p>
            <p className="about-tech-note">{a.ceramic.note}</p>
          </article>
        </div>

        <div className="about-compare-panel">
          <div className="about-section-label about-section-label-center">
            <h2>{a.compare.title}</h2>
            <p>{a.compare.lead}</p>
          </div>

          <div className="about-compare-grid">
            <article className="about-compare-col about-compare-graphene">
              <h3>{a.compare.grapheneTitle}</h3>
              <ul>
                {a.compare.grapheneItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <div className="about-compare-vs" aria-hidden="true">
              VS
            </div>

            <article className="about-compare-col about-compare-ceramic">
              <h3>{a.compare.ceramicTitle}</h3>
              <p className="about-compare-note">{a.compare.ceramicNote}</p>
              <ul>
                {a.compare.ceramicItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>

        <blockquote className="about-quote">
          <p className="about-quote-kicker">{a.conclusionTitle}</p>
          <p>{a.conclusionText}</p>
        </blockquote>

        <div className="about-bottom-grid">
          <div className="about-deep-dive">
            <div className="about-section-label">
              <h2>{a.whatTitle}</h2>
            </div>
            {a.whatParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="about-benefits">
            <div className="about-section-label">
              <h2>{a.benefitsTitle}</h2>
            </div>
            <ul className="about-benefits-list">
              {a.benefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="about-cta-panel">
          <p>{a.ctaText}</p>
          <div className="about-cta-actions">
            <Link href="/#graphene" className="btn-ghost">
              {a.ctaPackages} <span>{'\u2197'}</span>
            </Link>
            <Link href="/#contact" className="btn-primary">
              {t.nav.getQuote} <span>{'\u2197'}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
