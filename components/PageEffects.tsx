'use client';

import { useEffect } from 'react';

/** Marks motion CSS as ready. No per-scroll style writes (those tanked FPS). */
export default function PageEffects() {
  useEffect(() => {
    document.documentElement.classList.add('motion-ready');
  }, []);

  return null;
}
