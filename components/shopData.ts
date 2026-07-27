/** Filter id used in shop UI — 'all' or a product category id */
export type ShopCategory = string;

export type ShopCategoryDef = {
  id: string;
  labelIs: string;
  labelEn: string;
};

export type ShopProductTone = 'green' | 'blue' | 'amber' | 'violet' | 'slate';

export type ShopProduct = {
  id: string;
  name: string;
  subtitle: string;
  description?: string;
  /** Primary category (first of categories) — kept for compatibility */
  category: string;
  /** Up to 2 category ids */
  categories?: string[];
  /** Current selling price (kr.) */
  price: number;
  /** Original price before discount — shown struck through when higher than price */
  compareAtPrice?: number;
  size: string;
  tone: ShopProductTone;
  badge?: string;
  image?: string;
  active?: boolean;
};

export const MAX_PRODUCT_CATEGORIES = 2;

export function getProductCategories(product: Pick<ShopProduct, 'category' | 'categories'>) {
  if (Array.isArray(product.categories) && product.categories.length > 0) {
    return product.categories
      .map((id) => String(id || '').trim())
      .filter(Boolean)
      .slice(0, MAX_PRODUCT_CATEGORIES);
  }
  const primary = String(product.category || '').trim();
  return primary ? [primary] : [];
}

export function productHasCategory(
  product: Pick<ShopProduct, 'category' | 'categories'>,
  categoryId: string
) {
  return getProductCategories(product).includes(categoryId);
}

export function getSalePercent(product: Pick<ShopProduct, 'price' | 'compareAtPrice'>) {
  const compare = product.compareAtPrice;
  if (!compare || compare <= product.price || product.price < 0) {
    return 0;
  }
  return Math.round(((compare - product.price) / compare) * 100);
}

export function priceFromDiscount(compareAtPrice: number, percent: number) {
  if (!Number.isFinite(compareAtPrice) || compareAtPrice <= 0) {
    return 0;
  }
  const clamped = Math.min(100, Math.max(0, percent));
  return Math.max(0, Math.round(compareAtPrice * (1 - clamped / 100)));
}

export const shopTones: ShopProductTone[] = [
  'green',
  'blue',
  'amber',
  'violet',
  'slate',
];

export const defaultShopCategories: ShopCategoryDef[] = [
  { id: 'thvottur', labelIs: 'ÞVOTTUR', labelEn: 'WASH' },
  { id: 'innretting', labelIs: 'INNRÉTTING', labelEn: 'INTERIOR' },
  { id: 'bon', labelIs: 'BÓN', labelEn: 'COATING' },
  { id: 'mossun', labelIs: 'MÖSSUN', labelEn: 'POLISH' },
  { id: 'felgur', labelIs: 'FELGUR OG DEKK', labelEn: 'WHEELS & TIRES' },
  { id: 'hlidar', labelIs: 'HLÍÐARVÖRUR', labelEn: 'ACCESSORIES' },
  { id: 'ppf', labelIs: 'PPF FILMUR', labelEn: 'PPF FILM' },
];

/** @deprecated use defaultShopCategories */
export const shopProductCategories = defaultShopCategories.map((c) => c.id);

export const shopCategories: {
  id: ShopCategory;
  label: string;
}[] = [
  { id: 'all', label: 'ALLT' },
  ...defaultShopCategories.map((c) => ({ id: c.id, label: c.labelIs })),
];

export function cloneDefaultCategories(): ShopCategoryDef[] {
  return defaultShopCategories.map((item) => ({ ...item }));
}

export function categoryLabel(
  category: ShopCategoryDef | undefined,
  lang: 'is' | 'en',
  fallback = ''
) {
  if (!category) {
    return fallback;
  }
  return lang === 'en' ? category.labelEn : category.labelIs;
}

export function createCategoryId(label: string) {
  const base = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  return base || 'flokkur-' + Date.now().toString(36);
}

