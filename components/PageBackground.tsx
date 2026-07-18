'use client';

import { usePathname } from 'next/navigation';
import { centerBackgroundPhoto } from './siteImages';

export default function PageBackground() {
  const pathname = usePathname();
  const soft =
    pathname === '/ppf' ||
    pathname === '/tint' ||
    pathname === '/netverslun' ||
    pathname.startsWith('/ppf/');

  return (
    <div
      className={'page-bg' + (soft ? ' page-bg-soft' : ' page-bg-rich')}
      aria-hidden="true"
    >
      <div
        className="page-bg-center"
        style={{ backgroundImage: 'url(' + centerBackgroundPhoto + ')' }}
      />
      <div className="page-bg-noise" />
      <div className="page-bg-vignette" />
      <div className="page-bg-glow page-bg-glow-center" />
    </div>
  );
}
