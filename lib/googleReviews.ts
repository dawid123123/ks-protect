export type GoogleReview = {
  id: string;
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
  source: 'Google';
};

/** Public Google Business profile for KS Protect (Maps CID). */
export const googleMapsUrl =
  'https://www.google.com/maps?cid=9036827925030404184';

export const googleReviewsUrl =
  'https://www.google.com/maps/place/KS+Protect/@64.1081416,-21.8498734,17z/data=!4m8!3m7!1s0x48d673cee22ba86f:0x7d69431e5fc48058!8m2!3d64.1081416!4d-21.8498734!9m1!1b1!16s%2Fg%2F11fp8h46w2';

export const googlePlaceSummary = {
  rating: 5,
  totalReviews: 3,
  name: 'KS Protect',
};

/**
 * Real Google reviews from the KS Protect Maps listing.
 * Refresh manually when new reviews appear (or wire Places API later).
 */
export const googleReviews: GoogleReview[] = [
  {
    id: 'alexander-h',
    author: 'Alexander H',
    rating: 5,
    text:
      'Perfect service. The car looks like new after this. The staffs are very friendly and nice. I totally recommended this for all new car owner.',
    relativeTime: 'a week ago',
    source: 'Google',
  },
  {
    id: 'dj-jo',
    author: 'Dj Jo',
    rating: 5,
    text: '',
    relativeTime: 'a year ago',
    source: 'Google',
  },
  {
    id: 'ingvi-mar',
    author: 'Ingvi Mar',
    rating: 5,
    text: '',
    relativeTime: '4 years ago',
    source: 'Google',
  },
];
