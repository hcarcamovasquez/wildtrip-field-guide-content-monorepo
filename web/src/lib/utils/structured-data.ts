/**
 * Generate JSON-LD structured data for SEO
 */

interface Organization {
  name: string
  url: string
  logo?: string
  sameAs?: string[]
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface Article {
  title: string
  description: string
  url: string
  datePublished: string
  dateModified?: string
  author?: string
  image?: string
}

interface Species {
  name: string
  scientificName: string
  description: string
  url: string
  image?: string
  conservationStatus?: string
  taxonRank?: string
}

interface Place {
  name: string
  description: string
  url: string
  image?: string
  geo?: {
    latitude: number
    longitude: number
  }
  address?: {
    addressCountry: string
    addressRegion?: string
  }
}

/**
 * Generate Website schema
 */
export function generateWebsiteSchema(org: Organization) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: org.name,
    url: org.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${org.url}/content/species?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(org: Organization) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    logo: org.logo,
    sameAs: org.sameAs || [],
  }
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Generate Article schema for news
 */
export function generateArticleSchema(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description,
    url: article.url,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Organization',
      name: article.author || 'WildTrip Guia de Campo',
    },
    publisher: {
      '@type': 'Organization',
      name: 'WildTrip Guia de Campo',
      logo: {
        '@type': 'ImageObject',
        url: 'https://guiadecampo.cl/logo.png',
      },
    },
    image: article.image,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  }
}

/**
 * Generate Taxon schema for species
 */
export function generateSpeciesSchema(species: Species) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Taxon',
    name: species.scientificName,
    alternateName: species.name,
    description: species.description,
    url: species.url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': species.url,
    },
  }

  if (species.taxonRank) {
    schema.taxonRank = species.taxonRank
  }

  if (species.image) {
    schema.image = species.image
  }

  if (species.conservationStatus) {
    schema.conservationStatus = species.conservationStatus
  }

  return schema
}

/**
 * Generate Place schema for protected areas
 */
export function generatePlaceSchema(place: Place) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: place.name,
    description: place.description,
    url: place.url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': place.url,
    },
  }

  if (place.image) {
    schema.image = place.image
  }

  if (place.geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: place.geo.latitude,
      longitude: place.geo.longitude,
    }
  }

  if (place.address) {
    schema.address = {
      '@type': 'PostalAddress',
      addressCountry: place.address.addressCountry,
      addressRegion: place.address.addressRegion,
    }
  }

  return schema
}

/**
 * Generate CollectionPage schema for list pages
 */
export function generateCollectionPageSchema(name: string, description: string, url: string, itemCount?: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: itemCount,
    },
  }
}
