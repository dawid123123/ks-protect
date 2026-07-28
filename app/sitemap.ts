import type { MetadataRoute } from 'next';
import { siteUrl } from '../lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = [
    '/',
    '/ppf',
    '/tint',
    '/netverslun',
    '/um-okkur',
    '/faq',
    '/skilmalar',
  ];

  return routes.map((path, index) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : Math.max(0.5, 0.9 - index * 0.05),
  }));
}
