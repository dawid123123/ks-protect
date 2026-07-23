'use client';

import { verifiedCarPhotos, photoThumb } from './siteImages';
import { useTranslation } from '../lib/i18n/context';
import { brand } from '../lib/brand';

const instagramPhotos = verifiedCarPhotos.map((url) => photoThumb(url, 640));

export default function InstagramStrip() {
  const t = useTranslation();

  if (!brand.showInstagram) {
    return null;
  }

  return (
    <div className="footer-instagram">
      <div className="footer-instagram-head">
        <div>
          <p className="footer-block-label">{t.footer.instagramLabel}</p>
          <p className="footer-instagram-handle">{brand.instagramHandle}</p>
        </div>
        <a
          className="footer-instagram-link"
          href={brand.instagramUrl}
          target={brand.instagramUrl.startsWith('http') ? '_blank' : undefined}
          rel={brand.instagramUrl.startsWith('http') ? 'noreferrer' : undefined}
        >
          {t.footer.instagramFollow} <span>{'\u2197'}</span>
        </a>
      </div>

      <div className="footer-instagram-grid">
        {instagramPhotos.map((src, index) => (
          <a
            key={src + index}
            className="footer-instagram-tile"
            href={brand.instagramUrl}
            target={brand.instagramUrl.startsWith('http') ? '_blank' : undefined}
            rel={brand.instagramUrl.startsWith('http') ? 'noreferrer' : undefined}
            aria-label={t.footer.instagramPhotoAlt + ' ' + (index + 1)}
          >
            <img src={src} alt="" loading="lazy" />
          </a>
        ))}
      </div>
    </div>
  );
}
