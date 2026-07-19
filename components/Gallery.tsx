'use client';

import { galleryProjects } from './siteImages';
import SectionIntro from './SectionIntro';
import { useTranslation } from '../lib/i18n/context';

export default function Gallery() {
  const t = useTranslation();

  return (
    <section className="gallery gallery-v2" id="gallery">
      <div className="section-block">
        <SectionIntro
          eyebrow={t.gallery.eyebrow}
          title={t.gallery.title}
        />
        <div className="galleryGrid galleryGrid-v2">
          {galleryProjects.map((project, index) => (
            <article className="galleryCard galleryCard-v2" key={project.model + index}>
              <img
                src={project.image}
                alt={t.gallery.imageAlt + ' ' + (index + 1)}
                className="galleryImage"
                loading="lazy"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
