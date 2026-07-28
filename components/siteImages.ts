import { instagramPosts } from '../lib/instagramPosts';

const pexels = (id: number) =>
  'https://images.pexels.com/photos/' +
  id +
  '/pexels-photo-' +
  id +
  '.jpeg?auto=compress&cs=tinysrgb&w=1800';

/** Hand-picked Mercedes-AMG GT shots only. No unverified IDs. */
export const verifiedCarPhotos = [
  pexels(18354100),
  pexels(20186657),
  pexels(28652382),
  pexels(16124122),
  pexels(16124113),
  pexels(16124149),
];

export const heroImage = verifiedCarPhotos[0];

export function photoThumb(url: string, width = 420) {
  return url.replace('w=1800', 'w=' + width);
}

/** Compact detail shots for the about page (not the main hero). */
export const aboutPagePhotos = [
  photoThumb(verifiedCarPhotos[2], 520),
  photoThumb(verifiedCarPhotos[1], 420),
  photoThumb(verifiedCarPhotos[4], 420),
];

export const centerBackgroundPhoto = photoThumb(verifiedCarPhotos[0], 1600);

const byId = Object.fromEntries(instagramPosts.map((post) => [post.id, post]));

/** Front / 3/4 shots from @ks_protect — real workshop jobs. */
const galleryShotIds = [
  'DbHCFtvjjlL',
  'DbHCRYQjk-g',
  'DaduFk1DnzP',
  'Dage9B_jth_',
  'DYp4CDhjjFE',
  'DVuBaa1DqlZ',
] as const;

export const galleryProjects = galleryShotIds
  .map((id) => byId[id])
  .filter(Boolean)
  .map((post) => ({
    model: post.id,
    type: 'KS PROTECT',
    image: post.src,
    href: post.href,
  }));
