import type { Metadata } from 'next';
import { brand } from './brand';
import { heroImage } from '../components/siteImages';

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return 'https://' + process.env.VERCEL_URL.replace(/\/$/, '');
  }
  return 'https://ksprotect.is';
}

export const siteUrl = getSiteUrl();
export const brandName = 'KS Protect';

export const seoKeywords = [
  'KS Protect',
  'grafín',
  'grafín húðun',
  'grafínhúð',
  'keramik húðun',
  'ceramic coating',
  'graphene coating',
  'PPF',
  'lakkvarnarfilma',
  'paint protection film',
  'LLumar',
  'WaxedShine',
  'gluggatint',
  'rúðufilma',
  'window tint',
  'bón',
  'detailing',
  'bílavörn',
  'Kópavogur',
  'Reykjavík',
  'Ísland',
];

const defaultDescription =
  'KS Protect í Kópavogi — grafínhúð, keramik húðun, LLumar PPF lakkvarnarfilmur og gluggatint. Fáðu ókeypis tilboð.';

type PageSeoInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
};

export function buildPageMetadata({
  title,
  description,
  path = '/',
  keywords = seoKeywords,
}: PageSeoInput): Metadata {
  const url = new URL(path, siteUrl).toString();
  const fullTitle = title.includes('KS Protect')
    ? title
    : `${title} · KS Protect`;

  return {
    title: fullTitle,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'is_IS',
      alternateLocale: ['en_US'],
      url,
      siteName: brandName,
      title: fullTitle,
      description,
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: 'KS Protect — PPF, tint, grafín og keramik húðun',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [heroImage],
    },
  };
}

export const pageSeo = {
  home: buildPageMetadata({
    title: 'KS Protect · Grafín, Keramik, PPF & Tint',
    description: defaultDescription,
    path: '/',
  }),
  ppf: buildPageMetadata({
    title: 'PPF lakkvarnarfilmur · LLumar',
    description:
      'Stilltu LLumar PPF lakkvarnarfilmu á bílinn þinn. Vernd gegn steinum, rispum og salti — KS Protect Kópavogur.',
    path: '/ppf',
    keywords: [
      ...seoKeywords,
      'PPF stillingar',
      'PPF verð',
      'lakkvarnarfilma verð',
    ],
  }),
  tint: buildPageMetadata({
    title: 'Gluggatint & rúðufilmur',
    description:
      'Veldu gluggatint / VLT á rúður og PPF á framljós. Fagleg uppsetning hjá KS Protect í Kópavogi.',
    path: '/tint',
    keywords: [
      ...seoKeywords,
      'gluggatint verð',
      'VLT',
      'rúðufilmur Reykjavík',
    ],
  }),
  shop: buildPageMetadata({
    title: 'Netverslun',
    description:
      'Kauptu bón, þvott, wax og viðhaldsvörur frá WaxedShine og fleira í KS Protect netverslun.',
    path: '/netverslun',
    keywords: [
      ...seoKeywords,
      'netverslun',
      'bílavörur',
      'WaxedShine vörur',
      'bón Ísland',
    ],
  }),
  about: buildPageMetadata({
    title: 'Um okkur · Grafín vs keramik',
    description:
      'Lærðu muninn á grafínhúð og keramik húðun. KS Protect — fagleg bílavörn í Kópavogi síðan árum saman.',
    path: '/um-okkur',
    keywords: [
      ...seoKeywords,
      'grafín vs keramik',
      'graphene vs ceramic',
      'um KS Protect',
    ],
  }),
  faq: buildPageMetadata({
    title: 'Algengar spurningar',
    description:
      'Svör um PPF, grafín, keramik húðun, ábyrgð, tint og bókanir hjá KS Protect.',
    path: '/faq',
  }),
  terms: buildPageMetadata({
    title: 'Skilmálar',
    description: 'Skilmálar og persónuvernd KS Protect.',
    path: '/skilmalar',
  }),
};

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutomotiveBusiness',
    name: brandName,
    url: siteUrl,
    image: heroImage,
    email: brand.email,
    telephone: '+3548444456',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Skemmuvegur 28',
      addressLocality: 'Kópavogur',
      postalCode: '200',
      addressCountry: 'IS',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 64.1086,
      longitude: -21.888,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '08:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Friday',
        opens: '08:00',
        closes: '16:00',
      },
    ],
    sameAs: [brand.facebookUrl, brand.instagramUrl].filter(Boolean),
    priceRange: '$$',
    areaServed: ['Kópavogur', 'Reykjavík', 'Höfuðborgarsvæðið'],
    knowsAbout: [
      'Graphene coating',
      'Ceramic coating',
      'Paint protection film',
      'Window tint',
      'LLumar PPF',
      'WaxedShine',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'KS Protect services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Grafínhúð / graphene coating',
            description:
              'WaxedShine graphene coating with deep gloss and up to 5-year warranty.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Keramik húðun / ceramic coating',
            description: 'Ceramic paint protection and maintenance coatings.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'PPF lakkvarnarfilma',
            description: 'LLumar paint protection film installation.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Gluggatint',
            description: 'Professional automotive window tint.',
          },
        },
      ],
    },
  };
}
