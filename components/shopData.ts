export type ShopCategory =
  | 'all'
  | 'thvottur'
  | 'innretting'
  | 'bon'
  | 'mossun'
  | 'felgur'
  | 'hlidar'
  | 'ppf';

export type ShopProductTone = 'green' | 'blue' | 'amber' | 'violet' | 'slate';

export type ShopProduct = {
  id: string;
  name: string;
  subtitle: string;
  description?: string;
  category: Exclude<ShopCategory, 'all'>;
  price: number;
  size: string;
  tone: ShopProductTone;
  badge?: string;
  image?: string;
  active?: boolean;
};

export const shopTones: ShopProductTone[] = [
  'green',
  'blue',
  'amber',
  'violet',
  'slate',
];

export const shopProductCategories: Exclude<ShopCategory, 'all'>[] = [
  'thvottur',
  'innretting',
  'bon',
  'mossun',
  'felgur',
  'hlidar',
  'ppf',
];

export const shopCategories: {
  id: ShopCategory;
  label: string;
}[] = [
  { id: 'all', label: 'ALL' },
  { id: 'thvottur', label: 'WASH' },
  { id: 'innretting', label: 'INTERIOR' },
  { id: 'bon', label: 'COATING' },
  { id: 'mossun', label: 'POLISH' },
  { id: 'felgur', label: 'WHEELS & TIRES' },
  { id: 'hlidar', label: 'ACCESSORIES' },
  { id: 'ppf', label: 'PPF FILM' },
];

export const shopProducts: ShopProduct[] = [
  {
    id: 'foam-wash',
    name: 'Ultra Foam Shampoo',
    subtitle: 'Dual-action foam wash for safe cleaning',
    category: 'thvottur',
    price: 3490,
    size: '500 ml',
    tone: 'green',
    badge: 'POPULAR',
  },
  {
    id: 'ph-wash',
    name: 'pH Neutral Wash',
    subtitle: 'Gentle wash safe for PPF and paint',
    category: 'thvottur',
    price: 4990,
    size: '1 L',
    tone: 'blue',
  },
  {
    id: 'apc-d',
    name: 'APC+D All-Purpose Cleaner',
    subtitle: 'Multi-surface cleaner for interior and exterior',
    category: 'innretting',
    price: 2590,
    size: '473 ml',
    tone: 'violet',
    badge: 'TOP',
  },
  {
    id: 'interior',
    name: 'Interior Cleaner',
    subtitle: 'Cleaner for seats, trim, and plastics',
    category: 'innretting',
    price: 2890,
    size: '500 ml',
    tone: 'slate',
  },
  {
    id: 'aqua-bead',
    name: 'Aqua Bead Spray',
    subtitle: 'Spray sealant for maintenance and gloss',
    category: 'bon',
    price: 2590,
    size: '473 ml',
    tone: 'blue',
  },
  {
    id: 'ceramic-boost',
    name: 'Ceramic Boost',
    subtitle: 'Boosts protection and adds deep gloss',
    category: 'bon',
    price: 5990,
    size: '250 ml',
    tone: 'green',
  },
  {
    id: 'cut-compound',
    name: 'Cutting Compound',
    subtitle: 'For polishing and defect removal',
    category: 'mossun',
    price: 4490,
    size: '250 ml',
    tone: 'amber',
  },
  {
    id: 'finish-polish',
    name: 'Finishing Polish',
    subtitle: 'Final step for deep, mirror-like gloss',
    category: 'mossun',
    price: 4490,
    size: '250 ml',
    tone: 'amber',
  },
  {
    id: 'wheel-clean',
    name: 'Wheel Cleaner',
    subtitle: 'Dedicated formula for wheels and brakes',
    category: 'felgur',
    price: 3290,
    size: '500 ml',
    tone: 'slate',
  },
  {
    id: 'tire-dress',
    name: 'Tire Dressing',
    subtitle: 'Clean, matte tire finish',
    category: 'felgur',
    price: 2990,
    size: '500 ml',
    tone: 'violet',
  },
  {
    id: 'applicator',
    name: 'Microfiber Applicators',
    subtitle: '3 pcs for coating, sealant, and maintenance',
    category: 'hlidar',
    price: 1990,
    size: '3 pcs',
    tone: 'amber',
  },
  {
    id: 'microfiber',
    name: 'Microfiber Bundle',
    subtitle: '5 microfiber towels for wash and dry',
    category: 'hlidar',
    price: 3490,
    size: '5 pcs',
    tone: 'green',
  },
  {
    id: 'ppf-spray',
    name: 'PPF Maintenance Spray',
    subtitle: 'Maintenance and gloss for PPF and paint',
    category: 'ppf',
    price: 4990,
    size: '500 ml',
    tone: 'blue',
  },
];

export function formatPrice(value: number) {
  return value.toLocaleString('en-US') + ' kr.';
}
