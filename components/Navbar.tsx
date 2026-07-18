'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../lib/i18n/context';

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.6 1.7-1.6H16V4.8c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.3-3.8 4V11H7.5v3H10v7h3.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7.8 3h8.4A4.8 4.8 0 0 1 21 7.8v8.4A4.8 4.8 0 0 1 16.2 21H7.8A4.8 4.8 0 0 1 3 16.2V7.8A4.8 4.8 0 0 1 7.8 3Zm0 1.8A3 3 0 0 0 4.8 7.8v8.4a3 3 0 0 0 3 3h8.4a3 3 0 0 0 3-3V7.8a3 3 0 0 0-3-3H7.8Zm8.9 1.3a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function navClass(pathname: string, href: string) {
  if (href === '/ppf' || href === '/tint' || href === '/netverslun') {
    return pathname === href || pathname.startsWith(href + '/')
      ? 'nav-active'
      : '';
  }
  return '';
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const t = useTranslation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={'navbar navbar-v2 ' + (scrolled ? 'navbarScrolled' : '')}>
      <Link href="/" className="logo">
        KS <span>PROTECT</span>
      </Link>

      <nav className="navigation">
        <Link href="/#home" className={navClass(pathname, '/#home')}>
          {t.nav.home}
        </Link>
        <Link href="/#graphene" className={navClass(pathname, '/#graphene')}>
          {t.nav.graphene}
        </Link>
        <Link href="/ppf" className={navClass(pathname, '/ppf')}>
          {t.nav.ppf}
        </Link>
        <Link href="/tint" className={navClass(pathname, '/tint')}>
          {t.nav.tint}
        </Link>
        <a
          href="/netverslun"
          target="_blank"
          rel="noopener noreferrer"
          className={navClass(pathname, '/netverslun')}
        >
          {t.nav.shop}
        </a>
        <Link href="/#gallery" className={navClass(pathname, '/#gallery')}>
          {t.nav.gallery}
        </Link>
        <Link href="/#contact">{t.nav.contact}</Link>
      </nav>

      <div className="navRight">
        <div className="navSocials" aria-label={t.nav.socialLabel}>
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
          >
            <FacebookIcon />
          </a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <InstagramIcon />
          </a>
        </div>

        <LanguageSwitcher />

        <Link href="/#contact" className="navButton">
          {t.nav.getQuote}
        </Link>
      </div>
    </header>
  );
}
