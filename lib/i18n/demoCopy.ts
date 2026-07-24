import type { Translations } from './translations';

/** Overlay real client strings with blank template placeholders. */
export function applyDemoCopy(t: Translations): Translations {
  const scrub = (s: string) =>
    s
      .replace(/KS Protect/gi, 'fyrirtækið')
      .replace(/KS PROTECT/g, 'SNIÐMÁT')
      .replace(/ksprotect\.is\/booking\//gi, 'vefsíðunni')
      .replace(/ksprotect\.is/gi, 'vefsíðunni')
      .replace(/844[\s-]?4456/g, '000 0000')
      .replace(/@ks_protect/gi, '@instagram')
      .replace(/ksprotect@ksprotect\.is/gi, 'netfang@fyrirtaeki.is');

  const deepScrub = (value: unknown): unknown => {
    if (typeof value === 'string') return scrub(value);
    if (Array.isArray(value)) return value.map(deepScrub);
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([k, v]) => [
          k,
          deepScrub(v),
        ])
      );
    }
    return value;
  };

  const scrubbed = deepScrub(t) as Translations;

  return {
    ...scrubbed,
    metadata: {
      ...scrubbed.metadata,
      title: 'Sniðmát · PPF, Tint & Grafín',
      description:
        'Sýnishorn af sniðmáti — merki, litir og texti verða sérsniðin að þínu fyrirtæki.',
      applicationName: 'Sniðmát',
    },
    nav: {
      ...scrubbed.nav,
      socialLabel: 'Samfélagsmiðlar',
    },
    footer: {
      ...scrubbed.footer,
      tagline: 'Vernd, glöggun og þjónusta — merkið þitt kemur hér.',
      hoursNote: 'Bókaðu tíma í gegnum vefsíðu eða hafðu samband.',
      copyright: '© Sniðmát — sýnishorn. ',
      instagramFollow: 'Fylgja @instagram',
      instagramPhotoAlt: 'Sýnishorn Instagram mynd',
      company: {
        ...scrubbed.footer.company,
        email: 'netfang@fyrirtaeki.is',
        phone: '000-0000',
        address: 'Heimilisfang, Reykjavík',
        kt: '000000-0000',
        vsk: '000000',
      },
    },
    about: {
      ...scrubbed.about,
      introKicker: 'SNIÐMÁT · GRAFÍN LAKKVÖRN',
      imageAlt: 'Sýnishorn — grafín lakkvörn',
    },
    hero: {
      ...scrubbed.hero,
      kicker: 'SNIÐMÁT · DEMO',
      description:
        'PPF lakkvarnarfilmur og grafínlakkvörn — fagleg uppsetning og vernd. Texti og merki verða þín.',
      imageAlt: 'Sýnishorn af bílaþjónustusíðu',
    },
    gallery: {
      ...scrubbed.gallery,
      imageAlt: 'Sýnishorn myndasafn',
    },
    contact: {
      ...scrubbed.contact,
      phonePlaceholder: '000 0000',
      locationValue: 'Heimilisfang, Reykjavík',
      lead: 'Fylltu út formið — í leigðu útgáfunni opnast póstur til þíns fyrirtækis.',
      formNote: 'Í sýnishorninu opnast póstur á placeholder netfang.',
    },
    shop: {
      ...scrubbed.shop,
      eyebrow: 'SNIÐMÁT · NETVERSLUN',
    },
    notFound: {
      ...scrubbed.notFound,
      kicker: 'SNIÐMÁT · 404',
    },
  };
}
