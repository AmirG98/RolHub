import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/play/', '/lobby/', '/admin/', '/design-system/', '/dice-test/', '/join/', '/invite/', '/maps/', '/tactical/'],
    },
    sitemap: 'https://rol-hub.com/sitemap.xml',
  }
}
