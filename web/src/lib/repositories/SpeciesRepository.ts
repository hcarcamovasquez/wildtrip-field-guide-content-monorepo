import { apiClient } from '../api/client'
import type { RichContent } from '@wildtrip/shared'

export type PublicSpecie = {
  slug: string
  commonName: string
  mainImageUrl: string | null
  description: string | null
  status: 'published' | 'draft'
  scientificName: string | null
  conservationStatus: string | null
  mainGroup: string | null
}

export type PublicDetailSpecie = {
  scientificName: string
  commonName: string
  family: string
  order: string
  class: string
  phylum: string
  kingdom: string
  mainGroup: string
  specificCategory: string
  conservationStatus: string | null
  habitat: string
  distribution: string
  description: string
  distinctiveFeatures: string
  images: string[] | null
  mainImageUrl: string | null
  richContent: RichContent | null
  references: { title: string; url: string }[] | null
  publishedAt: Date
}

export interface PaginateParams {
  page?: number
  limit?: number
  search?: string
  conservationStatus?:
    | 'critically_endangered'
    | 'endangered'
    | 'vulnerable'
    | 'near_threatened'
    | 'least_concern'
    | 'all'
  mainGroup?: string
  sortBy?: 'commonName' | 'publishedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginateResult {
  data: PublicSpecie[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

class SpeciesRepository {
  async findPublished(params: PaginateParams): Promise<PaginateResult> {
    const { page = 1, limit = 20, ...filters } = params
    
    const response = await apiClient.species.findAll({
      page,
      limit,
      status: 'published',
      ...filters
    })

    // Map the API response to match our types
    const mappedData = (response.data || []).map((item: any) => ({
      ...item,
      mainImageUrl: item.mainImage?.url || item.mainImageUrl || null
    }))

    return {
      data: mappedData,
      pagination: {
        page: response.pagination?.page || page,
        pageSize: response.pagination?.limit || limit,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0
      }
    }
  }

  async findBySlug(slug: string): Promise<PublicDetailSpecie | null> {
    try {
      const response = await apiClient.species.findBySlug(slug)
      if (!response || response.status !== 'published') {
        return null
      }
      // Map mainImage.url to mainImageUrl
      return {
        ...response,
        mainImageUrl: response.mainImage?.url || response.mainImageUrl || null
      }
    } catch (error) {
      console.error('Error fetching species by slug:', error)
      return null
    }
  }

  async findById(id: number): Promise<any> {
    try {
      const response = await apiClient.species.findById(id)
      if (!response) {
        return null
      }
      // Map mainImage.url to mainImageUrl and include draft data
      return {
        ...response,
        mainImageUrl: response.mainImage?.url || response.mainImageUrl || null
      }
    } catch (error) {
      console.error('Error fetching species by id:', error)
      return null
    }
  }

  async getTotalPublished(): Promise<number> {
    const response = await apiClient.species.findAll({
      page: 1,
      limit: 1,
      status: 'published'
    })
    return response.total || 0
  }

  async getLastPublished(limit: number = 3): Promise<PublicSpecie[]> {
    const response = await apiClient.species.findAll({
      page: 1,
      limit,
      status: 'published',
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    })
    // Map the API response to match our types
    return (response.data || []).map((item: any) => ({
      ...item,
      mainImageUrl: item.mainImage?.url || item.mainImageUrl || null
    }))
  }
}

export const speciesRepository = new SpeciesRepository()