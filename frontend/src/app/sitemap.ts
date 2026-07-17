import type { MetadataRoute } from 'next';

const BASE_URL = 'https://bridgecapitalv1.com';

// Public marketing/content pages only — authenticated app routes (dashboard,
// wallet, admin, etc.) require login and shouldn't be crawled or indexed.
const routes = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' as const },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/careers', priority: 0.4, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/fees', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/help', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/legal', priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/login', priority: 0.5, changeFrequency: 'yearly' as const },
  { path: '/register', priority: 0.8, changeFrequency: 'yearly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
