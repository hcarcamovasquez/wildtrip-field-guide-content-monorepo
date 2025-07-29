import { and, desc, eq, ilike, or, count } from 'drizzle-orm'

import { db } from '../../db/config'
import { species, users } from '../../db/schema'
import type { Species } from '../../db/schema'

export interface SpeciesWithBase extends Species {}

export interface SpeciesWithDetails extends SpeciesWithBase {
  lock?: {
    userId: number
    userName: string
    userEmail: string
    lockedAt: Date
  } | null
}

interface FindAllParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  conservationStatus?: string
  kingdom?: string
  sortBy?: 'scientificName' | 'commonName' | 'updatedAt' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export class ManageSpeciesRepository {
  static async findAll({
    page = 1,
    limit = 20,
    search = '',
    status = '',
    conservationStatus = '',
    kingdom = '',
    sortBy = 'updatedAt',
    sortOrder = 'desc',
  }: FindAllParams = {}) {
    const offset = (page - 1) * limit

    const conditions = []

    // Search filter
    if (search) {
      conditions.push(
        or(
          ilike(species.scientificName, `%${search}%`),
          ilike(species.commonName, `%${search}%`),
          ilike(species.family, `%${search}%`),
          ilike(species.description, `%${search}%`),
        ),
      )
    }

    // Status filter
    if (status && status !== 'all') {
      conditions.push(eq(species.status, status as 'draft' | 'published' | 'archived'))
    }

    // Conservation status filter
    if (conservationStatus && conservationStatus !== 'all') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      conditions.push(eq(species.conservationStatus, conservationStatus as any))
    }

    // Kingdom filter
    if (kingdom && kingdom !== 'all') {
      conditions.push(eq(species.kingdom, kingdom))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Build order by clause
    const orderByColumn =
      sortBy === 'scientificName'
        ? species.scientificName
        : sortBy === 'commonName'
          ? species.commonName
          : sortBy === 'createdAt'
            ? species.createdAt
            : species.updatedAt

    const orderByClause = sortOrder === 'asc' ? orderByColumn : desc(orderByColumn)

    const [items, totalResult] = await Promise.all([
      db
        .select({
          id: species.id,
          status: species.status,
          slug: species.slug,
          scientificName: species.scientificName,
          commonName: species.commonName,
          family: species.family,
          order: species.order,
          class: species.class,
          phylum: species.phylum,
          kingdom: species.kingdom,
          mainGroup: species.mainGroup,
          specificCategory: species.specificCategory,
          description: species.description,
          habitat: species.habitat,
          distribution: species.distribution,
          conservationStatus: species.conservationStatus,
          mainImage: species.mainImage,
          galleryImages: species.galleryImages,
          images: species.images,
          distinctiveFeatures: species.distinctiveFeatures,
          references: species.references,
          richContent: species.richContent,
          publishedAt: species.publishedAt,
          createdAt: species.createdAt,
          updatedAt: species.updatedAt,
          hasDraft: species.hasDraft,
          draftData: species.draftData,
          draftCreatedAt: species.draftCreatedAt,
        })
        .from(species)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),

      db.select({ count: count() }).from(species).where(whereClause),
    ])

    const total = Number(totalResult[0]?.count || 0)
    const totalPages = Math.ceil(total / limit)

    return {
      items: items as SpeciesWithBase[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    }
  }

  static async findById(id: number): Promise<SpeciesWithBase | null> {
    if (!id || isNaN(id)) {
      return null
    }

    const result = await db.select().from(species).where(eq(species.id, id)).limit(1)

    if (!result[0]) return null

    return result[0] as SpeciesWithBase
  }

  static async create(data: { scientificName: string; commonName: string; userId: number }) {
    const slug = data.scientificName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')

    // Create species directly
    const [speciesResult] = await db
      .insert(species)
      .values({
        status: 'draft',
        slug,
        scientificName: data.scientificName,
        commonName: data.commonName,
        description: '',
        hasDraft: false,
      })
      .returning()

    return speciesResult
  }

  static async update(id: number, data: Partial<Species>, _userId: number, skipDraftCreation = false) {
    // Get species to check if published
    const existing = await db
      .select({
        status: species.status,
        hasDraft: species.hasDraft,
        draftData: species.draftData,
        draftCreatedAt: species.draftCreatedAt,
      })
      .from(species)
      .where(eq(species.id, id))
      .limit(1)

    if (!existing[0]) throw new Error('Especie no encontrada')

    // If content is published and we should create drafts, save changes as draft
    if (existing[0].status === 'published' && !skipDraftCreation) {
      // Update only allowed fields directly in species
      const directUpdateFields = ['status', 'publishedAt']
      const directUpdates: Record<string, unknown> = {}
      const draftUpdates: Record<string, unknown> = {}

      Object.entries(data).forEach(([key, value]) => {
        if (directUpdateFields.includes(key)) {
          directUpdates[key] = value
        } else {
          draftUpdates[key] = value
        }
      })

      // If there are fields to update directly
      if (Object.keys(directUpdates).length > 0) {
        // Convert publishedAt string to Date if needed
        if (directUpdates.publishedAt && typeof directUpdates.publishedAt === 'string') {
          directUpdates.publishedAt = new Date(directUpdates.publishedAt)
        }
        await db
          .update(species)
          .set({ ...directUpdates, updatedAt: new Date() })
          .where(eq(species.id, id))
      }

      // If there are fields to save as draft
      if (Object.keys(draftUpdates).length > 0) {
        const currentDraft = existing[0].draftData || {}
        await db
          .update(species)
          .set({
            hasDraft: true,
            draftData: { ...currentDraft, ...draftUpdates },
            draftCreatedAt: existing[0].hasDraft ? existing[0].draftCreatedAt : new Date(),
            updatedAt: new Date(),
          })
          .where(eq(species.id, id))
      }
    } else {
      // If it's draft or we're skipping draft creation, update directly
      const updateData = { ...data }
      
      // Convert publishedAt string to Date if needed
      if (updateData.publishedAt && typeof updateData.publishedAt === 'string') {
        updateData.publishedAt = new Date(updateData.publishedAt)
      }
      
      const [updatedSpecies] = await db
        .update(species)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(species.id, id))
        .returning()

      return updatedSpecies
    }
  }

  static async delete(id: number) {
    const speciesRecord = await this.findById(id)
    if (!speciesRecord) throw new Error('Species not found')

    // Delete species directly
    await db.delete(species).where(eq(species.id, id))
  }

  static async count() {
    const result = await db.select({ count: count() }).from(species)
    return Number(result[0]?.count || 0)
  }

  static async getStats() {
    try {
      const totalResult = await db.select({ count: count() }).from(species)

      return {
        total: Number(totalResult[0]?.count || 0),
        byStatus: [],
        byKingdom: [],
        byConservation: [],
      }
    } catch (error) {
      console.error('Error in getStats:', error)
      return {
        total: 0,
        byStatus: [],
        byKingdom: [],
        byConservation: [],
      }
    }
  }

  static async findByIdWithDetails(id: number): Promise<SpeciesWithDetails | null> {
    const speciesRecord = await this.findById(id)
    if (!speciesRecord) return null

    // Check for lock
    const lockKey = `species:${id}:lock`
    const lockData = await this.getLockData(lockKey)

    let lock = null
    if (lockData) {
      const lockUser = await db
        .select({
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, lockData.userId))
        .limit(1)

      if (lockUser[0]) {
        lock = {
          userId: lockData.userId,
          userName: lockUser[0].fullName || 'Usuario desconocido',
          userEmail: lockUser[0].email || '',
          lockedAt: new Date(lockData.lockedAt),
        }
      }
    }

    // Avoid spread operator to prevent "Cannot convert undefined or null to object" error
    const result: SpeciesWithDetails = Object.assign({}, speciesRecord, {
      lock,
    })

    return result
  }

  static async acquireLock(id: number, userId: number): Promise<boolean> {
    const lockKey = `species:${id}:lock`
    const existingLock = await this.getLockData(lockKey)

    if (existingLock && existingLock.userId !== userId) {
      return false
    }

    await this.setLockData(lockKey, {
      userId,
      lockedAt: new Date().toISOString(),
    })

    return true
  }

  static async releaseLock(id: number, userId: number): Promise<boolean> {
    const lockKey = `species:${id}:lock`
    const existingLock = await this.getLockData(lockKey)

    if (existingLock && existingLock.userId === userId) {
      await this.deleteLockData(lockKey)
      return true
    }

    return false
  }

  static async checkLock(id: number): Promise<{ isLocked: boolean; lockedBy?: number }> {
    const lockKey = `species:${id}:lock`
    const lockData = await this.getLockData(lockKey)

    if (lockData) {
      return { isLocked: true, lockedBy: lockData.userId }
    }

    return { isLocked: false }
  }

  // Helper methods for lock data (using in-memory storage for now)
  private static lockStore = new Map<string, { userId: number; lockedAt: string }>()

  private static async getLockData(key: string): Promise<{ userId: number; lockedAt: string } | undefined> {
    return this.lockStore.get(key)
  }

  private static async setLockData(key: string, data: { userId: number; lockedAt: string }): Promise<void> {
    this.lockStore.set(key, data)
  }

  private static async deleteLockData(key: string): Promise<void> {
    this.lockStore.delete(key)
  }

  static async publishDraft(id: number) {
    // Get draft-related fields
    const existing = await db
      .select({
        status: species.status,
        hasDraft: species.hasDraft,
        draftData: species.draftData,
      })
      .from(species)
      .where(eq(species.id, id))
      .limit(1)

    // Check if draft exists
    if (!existing[0] || !existing[0].hasDraft) throw new Error('No hay borrador para publicar')

    const draftData = existing[0].draftData as Partial<Species>

    // Update species with draft data, skip draft creation since we're publishing
    await this.update(
      id,
      {
        ...draftData,
        status: 'published',
        publishedAt: new Date(),
      },
      0,
      true, // skipDraftCreation = true
    )

    // Clear draft
    await db
      .update(species)
      .set({
        hasDraft: false,
        draftData: null,
        draftCreatedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(species.id, id))
  }

  static async discardDraft(id: number) {
    const existing = await db
      .select({
        id: species.id,
      })
      .from(species)
      .where(eq(species.id, id))
      .limit(1)

    if (!existing[0]) throw new Error('Especie no encontrada')

    await db
      .update(species)
      .set({
        hasDraft: false,
        draftData: null,
        draftCreatedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(species.id, id))
  }

  static async getPreviewData(id: number) {
    const speciesWithDetails = await this.findByIdWithDetails(id)
    if (!speciesWithDetails) return null

    // If has draft, merge draft data
    const data =
      speciesWithDetails.hasDraft && speciesWithDetails.draftData
        ? { ...speciesWithDetails, ...speciesWithDetails.draftData }
        : speciesWithDetails

    // Get image URLs from galleryImages
    const imageUrls = data.galleryImages?.map((img: { url: string }) => img.url) || []

    // Return in PublicDetailSpecie format
    const result: any = {
      scientificName: data.scientificName || '',
      commonName: data.commonName || '',
      family: data.family || '',
      order: data.order || '',
      class: data.class || '',
      phylum: data.phylum || '',
      kingdom: data.kingdom || '',
      mainGroup: data.mainGroup || '',
      specificCategory: data.specificCategory || '',
      conservationStatus: data.conservationStatus,
      habitat: data.habitat || '',
      distribution: typeof data.distribution === 'string' ? data.distribution : '',
      description: data.description || '',
      distinctiveFeatures: typeof data.distinctiveFeatures === 'string' ? data.distinctiveFeatures : '',
      images: imageUrls,
      mainImageUrl: data.mainImage?.url || null,
      richContent: data.richContent,
      references: data.references,
      publishedAt: data.publishedAt || new Date(),
    }

    // Add preview-specific data
    result._isPreview = true
    result._hasDraft = speciesWithDetails.hasDraft
    result._status = speciesWithDetails.status

    return result
  }
}
