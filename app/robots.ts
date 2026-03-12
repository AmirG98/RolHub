import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/play/', '/lobby/'],
    },
    sitemap: 'https://rolhub.com/sitemap.xml',
  }
}
