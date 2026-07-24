/**
 * Real client brand vs blank template demo for marketplace preview.
 * Set NEXT_PUBLIC_DEMO=1 only when intentionally previewing the blank template.
 */
export const isDemo = false;

const demo = {
  logoPrimary: 'Logo',
  logoAccent: '',
  email: 'netfang@fyrirtaeki.is',
  phoneDisplay: '000 0000',
  phoneTel: '#contact',
  address: 'Heimilisfang, Reykjavík',
  instagramHandle: '@instagram',
  instagramUrl: '#',
  bookingUrl: '#contact',
  mapQuery: '',
  showMap: false,
  showInstagram: true,
  kt: '000000-0000',
  vsk: '000000',
  agencyUrl: process.env.NEXT_PUBLIC_AGENCY_URL || 'http://localhost:3020',
  agencyName: 'Leigsíða',
};

const real = {
  logoPrimary: 'KS',
  logoAccent: 'PROTECT',
  email: 'ksprotect@ksprotect.is',
  phoneDisplay: '844 4456',
  phoneTel: 'tel:+3548444456',
  address: 'Skemmuvegi 28 (bleik gata)',
  instagramHandle: '@ks_protect',
  instagramUrl: 'https://www.instagram.com/ks_protect/',
  bookingUrl: 'https://ksprotect.is/booking/',
  mapQuery: 'Skemmuvegur+28,+101+Reykjav%C3%ADk,+Iceland',
  showMap: true,
  showInstagram: true,
  kt: '530718-1310',
  vsk: '132280',
  agencyUrl: '',
  agencyName: '',
};

export const brand = isDemo ? demo : real;
