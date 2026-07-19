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
  if (
    href === '/ppf' ||
    href === '/tint' ||
    href === '/netverslun' ||
    href === '/faq' ||
    href === '/um-okkur'
  ) {
    return pathname === href || pathname.startsWith(href + '/')
      ? 'nav-active'
      : '';
  }
  return '';
}

const navLinks = [
  { href: '/#home', key: 'home' as const, match: '/#home' },
  { href: '/#graphene', key: 'graphene' as const, match: '/#graphene' },
  { href: '/ppf', key: 'ppf' as const, match: '/ppf' },
  { href: '/tint', key: 'tint' as const, match: '/tint' },
  { href: '/netverslun', key: 'shop' as const, match: '/netverslun' },
  { href: '/um-okkur', key: 'about' as const, match: '/um-okkur' },
  { href: '/faq', key: 'faq' as const, match: '/faq' },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle('nav-menu-open', menuOpen);
    return () => document.body.classList.remove('nav-menu-open');
  }, [menuOpen]);

  const headerClass =
    'navbar navbar-v2 ' +
    (scrolled ? 'navbarScrolled ' : '') +
    (menuOpen ? 'navbar-menu-open ' : '');

  return (
    <header className={headerClass}>
      <Link href="/" className="logo">
        KS <span>PROTECT</span>
      </Link>

      <nav className="navigation navigation-v2" aria-label="Main">
        <div className="navigation-track">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={navClass(pathname, link.match)}
            >
              {t.nav[link.key]}
            </Link>
          ))}
        </div>
      </nav>

      <button
        type="button"
        className="navToggle"
        aria-expanded={menuOpen}
        aria-controls="nav-mobile-menu"
        aria-label={menuOpen ? 'Loka valmynd' : 'Opna valmynd'}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="navToggle-bar" />
        <span className="navToggle-bar" />
        <span className="navToggle-bar" />
      </button>

      <div
        id="nav-mobile-menu"
        className={'nav-mobile-menu' + (menuOpen ? ' open' : '')}
        aria-hidden={!menuOpen}
      >
        <div
          className="nav-mobile-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
        <div className="nav-mobile-panel">
          <nav className="nav-mobile-links" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navClass(pathname, link.match)}
                onClick={() => setMenuOpen(false)}
              >
                {t.nav[link.key]}
              </Link>
            ))}
          </nav>

          <div className="nav-mobile-footer">
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
                href="https://www.instagram.com/ks_protect/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            </div>
            <LanguageSwitcher />
            <Link
              href="/#contact"
              className="navButton navButton-mobile navButton-v2"
              onClick={() => setMenuOpen(false)}
            >
              {t.nav.getQuote} <span className="navButton-arrow">{'\u2197'}</span>
            </Link>
          </div>
        </div>
      </div>

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
            href="https://www.instagram.com/ks_protect/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <InstagramIcon />
          </a>
        </div>

        <LanguageSwitcher />

        <Link href="/#contact" className="navButton navButton-v2">
          {t.nav.getQuote} <span className="navButton-arrow">{'\u2197'}</span>
        </Link>
      </div>
    </header>
  );
}
