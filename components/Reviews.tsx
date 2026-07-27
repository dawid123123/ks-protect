'use client';

import { useTranslation } from '../lib/i18n/context';
import {
  googleMapsUrl,
  googlePlaceSummary,
  googleReviews,
  googleReviewsUrl,
} from '../lib/googleReviews';
import SectionIntro from './SectionIntro';

function StarRow({ rating }: { rating: number }) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="review-stars" aria-label={full + ' / 5'}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={'review-star' + (index < full ? ' on' : '')}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function Reviews() {
  const t = useTranslation();
  const isIs = t.reviews.eyebrow.includes('UMSAGNIR');

  const copy = isIs
    ? {
        summary:
          googlePlaceSummary.rating.toFixed(1) +
          ' · ' +
          googlePlaceSummary.totalReviews +
          ' umsagnir á Google',
        emptyText: '5 stjörnur á Google',
        seeAll: 'Sjá allar umsagnir á Google',
        write: 'Skrifa umsögn',
      }
    : {
        summary:
          googlePlaceSummary.rating.toFixed(1) +
          ' · ' +
          googlePlaceSummary.totalReviews +
          ' Google reviews',
        emptyText: '5 stars on Google',
        seeAll: 'See all reviews on Google',
        write: 'Write a review',
      };

  return (
    <section className="reviews reviews-v2" id="reviews">
      <div className="section-block">
        <SectionIntro
          eyebrow={t.reviews.eyebrow}
          title={t.reviews.title}
          lead={t.reviews.lead}
        />

        <div className="reviews-google-summary">
          <StarRow rating={googlePlaceSummary.rating} />
          <p>{copy.summary}</p>
        </div>

        <div className="reviews-grid reviews-grid-v2">
          {googleReviews.map((review) => (
            <article className="review-card review-card-v2" key={review.id}>
              <StarRow rating={review.rating} />
              <blockquote>
                {review.text
                  ? review.text
                  : copy.emptyText}
              </blockquote>
              <footer>
                <strong>{review.author}</strong>
                <span>{review.relativeTime}</span>
                <a
                  className="review-source"
                  href={googleReviewsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {review.source}
                </a>
              </footer>
            </article>
          ))}
        </div>

        <div className="reviews-google-actions">
          <a
            className="reviews-google-link"
            href={googleReviewsUrl}
            target="_blank"
            rel="noreferrer"
          >
            {copy.seeAll} <span>{'\u2197'}</span>
          </a>
          <a
            className="reviews-google-link secondary"
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            {copy.write} <span>{'\u2197'}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
