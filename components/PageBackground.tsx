'use client';

/** Lightweight fixed backdrop — no blur orbs / filtered photos (those crushed GPU). */
export default function PageBackground() {
  return <div className="page-bg page-bg-lite" aria-hidden="true" />;
}
