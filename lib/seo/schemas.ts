/**
 * SEO Schema generators for structured data
 * Helps with rich snippets in Google search results
 */

export interface BreadcrumbItem {
  name: string
  url: string
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }
}

export interface ArticleSchemaProps {
  headline: string
  description: string
  url: string
  image?: string
  datePublished: string
  dateModified?: string
  keywords?: string
  wordCount?: number
  section?: string
}

export function generateArticleSchema(props: ArticleSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": props.headline,
    "description": props.description,
    "image": props.image || "https://rol-hub.com/og-default.png",
    "author": {
      "@type": "Organization",
      "name": "RolHub",
      "url": "https://rol-hub.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "RolHub",
      "url": "https://rol-hub.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rol-hub.com/logo.png"
      }
    },
    "datePublished": props.datePublished,
    "dateModified": props.dateModified || props.datePublished,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": props.url
    },
    "articleSection": props.section || "Guias",
    "keywords": props.keywords,
    "wordCount": props.wordCount,
    "inLanguage": "es"
  }
}

export interface FAQItem {
  question: string
  answer: string
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

export interface HowToStep {
  name: string
  text: string
  substeps?: string[]
}

export function generateHowToSchema(props: {
  name: string
  description: string
  totalTime: string
  steps: HowToStep[]
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": props.name,
    "description": props.description,
    "totalTime": props.totalTime,
    "step": props.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.substeps && {
        "itemListElement": step.substeps.map((substep, i) => ({
          "@type": "HowToDirection",
          "position": i + 1,
          "text": substep
        }))
      })
    }))
  }
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "RolHub",
    "alternateName": "RPG Hub",
    "url": "https://rol-hub.com",
    "description": "Plataforma de juegos de rol narrativo con Director de Juego IA",
    "inLanguage": "es",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://rol-hub.com/guias?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "RolHub",
    "url": "https://rol-hub.com",
    "logo": "https://rol-hub.com/logo.png",
    "description": "Plataforma de juegos de rol narrativo con Director de Juego basado en inteligencia artificial",
    "sameAs": [
      // Add social media URLs when available
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": "https://rol-hub.com/contacto"
    }
  }
}

export function generateSoftwareAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "RolHub",
    "applicationCategory": "GameApplication",
    "operatingSystem": "Web",
    "description": "Plataforma de juegos de rol narrativo con Director de Juego IA. Crea personajes, elige mundos de fantasia y vive aventuras unicas.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Plan gratuito disponible"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    }
  }
}
