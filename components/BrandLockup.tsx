'use client';

import Link from 'next/link';

type BrandLockupProps = {
  href?: string;
  className?: string;
};

export default function BrandLockup({
  href = '/',
  className = '',
}: BrandLockupProps) {
  const content = (
    <>
      <img
        src="/brand/ks-protect-logo.png"
        alt="KS Protect"
        className="brand-lockup-ks"
      />
      <span className="brand-lockup-divider" aria-hidden="true" />
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
    </>
  );

  if (href) {
    return (
      <Link href={href} className={'brand-lockup ' + className}>
        {content}
      </Link>
    );
  }

  return <div className={'brand-lockup ' + className}>{content}</div>;
}
