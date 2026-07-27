/**
 * KS Protect live brand.
 * Set NEXT_PUBLIC_DEMO=1 only when intentionally previewing the blank template.
 */
export const isDemo =
  process.env.NEXT_PUBLIC_DEMO === '1' ||
  process.env.NEXT_PUBLIC_DEMO === 'true';

const demo = {
  logoPrimary: 'Logo',
  logoAccent: '',
  email: 'netfang@fyrirtaeki.is',
  phoneDisplay: '000 0000',
  phoneTel: '#contact',
  address: 'Heimilisfang, Reykjavík',
  facebookUrl: '#',
  instagramHandle: '@instagram',
  instagramUrl: '#',
  bookingUrl: '#contact',
  mapQuery: '',
  showMap: false,
  showInstagram: true,
  kt: '000000-0000',
  vsk: '000000',
  agencyUrl: process.env.NEXT_PUBLIC_AGENCY_URL || '',
  agencyName: 'Leigsíða',
};

const real = {
  logoPrimary: 'KS',
  logoAccent: 'PROTECT',
  email: 'ksprotect@ksprotect.is',
  phoneDisplay: '844 4456',
  phoneTel: 'tel:+3548444456',
  address: 'Skemmuvegi 28 · bleik gata, 200 Kópavogur',
  facebookUrl: 'https://www.facebook.com/ksprotect/',
  instagramHandle: '@ks_protect',
  instagramUrl: 'https://www.instagram.com/ks_protect/',
  bookingUrl: 'https://ksprotect.is/booking/',
  mapQuery: 'Skemmuvegur+28,+200+K%C3%B3pavogur,+Iceland',
  showMap: true,
  showInstagram: true,
  kt: '530718-1310',
  vsk: '132280',
  agencyUrl: '',
  agencyName: '',
};

export const brand = isDemo ? demo : real;