export function mergeCatalogCategories(
  categories: ShopCategoryDef[] | undefined,
  products: ShopProduct[]
): ShopCategoryDef[] {
  const base =
    Array.isArray(categories) && categories.length > 0
      ? categories.map((item) => ({
          id: String(item.id || '').trim(),
          labelIs: String(item.labelIs || item.id || '').trim().toUpperCase(),
          labelEn: String(item.labelEn || item.labelIs || item.id || '')
            .trim()
            .toUpperCase(),
        }))
      : cloneDefaultCategories();

  const byId = new Map<string, ShopCategoryDef>();
  base.forEach((item) => {
    if (item.id) {
      byId.set(item.id, item);
    }
  });

  products.forEach((product) => {
    getProductCategories(product).forEach((id) => {
      if (id && !byId.has(id)) {
        byId.set(id, {
          id,
          labelIs: id.toUpperCase(),
          labelEn: id.toUpperCase(),
        });
      }
    });
  });

  return Array.from(byId.values());
}

export const shopProducts: ShopProduct[] = [
  {
    id: "wheel-tire-non-acid-cleaner",
    name: "WHEEL + TIRE — Sírulaus felguhreinsir",
    subtitle: "Sírulaus felgu- og dekkjahreinsir sem brýtur niður bremsuryk og óhreinindi.",
    description: "Sírulaus felgu- og dekkjahreinsir sem brýtur niður bremsuryk og óhreinindi.",
    category: "felgur",
    price: 2790,
    size: "1 stk",
    tone: "green",
    image: "/shop/wheel-tire-non-acid-cleaner.png",
    active: true,
  },
  {
    id: "final-wax-liquid-wax",
    name: "FINAL WAX — Fljótandi bón",
    subtitle: "Fljótandi bón sem gefur fallega vatnsfælu og gljáa á einfaldan hátt.",
    description: "Fljótandi bón sem gefur fallega vatnsfælu og gljáa á einfaldan hátt.",
    category: "bon",
    price: 3390,
    size: "1 stk",
    tone: "blue",
    image: "/shop/final-wax-liquid-wax.png",
    active: true,
  },
  {
    id: "silica-soap-ceramic-wash-473-ml",
    name: "SILICA SOAP — Fyrir húðaða bíla",
    subtitle: "pH-hlutlaus sápa fyrir húðaða bíla sem endurheimtir vatnsfælni.",
    description: "pH-hlutlaus sápa fyrir húðaða bíla sem endurheimtir vatnsfælni.",
    category: "thvottur",
    price: 2990,
    size: "473 ml",
    tone: "amber",
    image: "/shop/silica-soap-ceramic-wash-473-ml.png",
    active: true,
  },
  {
    id: "citrus-foaming-pre-wash-473-ml",
    name: "CITRUS — Forþvottur",
    subtitle: "Sítrus forþvottur sem losar gróf óhreinindi áður en þú þværð.",
    description: "Sítrus forþvottur sem losar gróf óhreinindi áður en þú þværð.",
    category: "thvottur",
    price: 2490,
    size: "473 ml",
    tone: "violet",
    image: "/shop/citrus-foaming-pre-wash-473-ml.png",
    active: true,
  },
  {
    id: "fabric-guard-sealant-473-ml",
    name: "FABRIC GUARD — Verndarúði",
    subtitle: "Verndarúði fyrir efni sem hrindir frá sér vatni og óhreinindum.",
    description: "Verndarúði fyrir efni sem hrindir frá sér vatni og óhreinindum.",
    category: "innretting",
    price: 4690,
    size: "473 ml",
    tone: "slate",
    image: "/shop/fabric-guard-sealant-473-ml.png",
    active: true,
  },
  {
    id: "envo-qd-detail-spray-473-ml",
    name: "ENVO QD+ — Detail spray",
    subtitle: "Fljótlegur detail-úði sem gefur djúpan gljáa og mjúka viðkomu.",
    description: "Fljótlegur detail-úði sem gefur djúpan gljáa og mjúka viðkomu.",
    category: "bon",
    price: 2190,
    size: "473 ml",
    tone: "green",
    image: "/shop/envo-qd-detail-spray-473-ml.png",
    active: true,
  },
  {
    id: "multi-surface-cleaner-and-sanitizer-473ml",
    name: "Multi Surface — Sótthreinsandi hreinsir",
    subtitle: "Fjölnota hreinsir með sótthreinsandi eiginleikum fyrir innréttingu.",
    description: "Fjölnota hreinsir með sótthreinsandi eiginleikum fyrir innréttingu.",
    category: "innretting",
    price: 1990,
    size: "473 ml",
    tone: "blue",
    image: "/shop/multi-surface-cleaner-and-sanitizer-473ml.jpg",
    active: true,
  },
  {
    id: "wax-applicators",
    name: "Bónpúðar — Örtrefja",
    subtitle: "Dúnmjúkir örtrefjapúðar til að bera á bón og sealant.",
    description: "Dúnmjúkir örtrefjapúðar til að bera á bón og sealant.",
    category: "bon",
    price: 590,
    size: "1 stk",
    tone: "amber",
    image: "/shop/wax-applicators.jpg",
    active: true,
    badge: "UPPSELT",
  },
  {
    id: "carnauba-wax-hand-made-75-200g",
    name: "CARNAUBA WAX — Handgert 75%",
    subtitle: "Handgert carnauba-vax sem gefur hlýjan gljáa og langtíma vörn.",
    description: "Handgert carnauba-vax sem gefur hlýjan gljáa og langtíma vörn.",
    category: "bon",
    price: 9990,
    size: "200 g",
    tone: "violet",
    image: "/shop/carnauba-wax-hand-made-75-200g.jpg",
    active: true,
  },
  {
    id: "umhirdusett",
    name: "Startpakki — Þvottur eftir húðun",
    subtitle: "Heill startpakki til þvottar og viðhalds eftir húðun.",
    description: "Heill startpakki til þvottar og viðhalds eftir húðun.",
    category: "thvottur",
    price: 17990,
    size: "1 stk",
    tone: "slate",
    image: "/shop/umhirdusett.jpg",
    active: true,
  },
  {
    id: "hydrosorber-xl-drying-towel",
    name: "Hydrosorber XL — Þurrkhandklæði",
    subtitle: "Mjúkt og rakadrægt örtrefjahandklæði til þurkunar, 50×80 cm.",
    description: "Mjúkt og rakadrægt örtrefjahandklæði til þurkunar, 50×80 cm.",
    category: "hlidar",
    price: 4890,
    size: "80 cm",
    tone: "green",
    image: "/shop/hydrosorber-xl-drying-towel.jpg",
    active: true,
  },
  {
    id: "double-sided-wash-mitt",
    name: "Þvottahanski — Tvöfaldur örtrefja",
    subtitle: "Tvöfaldur örtrefjahanski fyrir öruggan og þægilegan þvott.",
    description: "Tvöfaldur örtrefjahanski fyrir öruggan og þægilegan þvott.",
    category: "hlidar",
    price: 1450,
    size: "1 stk",
    tone: "blue",
    image: "/shop/double-sided-wash-mitt.jpg",
    active: true,
  },
  {
    id: "prime-polish",
    name: "PRIME POLISH — Massi",
    subtitle: "Auðveldur massi sem undirbýr lakk og bætir vatnsfælu.",
    description: "Auðveldur massi sem undirbýr lakk og bætir vatnsfælu.",
    category: "mossun",
    price: 4990,
    size: "473 ml",
    tone: "amber",
    image: "/shop/prime-polish.png",
    active: true,
  },
  {
    id: "one-hybrid",
    name: "ONE HYBRID — Massi",
    subtitle: "Hybrid massi sem bæði leiðréttir og fínpússar lakk.",
    description: "Hybrid massi sem bæði leiðréttir og fínpússar lakk.",
    category: "mossun",
    price: 4590,
    size: "473 ml",
    tone: "violet",
    image: "/shop/one-hybrid.png",
    active: true,
  },
  {
    id: "leather-nourish",
    name: "LEATHER — Leðurnæring",
    subtitle: "Leðurnæring sem endurheimtir olíur og verndar gegn þurrki.",
    description: "Leðurnæring sem endurheimtir olíur og verndar gegn þurrki.",
    category: "innretting",
    price: 3190,
    size: "473 ml",
    tone: "slate",
    image: "/shop/leather-nourish.jpg",
    active: true,
  },
  {
    id: "aqua-bead",
    name: "AQUA BEAD — Viðhaldsúði",
    subtitle: "Viðhaldsúði sem má nota á blautan eða þurran bíl.",
    description: "Viðhaldsúði sem má nota á blautan eða þurran bíl.",
    category: "bon",
    price: 3590,
    size: "473 ml",
    tone: "green",
    image: "/shop/aqua-bead.png",
    active: true,
  },
  {
    id: "tire-shine",
    name: "TIRE SHINE — Dekkjagljái",
    subtitle: "Olíulaus dekkjagljái sem skilur eftir hreina, fallega áferð.",
    description: "Olíulaus dekkjagljái sem skilur eftir hreina, fallega áferð.",
    category: "felgur",
    price: 2990,
    size: "473 ml",
    tone: "blue",
    image: "/shop/tire-shine.png",
    active: true,
  },
  {
    id: "apcd-cleaner",
    name: "APC+D — Fjölhreinsir",
    subtitle: "Fjölhreinsir fyrir innréttingu, plast, felgur og fleira.",
    description: "Fjölhreinsir fyrir innréttingu, plast, felgur og fleira.",
    category: "innretting",
    price: 2590,
    size: "473 ml",
    tone: "amber",
    image: "/shop/apcd-cleaner.png",
    active: true,
  },
  {
    id: "hybrid-sealant",
    name: "HYBRID SEALANT — Langtíma bón",
    subtitle: "Langtíma bón með carnauba sem gefur spegilglans og vörn.",
    description: "Langtíma bón með carnauba sem gefur spegilglans og vörn.",
    category: "bon",
    price: 4290,
    size: "473 ml",
    tone: "violet",
    image: "/shop/hybrid-sealant.png",
    active: true,
  },
  {
    id: "glass-cleaner",
    name: "GLASS CLEANER — Glerhreinsir",
    subtitle: "Ammóníaklaus glerhreinsir sem skilur eftir ráklausa áferð.",
    description: "Ammóníaklaus glerhreinsir sem skilur eftir ráklausa áferð.",
    category: "innretting",
    price: 1690,
    size: "473 ml",
    tone: "slate",
    image: "/shop/glass-cleaner.png",
    active: true,
  },
  {
    id: "cut-compound",
    name: "CUT COMPOUND — Massi",
    subtitle: "Kraftmikill massi til að jafna lakk og fjarlægja rispur.",
    description: "Kraftmikill massi til að jafna lakk og fjarlægja rispur.",
    category: "mossun",
    price: 4590,
    size: "473 ml",
    tone: "green",
    image: "/shop/cut-compound.png",
    active: true,
  },
  {
    id: "iron-off",
    name: "IRON OFF — Járnagna hreinsir",
    subtitle: "Járnagna hreinsir sem leysir upp bremsuryk af felgum og lakki.",
    description: "Járnagna hreinsir sem leysir upp bremsuryk af felgum og lakki.",
    category: "thvottur",
    price: 2890,
    size: "473 ml",
    tone: "blue",
    image: "/shop/iron-off.png",
    active: true,
  },
  {
    id: "snow-foam",
    name: "WASH SNOW FOAM — Froðusápa",
    subtitle: "pH-hlutlaus froðusápa fyrir öruggan þvott á húðuðum bílum.",
    description: "pH-hlutlaus froðusápa fyrir öruggan þvott á húðuðum bílum.",
    category: "thvottur",
    price: 2390,
    size: "473 ml",
    tone: "amber",
    image: "/shop/snow-foam.png",
    active: true,
  }
];

export function formatPrice(value: number) {
  return value.toLocaleString('is-IS') + ' kr.';
}
