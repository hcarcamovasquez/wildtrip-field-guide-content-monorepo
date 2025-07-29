import { protectedAreas, type RichContent } from '../../db/schema'
import { and, count, desc, eq, ilike, or, asc } from 'drizzle-orm'
import { db } from '../../db/config.ts'

export type PublicProtectedArea = {
  title: string
  description: string
  slug: string
  mainImageUrl: string | null
  type: string
  region: string | null
}

export type PublicDetailProtectedArea = {
  name: string
  type: 'national_park' | 'national_reserve' | 'natural_monument' | 'nature_sanctuary'
  location: string
  area: number
  creationYear: number
  description: string
  ecosystems: string[]
  keySpecies: number[] | null
  visitorInformation: Record<string, string | null> | null
  images: string[]
  mainImageUrl: string | null
  region: string | null
  richContent: RichContent | null
  publishedAt: Date
}

export interface AreaPaginateParams {
  page?: number
  limit?: number
  search?: string
  region?: string
  type?: 'national_park' | 'national_reserve' | 'natural_monument' | 'nature_sanctuary' | 'all'
  sortBy?: 'title' | 'publishedAt'
  sortOrder?: 'asc' | 'desc'
}

export class PublicProtectedAreasRepository {
  async findPublishedWithPagination(params: AreaPaginateParams) {
    const { page = 1, limit = 12, search = '', region, type, sortBy = 'publishedAt', sortOrder = 'desc' } = params

    const offset = (page - 1) * limit
    const conditions = []
    conditions.push(eq(protectedAreas.status, 'published'))

    if (search) {
      conditions.push(
        or(
          ilike(protectedAreas.name, `%${search}%`),
          ilike(protectedAreas.description, `%${search}%`),
          ilike(protectedAreas.location, `%${search}%`),
        ),
      )
    }

    if (type && type != 'all') {
      conditions.push(eq(protectedAreas.type, type))
    }

    if (region && region != 'all') {
      conditions.push(eq(protectedAreas.region, region))
    }

    const whereClause = and(...conditions)
    const orderClause =
      sortBy === 'title'
        ? sortOrder === 'asc'
          ? asc(protectedAreas.name)
          : desc(protectedAreas.name)
        : sortOrder === 'asc'
          ? asc(protectedAreas.publishedAt)
          : desc(protectedAreas.publishedAt)

    const [items, countResult] = await Promise.all([
      db
        .select({
          title: protectedAreas.name,
          description: protectedAreas.description,
          slug: protectedAreas.slug,
          mainImage: protectedAreas.mainImage,
          type: protectedAreas.type,
          region: protectedAreas.region,
          status: protectedAreas.status,
        })
        .from(protectedAreas)
        .where(whereClause)
        .orderBy(orderClause)
        .limit(limit)
        .offset(offset),
      db
        .select({
          count: count(),
        })
        .from(protectedAreas)
        .where(whereClause),
    ])

    return {
      data: items.map((item) => ({
        title: item.title,
        description: item.description || '',
        slug: item.slug,
        mainImageUrl: item.mainImage?.url || null,
        type: item.type,
        region: item.region || null,
      })) as PublicProtectedArea[],
      pagination: {
        page,
        total: Number(countResult[0]?.count ?? 0),
        totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
      },
    }
  }

  async findOneBySlug(slug: string) {
    const result = await db
      .select({
        id: protectedAreas.id,
        name: protectedAreas.name,
        type: protectedAreas.type,
        location: protectedAreas.location,
        area: protectedAreas.area,
        creationYear: protectedAreas.creationYear,
        description: protectedAreas.description,
        ecosystems: protectedAreas.ecosystems,
        keySpecies: protectedAreas.keySpecies,
        visitorInformation: protectedAreas.visitorInformation,
        mainImage: protectedAreas.mainImage,
        galleryImages: protectedAreas.galleryImages,
        region: protectedAreas.region,
        richContent: protectedAreas.richContent,
        publishedAt: protectedAreas.publishedAt,
      })
      .from(protectedAreas)
      .where(and(eq(protectedAreas.slug, slug!), eq(protectedAreas.status, 'published')))
      .limit(1)

    if (!result[0]) return null

    // Get all image URLs from gallery images
    const imageUrls = result[0].galleryImages?.map((img) => img.url) || []

    return {
      name: result[0].name,
      type: result[0].type,
      location: result[0].location || '',
      area: result[0].area || 0,
      creationYear: result[0].creationYear || 0,
      description: result[0].description || '',
      ecosystems: result[0].ecosystems || [],
      keySpecies: result[0].keySpecies,
      visitorInformation: result[0].visitorInformation,
      images: imageUrls,
      mainImageUrl: result[0].mainImage?.url || null,
      region: result[0].region || null,
      richContent: result[0].richContent,
      publishedAt: result[0].publishedAt || new Date(),
    } as PublicDetailProtectedArea
  }
}

export const publicProtectedAreasRepository = new PublicProtectedAreasRepository()
