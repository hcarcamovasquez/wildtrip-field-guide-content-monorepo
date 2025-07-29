import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'
import { news } from '../../db/schema'
import { db } from '../../db/config.ts'
import type { RichContent } from '../../db/schema'

export type PublicNews = {
  slug: string
  mainImageUrl: string | null
  title: string
  publishedAt: Date
  category: string
  author: string
  summary: string
}

export type PublicDetailNews = {
  title: string
  author: string | null
  category: string
  summary: string | null
  content: RichContent | null
  mainImageUrl: string | null
  tags: string[] | null
  publishedAt: Date | null
}

export interface NewsPaginateParams {
  page?: number
  limit?: number
  search?: string
  category?: 'education' | 'current_events' | 'conservation' | 'research' | 'all'
  sortBy?: 'title' | 'publishedAt'
  sortOrder?: 'asc' | 'desc'
}

export class PublicNewsRepository {
  async findPublishedWithPagination(params: NewsPaginateParams) {
    const { page = 1, limit = 12, search = '', category, sortBy = 'publishedAt', sortOrder = 'desc' } = params

    const offset = (page - 1) * limit
    const conditions = []
    conditions.push(eq(news.status, 'published'))

    if (search) {
      conditions.push(or(ilike(news.title, `%${search}%`), ilike(news.summary, `%${search}%`)))
    }

    if (category && category !== 'all') {
      conditions.push(eq(news.category, category))
    }

    const whereClause = and(...conditions)
    const orderClause =
      sortBy === 'title'
        ? sortOrder === 'asc'
          ? asc(news.title)
          : desc(news.title)
        : sortOrder === 'asc'
          ? asc(news.publishedAt)
          : desc(news.publishedAt)

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: news.id,
          slug: news.slug,
          mainImage: news.mainImage,
          title: news.title,
          publishedAt: news.publishedAt,
          author: news.author,
          category: news.category,
          summary: news.summary,
        })
        .from(news)
        .where(whereClause)
        .orderBy(orderClause)
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(news).where(whereClause),
    ])

    return {
      data: items.map((item) => ({
        slug: item.slug,
        mainImageUrl: item.mainImage?.url || null,
        title: item.title,
        publishedAt: item.publishedAt || new Date(),
        author: item.author || '',
        category: item.category,
        summary: item.summary || '',
      })) as PublicNews[],
      pagination: {
        page,
        total: Number(countResult[0]?.count ?? 0),
        totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
      },
    }
  }

  async findOneBySlug(slug: string): Promise<PublicDetailNews | null> {
    const result = await db
      .select({
        title: news.title,
        author: news.author,
        category: news.category,
        summary: news.summary,
        content: news.content,
        mainImage: news.mainImage,
        tags: news.tags,
        publishedAt: news.publishedAt,
      })
      .from(news)
      .where(and(eq(news.slug, slug), eq(news.status, 'published')))
      .limit(1)

    if (!result[0]) return null

    return {
      title: result[0].title,
      author: result[0].author,
      category: result[0].category,
      summary: result[0].summary,
      content: result[0].content,
      mainImageUrl: result[0].mainImage?.url || null,
      tags: result[0].tags,
      publishedAt: result[0].publishedAt,
    }
  }
}

export const publicNewsRepository = new PublicNewsRepository()
