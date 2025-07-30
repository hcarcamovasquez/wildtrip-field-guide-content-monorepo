import { apiClient } from '../../api/client'
import type { RichContent } from '@wildtrip/shared'

export type PublicProtectedArea = {
  slug: string
  name: string
  type: string
  region: string | null
  surface: string | null
  featuredImageUrl: string | null
  description: string | null
}

export type PublicDetailProtectedArea = {
  name: string
  type: string
  description: string | null
  location: string | null
  region: string | null
  surface: string | null
  creationYear: number | null
  adminEntity: string | null
  content: RichContent | null
  visitorInfo: RichContent | null
  howToGet: RichContent | null
  featuredImageUrl: string | null
  featuredImageAlt: string | null
  publishedAt: Date | null
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
}

export interface ProtectedAreaPaginateParams {
  page?: number
  limit?: number
  search?: string
  type?: string
  region?: string
  sortBy?: 'name' | 'publishedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface ProtectedAreaPaginateResult {
  data: PublicProtectedArea[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

class ProtectedAreaRepository {
  async findPublished(params: ProtectedAreaPaginateParams): Promise<ProtectedAreaPaginateResult> {
    const { page = 1, limit = 20, ...filters } = params
    
    const response = await apiClient.protectedAreas.findAll({
      page,
      limit,
      status: 'published',
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

  async findBySlug(slug: string): Promise<PublicDetailProtectedArea | null> {
    try {
      const response = await apiClient.protectedAreas.findBySlug(slug)
      if (!response || response.status !== 'published') {
        return null
      }
      return response
    } catch (error) {
      console.error('Error fetching protected area by slug:', error)
      return null
    }
  }

  async getLastPublished(limit: number = 3): Promise<PublicProtectedArea[]> {
    const response = await apiClient.protectedAreas.findAll({
      page: 1,
      limit,
      status: 'published',
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    })
    return response.data || []
  }

  async getTotalPublished(): Promise<number> {
    const response = await apiClient.protectedAreas.findAll({
      page: 1,
      limit: 1,
      status: 'published'
    })
    return response.total || 0
  }
}

export const protectedAreaRepository = new ProtectedAreaRepository()