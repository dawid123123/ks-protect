'use client';

import { galleryProjects } from './siteImages';
import SectionIntro from './SectionIntro';
import { useTranslation } from '../lib/i18n/context';
import { brand } from '../lib/brand';

export default function Gallery() {
  const t = useTranslation();

  return (
    <section className="gallery gallery-v2" id="gallery">
      <div className="section-block">
        <SectionIntro eyebrow={t.gallery.eyebrow} title={t.gallery.title} />
        <div className="galleryGrid galleryGrid-v2">
          {galleryProjects.map((project, index) => (
            <a
              className="galleryCard galleryCard-v2"
              key={project.model + index}
              href={project.href || brand.instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={project.image}
                alt={t.gallery.imageAlt + ' ' + (index + 1)}
                className="galleryImage"
                loading="lazy"
              />
            </a>
          ))}
        </div>
        <div className="gallery-partner">
          <div className="gallery-partner-badges">
            <img
              src="/brand/llumar-badge.svg"
              alt="LLumar PPF and tint"
              className="gallery-partner-badge"
            />
            <img
              src="/brand/waxedshine-certified.png"
              alt="WaxedShine certified installer"
              className="gallery-partner-badge"
            />
          </div>
          <p>{t.gallery.partnerNote}</p>
        </div>
      </div>
    </section>
  );
}
