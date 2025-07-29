import { RedisCache } from '../cache/redis'
import { db } from '../db/config.ts'
import { species, news, protectedAreas } from '../db/schema'
import { eq } from 'drizzle-orm'

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
    // Fetch all published species
    const speciesList = await db
      .select({
        id: species.id,
        updatedAt: species.updatedAt,
      })
      .from(species)
      .where(eq(species.status, 'published'))

    speciesList.forEach((item) => {
      urls.push({
        url: `/content/species/${item.id}`,
        lastModified: item.updatedAt || undefined,
      })
    })

    // Fetch all published news
    const newsList = await db
      .select({
        id: news.id,
        updatedAt: news.updatedAt,
      })
      .from(news)
      .where(eq(news.status, 'published'))

    newsList.forEach((item) => {
      urls.push({
        url: `/content/news/${item.id}`,
        lastModified: item.updatedAt || undefined,
      })
    })

    // Fetch all published protected areas
    const areasList = await db
      .select({
        id: protectedAreas.id,
        updatedAt: protectedAreas.updatedAt,
      })
      .from(protectedAreas)
      .where(eq(protectedAreas.status, 'published'))

    areasList.forEach((area) => {
      urls.push({
        url: `/content/protected-areas/${area.id}`,
        lastModified: area.updatedAt || undefined,
      })
    })

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