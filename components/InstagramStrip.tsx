'use client';

import { verifiedCarPhotos, photoThumb } from './siteImages';
import { useTranslation } from '../lib/i18n/context';

const INSTAGRAM_URL = 'https://www.instagram.com/ks_protect/';
const instagramPhotos = verifiedCarPhotos.map((url) => photoThumb(url, 640));

export default function InstagramStrip() {
  const t = useTranslation();

  return (
    <div className="footer-instagram">
      <div className="footer-instagram-head">
        <div>
          <p className="footer-block-label">{t.footer.instagramLabel}</p>
          <p className="footer-instagram-handle">@ks_protect</p>
        </div>
        <a
          className="footer-instagram-link"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
        >
          {t.footer.instagramFollow} <span>{'\u2197'}</span>
        </a>
      </div>

      <div className="footer-instagram-grid">
        {instagramPhotos.map((src, index) => (
          <a
            key={src + index}
            className="footer-instagram-tile"
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t.footer.instagramPhotoAlt + ' ' + (index + 1)}
          >
            <img src={src} alt="" loading="lazy" />
          </a>
        ))}
      </div>
    </div>
  );
}
