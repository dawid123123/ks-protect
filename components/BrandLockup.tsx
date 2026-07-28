'use client';

import Link from 'next/link';

type BrandLockupProps = {
  href?: string;
  className?: string;
  /** mark = KS only, partners = WS+LLumar, full = both (legacy). */
  mode?: 'full' | 'mark' | 'partners';
};

export default function BrandLockup({
  href = '/',
  className = '',
  mode = 'full',
}: BrandLockupProps) {
  const mark = (
    <img
      src="/brand/ks-protect-mark.png"
      alt="KS Protect"
      className="brand-lockup-ks"
    />
  );

  const partners = (
    <span className="brand-partners">
      <img
        src="/brand/waxedshine-logo-white.png"
        alt="WaxedShine"
        className="brand-lockup-ws"
      />
      <span className="brand-lockup-divider" aria-hidden="true" />
      <img
        src="/brand/llumar-logo.svg"
        alt="LLumar"
        className="brand-lockup-llumar"
      />
    </span>
  );

  let content = (
    <>
      {mark}
      {partners}
    </>
  );
  if (mode === 'mark') content = mark;
  if (mode === 'partners') content = partners;

  const classes =
    'brand-lockup' +
    (mode === 'partners' ? ' brand-lockup-partners' : '') +
    (mode === 'mark' ? ' brand-lockup-mark' : '') +
    (className ? ' ' + className : '');

  if (mode === 'partners') {
    return <div className={classes}>{content}</div>;
  }

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
