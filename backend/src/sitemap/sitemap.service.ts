import { Injectable } from '@nestjs/common'
import { SpeciesService } from '../species/species.service'
import { NewsService } from '../news/news.service'
import { ProtectedAreasService } from '../protected-areas/protected-areas.service'

@Injectable()
export class SitemapService {
  constructor(
    private readonly speciesService: SpeciesService,
    private readonly newsService: NewsService,
    private readonly protectedAreasService: ProtectedAreasService,
  ) {}

  async generateSitemap(): Promise<string> {
    const siteUrl = process.env.SITE_URL || 'https://guiadecampo.cl'
    
    // Start building the sitemap
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    // Add static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/content/species', priority: '0.9', changefreq: 'daily' },
      { url: '/content/news', priority: '0.9', changefreq: 'daily' },
      { url: '/content/protected-areas', priority: '0.9', changefreq: 'daily' },
      { url: '/privacy-policy', priority: '0.3', changefreq: 'monthly' },
      { url: '/terms-of-service', priority: '0.3', changefreq: 'monthly' },
    ]

    for (const page of staticPages) {
      sitemap += `  <url>\n`
      sitemap += `    <loc>${siteUrl}${page.url}</loc>\n`
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`
      sitemap += `    <priority>${page.priority}</priority>\n`
      sitemap += `  </url>\n`
    }

    // Add dynamic pages
    try {
      // Get all published species
      let page = 1
      let hasMore = true
      
      while (hasMore) {
        const speciesResult = await this.speciesService.findAll({
          page,
          limit: 100,
          status: 'published',
        })

        for (const species of speciesResult.data) {
          sitemap += `  <url>\n`
          sitemap += `    <loc>${siteUrl}/content/species/${species.slug}</loc>\n`
          if (species.updatedAt) {
            const date = new Date(species.updatedAt).toISOString().split('T')[0]
            sitemap += `    <lastmod>${date}</lastmod>\n`
          }
          sitemap += `    <changefreq>weekly</changefreq>\n`
          sitemap += `    <priority>0.8</priority>\n`
          sitemap += `  </url>\n`
        }

        hasMore = page < speciesResult.pagination.totalPages
        page++
      }

      // Get all published news
      page = 1
      hasMore = true
      
      while (hasMore) {
        const newsResult = await this.newsService.findAll({
          page,
          limit: 100,
          status: 'published',
        })

        for (const article of newsResult.data) {
          sitemap += `  <url>\n`
          sitemap += `    <loc>${siteUrl}/content/news/${article.slug}</loc>\n`
          if (article.publishedAt) {
            const date = new Date(article.publishedAt).toISOString().split('T')[0]
            sitemap += `    <lastmod>${date}</lastmod>\n`
          }
          sitemap += `    <changefreq>monthly</changefreq>\n`
          sitemap += `    <priority>0.7</priority>\n`
          sitemap += `  </url>\n`
        }

        hasMore = page < newsResult.pagination.totalPages
        page++
      }

      // Get all published protected areas
      page = 1
      hasMore = true
      
      while (hasMore) {
        const areasResult = await this.protectedAreasService.findAll({
          page,
          limit: 100,
          status: 'published',
        })

        for (const area of areasResult.data) {
          sitemap += `  <url>\n`
          sitemap += `    <loc>${siteUrl}/content/protected-areas/${area.slug}</loc>\n`
          if (area.updatedAt) {
            const date = new Date(area.updatedAt).toISOString().split('T')[0]
            sitemap += `    <lastmod>${date}</lastmod>\n`
          }
          sitemap += `    <changefreq>monthly</changefreq>\n`
          sitemap += `    <priority>0.8</priority>\n`
          sitemap += `  </url>\n`
        }

        hasMore = page < areasResult.pagination.totalPages
        page++
      }
    } catch (error) {
      console.error('Error generating sitemap:', error)
    }

    sitemap += '</urlset>'
    return sitemap
  }
}