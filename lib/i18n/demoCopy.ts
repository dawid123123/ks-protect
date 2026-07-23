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

  return {
    ...t,
    metadata: {
      ...t.metadata,
      title: 'Sniðmát · PPF, Tint & Grafín',
      description:
        'Sýnishorn af sniðmáti — merki, litir og texti verða sérsniðin að þínu fyrirtæki.',
      applicationName: 'Sniðmát',
    },
    nav: {
      ...t.nav,
      socialLabel: 'Samfélagsmiðlar',
    },
    footer: {
      ...t.footer,
      tagline: 'Vernd, glöggun og þjónusta — merkið þitt kemur hér.',
      hoursNote: 'Bókaðu tíma í gegnum vefsíðu eða hafðu samband.',
      copyright: '© Sniðmát — sýnishorn. ',
      instagramFollow: 'Fylgja @instagram',
      instagramPhotoAlt: 'Sýnishorn Instagram mynd',
      company: {
        ...t.footer.company,
        email: 'netfang@fyrirtaeki.is',
        phone: '000-0000',
        address: 'Heimilisfang, Reykjavík',
        kt: '000000-0000',
        vsk: '000000',
      },
    },
    faq: {
      ...t.faq,
      lead: scrub(t.faq.lead),
      items: Object.fromEntries(
        Object.entries(t.faq.items).map(([key, item]) => [
          key,
          { q: scrub(item.q), a: scrub(item.a) },
        ])
      ) as typeof t.faq.items,
    },
    about: {
      ...t.about,
      introKicker: 'SNIÐMÁT · GRAFÍN LAKKVÖRN',
      introText: scrub(t.about.introText),
      imageAlt: 'Sýnishorn — grafín lakkvörn',
      ceramic: {
        ...t.about.ceramic,
        note: scrub(t.about.ceramic.note),
      },
    },
    hero: {
      ...t.hero,
      kicker: 'SNIÐMÁT · DEMO',
      description:
        'PPF lakkvarnarfilmur og grafínlakkvörn — fagleg uppsetning og vernd. Texti og merki verða þín.',
      imageAlt: 'Sýnishorn af bílaþjónustusíðu',
    },
    contact: {
      ...t.contact,
      phonePlaceholder: '000 0000',
      locationValue: 'Heimilisfang, Reykjavík',
      lead: 'Fylltu út formið — í leigðu útgáfunni opnast póstur til þíns fyrirtækis.',
      formNote: 'Í sýnishorninu opnast póstur á placeholder netfang.',
    },
    shop: {
      ...t.shop,
      eyebrow: 'SNIÐMÁT · NETVERSLUN',
      lead: scrub(t.shop.lead),
    },
    notFound: {
      ...t.notFound,
      kicker: 'SNIÐMÁT · 404',
      description: scrub(t.notFound.description),
    },
  };
}
