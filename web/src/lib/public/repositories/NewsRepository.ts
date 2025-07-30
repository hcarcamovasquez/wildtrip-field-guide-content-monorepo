import { apiClient } from '../../api/client'
import type { RichContent } from '@wildtrip/shared'

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
  category?: 'conservation' | 'research' | 'education' | 'current_events' | 'all'
  sortBy?: 'publishedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface NewsPaginateResult {
  data: PublicNews[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

class NewsRepository {
  async findPublished(params: NewsPaginateParams): Promise<NewsPaginateResult> {
    const { page = 1, limit = 10, category, ...filters } = params
    
    const response = await apiClient.news.findAll({
      page,
      limit,
      status: 'published',
      ...(category && category !== 'all' ? { category } : {}),
      ...filters
    })

    return {
      data: response.data || [],
      pagination: {
        page: response.page || page,
        pageSize: response.limit || limit,
        total: response.total || 0,
        totalPages: response.totalPages || 0
      }
    }
  }

  async findBySlug(slug: string): Promise<PublicDetailNews | null> {
    try {
      const response = await apiClient.news.findBySlug(slug)
      if (!response || response.status !== 'published') {
        return null
      }
      return response
    } catch (error) {
      console.error('Error fetching news by slug:', error)
      return null
    }
  }

  async getLastPublished(limit: number = 3): Promise<PublicNews[]> {
    const response = await apiClient.news.findAll({
      page: 1,
      limit,
      status: 'published',
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    })
    return response.data || []
  }

  async getTotalPublished(): Promise<number> {
    const response = await apiClient.news.findAll({
      page: 1,
      limit: 1,
      status: 'published'
    })
    return response.total || 0
  }
}

export const newsRepository = new NewsRepository()