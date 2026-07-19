'use client';

import { useEffect } from 'react';

export default function PageEffects() {
  useEffect(() => {
    document.documentElement.classList.add('motion-ready');

    const onScroll = () => {
      document.documentElement.style.setProperty(
        '--scroll-y',
        String(window.scrollY)
      );
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return null;
}
