import { RedisCache } from '../cache/redis'
import { apiClient } from '../api/client'

// Cache configuration
const SITEMAP_URLS_CACHE_KEY = 'sitemap:dynamic-urls'
const SITEMAP_CACHE_TTL = 3600 * 24 // 24 hours

interface DynamicUrl {
  url: string
  lastModified?: Date
}

/**
 * Get all dynamic URLs for the sitemap with caching
 */
export async function getDynamicSitemapUrls(): Promise<DynamicUrl[]> {
  // Try to get from cache first
  const cached = await RedisCache.get<DynamicUrl[]>(SITEMAP_URLS_CACHE_KEY)
  if (cached) {
    // Convert date strings back to Date objects
    return cached.map(item => ({
      ...item,
      lastModified: item.lastModified ? new Date(item.lastModified) : undefined
    }))
  }

  // Generate dynamic URLs
  const urls: DynamicUrl[] = []

  try {
    // Fetch all published species (get all pages)
    let page = 1
    let hasMore = true
    
    while (hasMore) {
      const speciesResponse = await apiClient.species.findAll({
        page,
        limit: 100,
        status: 'published'
      })
      
      if (speciesResponse.data) {
        speciesResponse.data.forEach((item: any) => {
          urls.push({
            url: `/content/species/${item.slug}`,
            lastModified: item.updatedAt ? new Date(item.updatedAt) : undefined,
          })
        })
      }
      
      hasMore = page < (speciesResponse.totalPages || 0)
      page++
    }

    // Fetch all published news
    page = 1
    hasMore = true
    
    while (hasMore) {
      const newsResponse = await apiClient.news.findAll({
        page,
        limit: 100,
        status: 'published'
      })
      
      if (newsResponse.data) {
        newsResponse.data.forEach((item: any) => {
          urls.push({
            url: `/content/news/${item.slug}`,
            lastModified: item.publishedAt ? new Date(item.publishedAt) : undefined,
          })
        })
      }
      
      hasMore = page < (newsResponse.totalPages || 0)
      page++
    }

    // Fetch all published protected areas
    page = 1
    hasMore = true
    
    while (hasMore) {
      const areasResponse = await apiClient.protectedAreas.findAll({
        page,
        limit: 100,
        status: 'published'
      })
      
      if (areasResponse.data) {
        areasResponse.data.forEach((item: any) => {
          urls.push({
            url: `/content/protected-areas/${item.slug}`,
            lastModified: item.updatedAt ? new Date(item.updatedAt) : undefined,
          })
        })
      }
      
      hasMore = page < (areasResponse.totalPages || 0)
      page++
    }

    // Cache the results
    await RedisCache.set(SITEMAP_URLS_CACHE_KEY, urls, SITEMAP_CACHE_TTL)

    return urls
  } catch (error) {
    console.error('Error generating dynamic sitemap URLs:', error)
    return []
  }
}

/**
 * Clear sitemap cache - call this when content is updated
 */
export async function clearSitemapCache(): Promise<void> {
  await RedisCache.delete(SITEMAP_URLS_CACHE_KEY)
}