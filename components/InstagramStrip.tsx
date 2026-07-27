'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '../lib/i18n/context';
import { brand } from '../lib/brand';
import {
  INSTAGRAM_ROTATE_MS,
  INSTAGRAM_VISIBLE,
  instagramPosts,
} from '../lib/instagramPosts';

export default function InstagramStrip() {
  const t = useTranslation();
  const [offset, setOffset] = useState(0);

  const total = instagramPosts.length;
  const visibleCount = Math.min(INSTAGRAM_VISIBLE, total);

  useEffect(() => {
    if (total <= visibleCount) {
      return;
    }

    const timer = window.setInterval(() => {
      setOffset((prev) => (prev + 1) % total);
    }, INSTAGRAM_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [total, visibleCount]);

  if (!brand.showInstagram || total === 0) {
    return null;
  }

  const visible = Array.from({ length: visibleCount }, (_, index) => {
    return instagramPosts[(offset + index) % total];
  });

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
        {visible.map((post) => (
          <a
            key={post.id + '-' + offset}
            className="footer-instagram-tile"
            href={post.href}
            target="_blank"
            rel="noreferrer"
            aria-label={t.footer.instagramPhotoAlt}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.src} alt="" loading="lazy" decoding="async" />
          </a>
        ))}
      </div>
    </div>
  );
}
