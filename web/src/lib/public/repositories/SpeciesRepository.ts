import { species, type RichContent } from '../../db/schema'
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from '../../db/config.ts'

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

class PublicSpeciesRepository {
  async findAll(params: PaginateParams) {
    const {
      page = 1,
      limit = 12,
      search = '',
      conservationStatus,
      mainGroup,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
    } = params

    const offset = (page - 1) * limit
    const conditions = []
    conditions.push(eq(species.status, 'published'))

    if (search) {
      conditions.push(or(ilike(species.commonName, `%${search}%`), ilike(species.scientificName, `%${search}%`)))
    }

    if (conservationStatus && conservationStatus !== 'all') {
      conditions.push(eq(species.conservationStatus, conservationStatus))
    }

    if (mainGroup && mainGroup !== 'all') {
      conditions.push(eq(species.mainGroup, mainGroup as any))
    }

    const whereClause = and(...conditions)
    const orderClause =
      sortBy === 'commonName'
        ? sortOrder === 'asc'
          ? asc(species.commonName)
          : desc(species.commonName)
        : sortOrder === 'asc'
          ? asc(species.publishedAt)
          : desc(species.publishedAt)

    const [items, countResult] = await Promise.all([
      db
        .select({
          slug: species.slug,
          commonName: species.commonName,
          description: species.description,
          mainImage: species.mainImage,
          status: species.status,
          scientificName: species.scientificName,
          conservationStatus: species.conservationStatus,
          mainGroup: species.mainGroup,
        })
        .from(species)
        .where(whereClause)
        .orderBy(orderClause)
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(species).where(whereClause),
    ])

    return {
      data: items.map((item) => ({
        slug: item.slug,
        commonName: item.commonName || '',
        mainImageUrl: item.mainImage?.url || null,
        description: item.description,
        status: item.status,
        scientificName: item.scientificName,
        conservationStatus: item.conservationStatus,
        mainGroup: item.mainGroup,
      })) as PublicSpecie[],
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
        scientificName: species.scientificName,
        commonName: species.commonName,
        family: species.family,
        order: species.order,
        class: species.class,
        phylum: species.phylum,
        kingdom: species.kingdom,
        mainGroup: species.mainGroup,
        specificCategory: species.specificCategory,
        conservationStatus: species.conservationStatus,
        habitat: species.habitat,
        distribution: species.distribution,
        description: species.description,
        distinctiveFeatures: species.distinctiveFeatures,
        images: species.images,
        mainImage: species.mainImage,
        galleryImages: species.galleryImages,
        richContent: species.richContent,
        references: species.references,
        publishedAt: species.publishedAt,
      })
      .from(species)
      .where(and(eq(species.slug, slug), eq(species.status, 'published')))
      .limit(1)

    if (!result[0]) return null

    // Get image URLs from galleryImages
    const imageUrls = result[0].galleryImages?.map((img) => img.url) || []

    return {
      scientificName: result[0].scientificName || '',
      commonName: result[0].commonName || '',
      family: result[0].family || '',
      order: result[0].order || '',
      class: result[0].class || '',
      phylum: result[0].phylum || '',
      kingdom: result[0].kingdom || '',
      mainGroup: result[0].mainGroup || '',
      specificCategory: result[0].specificCategory || '',
      conservationStatus: result[0].conservationStatus,
      habitat: result[0].habitat || '',
      distribution: result[0].distribution || '',
      description: result[0].description || '',
      distinctiveFeatures: result[0].distinctiveFeatures || '',
      images: imageUrls,
      mainImageUrl: result[0].mainImage?.url || null,
      richContent: result[0].richContent,
      references: result[0].references,
      publishedAt: result[0].publishedAt || new Date(),
    } as PublicDetailSpecie
  }
}

export const publicSpeciesRepository = new PublicSpeciesRepository()
