'use client';

import Link from 'next/link';
import { brand } from '../lib/brand';

type BrandLockupProps = {
  href?: string;
  className?: string;
};

/** Main site mark — text only, matches the dark acid theme. */
export default function BrandLockup({
  href = '/',
  className = '',
}: BrandLockupProps) {
  const content = (
    <>
      {brand.logoPrimary}
      {brand.logoAccent ? (
        <>
          {' '}
          <span>{brand.logoAccent}</span>
        </>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={'logo' + (className ? ' ' + className : '')}>
        {content}
      </Link>
    );
  }

  return (
    <strong className={'logo' + (className ? ' ' + className : '')}>{content}</strong>
  );
}

export function PartnerMarks({ className = '' }: { className?: string }) {
  return (
    <div className={'partner-marks' + (className ? ' ' + className : '')}>
      <img
        src="/brand/waxedshine-logo-white.png"
        alt="WaxedShine"
        className="partner-mark partner-mark-ws"
      />
      <img
        src="/brand/llumar-logo.svg"
        alt="LLumar"
        className="partner-mark partner-mark-llumar"
      />
    </div>
  );
}
