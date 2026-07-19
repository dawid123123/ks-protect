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

export const galleryProjects = [
  { model: 'AMG GT R', type: 'GREEN HELL', image: verifiedCarPhotos[0] },
  { model: 'AMG GT', type: 'NIGHT DETAIL', image: verifiedCarPhotos[1] },
  { model: 'AMG GT R', type: 'FRONT DETAIL', image: verifiedCarPhotos[2] },
  { model: 'AMG GT', type: 'GRAND TOURER', image: verifiedCarPhotos[3] },
  { model: 'AMG GT', type: 'PERFORMANCE', image: verifiedCarPhotos[4] },
  { model: 'AMG GT', type: 'COUP\u00c9', image: verifiedCarPhotos[5] },
];
