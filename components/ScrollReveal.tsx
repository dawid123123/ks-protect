'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reducedMotion) {
      node.classList.add('scroll-reveal-visible');
      return;
    }

    let observer: IntersectionObserver | null = null;
    let fallback: number | undefined;

    const reveal = () => {
      window.setTimeout(() => {
        node.classList.add('scroll-reveal-visible');
      }, delay);
    };

    if (typeof IntersectionObserver === 'undefined') {
      reveal();
      return;
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer?.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
    );

    observer.observe(node);
    fallback = window.setTimeout(reveal, 8000);

    return () => {
      observer?.disconnect();
      if (fallback) window.clearTimeout(fallback);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={'scroll-reveal' + (className ? ' ' + className : '')}
    >
      {children}
    </div>
  );
}
