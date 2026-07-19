'use client';

import { useTranslation } from '../lib/i18n/context';
import SectionIntro from './SectionIntro';

const reviewKeys = ['one', 'two', 'three'] as const;

export default function Reviews() {
  const t = useTranslation();

  return (
    <section className="reviews reviews-v2" id="reviews">
      <div className="section-block">
        <SectionIntro
          eyebrow={t.reviews.eyebrow}
          title={t.reviews.title}
          lead={t.reviews.lead}
        />

        <div className="reviews-grid reviews-grid-v2">
          {reviewKeys.map((key) => {
            const review = t.reviews.items[key];
            return (
              <article className="review-card review-card-v2" key={key}>
                <div className="review-stars" aria-label={'5 / 5'}>
                  {'?????'}
                </div>
                <blockquote>{review.text}</blockquote>
                <footer>
                  <strong>{review.name}</strong>
                  <span>{review.meta}</span>
                  <span className="review-source">{review.source}</span>
                </footer>
              </article>
            );
          })}
        </div>

        <p className="reviews-note">{t.reviews.note}</p>
      </div>
    </section>
  );
}
