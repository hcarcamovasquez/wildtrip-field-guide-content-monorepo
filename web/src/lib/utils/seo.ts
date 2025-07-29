/**
 * SEO utility functions
 */

/**
 * Truncate text to a specific length for meta descriptions
 * Google typically displays 155-160 characters
 */
export function generateMetaDescription(text: string, maxLength: number = 155): string {
  if (!text) return ''
  
  // Remove HTML tags if any
  const cleanText = text.replace(/<[^>]*>/g, '')
  
  // Remove multiple spaces and line breaks
  const normalizedText = cleanText.replace(/\s+/g, ' ').trim()
  
  if (normalizedText.length <= maxLength) {
    return normalizedText
  }
  
  // Truncate at the last complete word before maxLength
  const truncated = normalizedText.substr(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')
  
  if (lastSpaceIndex > 0) {
    return truncated.substr(0, lastSpaceIndex) + '...'
  }
  
  return truncated + '...'
}

/**
 * Generate a SEO-friendly title
 * Google typically displays 50-60 characters
 */
export function generatePageTitle(title: string, suffix: string = 'WildTrip Guia de Campo'): string {
  const separator = ' - '
  const maxLength = 60
  
  if (!title) return suffix
  
  const fullTitle = `${title}${separator}${suffix}`
  
  if (fullTitle.length <= maxLength) {
    return fullTitle
  }
  
  // If title is too long, truncate it but keep the suffix
  const availableLength = maxLength - suffix.length - separator.length - 3 // 3 for '...'
  
  if (availableLength <= 0) {
    return suffix
  }
  
  const truncatedTitle = title.substr(0, availableLength) + '...'
  return `${truncatedTitle}${separator}${suffix}`
}

/**
 * Extract text content from rich content blocks
 * Used for generating meta descriptions from Tiptap content
 */
export function extractTextFromRichContent(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return ''
  
  let text = ''
  
  for (const block of blocks) {
    if (block.type === 'paragraph' && block.children) {
      for (const child of block.children) {
        if (child.type === 'text' && child.text) {
          text += child.text + ' '
        }
      }
    }
  }
  
  return text.trim()
}

/**
 * Generate breadcrumb items for structured data
 */
export function generateBreadcrumbs(path: string, currentTitle: string) {
  const baseUrl = 'https://guiadecampo.cl'
  const segments = path.split('/').filter(Boolean)
  const breadcrumbs = [
    { name: 'Inicio', url: baseUrl }
  ]
  
  if (segments.length > 0 && segments[0] === 'content') {
    let currentPath = baseUrl
    
    for (let i = 0; i < segments.length - 1; i++) {
      currentPath += `/${segments[i]}`
      
      // Map segment to display name
      let name = segments[i]
      if (segments[i] === 'content') {
        continue // Skip 'content' segment
      } else if (segments[i] === 'species') {
        name = 'Especies'
      } else if (segments[i] === 'news') {
        name = 'Noticias'
      } else if (segments[i] === 'protected-areas') {
        name = 'Áreas Protegidas'
      }
      
      breadcrumbs.push({ name, url: currentPath })
    }
    
    // Add current page
    breadcrumbs.push({ 
      name: currentTitle, 
      url: `${baseUrl}${path}` 
    })
  }
  
  return breadcrumbs
}

/**
 * Format date for SEO purposes (ISO 8601)
 */
export function formatDateForSEO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString()
}

/**
 * Generate alt text for images if missing
 */
export function generateImageAlt(title: string, type: 'species' | 'news' | 'area'): string {
  const typeMap = {
    species: 'Imagen de',
    news: 'Foto de noticia:',
    area: 'Vista de'
  }
  
  return `${typeMap[type]} ${title}`
}

/**
 * Clean and format URL slugs
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
}

/**
 * Check if URL should be excluded from sitemap
 */
export function shouldExcludeFromSitemap(url: string): boolean {
  const excludePatterns = [
    '/manage',
    '/api',
    '/preview',
    '/404',
    '/500',
    '/_',
  ]
  
  return excludePatterns.some(pattern => url.includes(pattern))
}

/**
 * Generate hreflang tags for multi-language support (future feature)
 */
export function generateHreflangTags(currentUrl: string, languages: string[] = ['es']): Array<{lang: string, url: string}> {
  // For now, we only support Spanish
  return [{
    lang: 'es',
    url: currentUrl
  }]
}

/**
 * Get canonical URL for a page
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = 'https://guiadecampo.cl'
  // Remove trailing slashes and query parameters
  const cleanPath = path.split('?')[0].replace(/\/$/, '')
  return `${baseUrl}${cleanPath}`
}