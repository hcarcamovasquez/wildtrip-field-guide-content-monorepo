import { apiClient } from '../api/client'

interface DynamicUrl {
  url: string
  lastModified?: Date
}

/**
 * Get all dynamic URLs for the sitemap
 */
export async function getDynamicSitemapUrls(): Promise<DynamicUrl[]> {
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
        status: 'published',
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
        status: 'published',
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
        status: 'published',
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

    return urls
  } catch (error) {
    console.error('Error generating dynamic sitemap URLs:', error)
    return []
  }
}
