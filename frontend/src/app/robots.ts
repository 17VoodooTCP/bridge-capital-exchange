import type { MetadataRoute } from 'next';

const BASE_URL = 'https://bridgecapitalv1.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Authenticated / private app areas — no value being indexed, and
        // crawling them wastes Google's crawl budget on your public pages.
        disallow: [
          '/dashboard',
          '/wallet',
          '/trade',
          '/markets',
          '/earn',
          '/copy-trading',
          '/etfs',
          '/stocks',
          '/news',
          '/support',
          '/settings',
          '/admin',
          '/admin-login',
          '/reset-password',
          '/forgot-password',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
