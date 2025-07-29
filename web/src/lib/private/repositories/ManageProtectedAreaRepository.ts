import { and, count, desc, eq, ilike, inArray, or } from 'drizzle-orm'

import { db } from '@/lib/db/config'
import { protectedAreas, users } from '@/lib/db/schema'
import type { ProtectedArea } from '@/lib/db/schema'
import type { RichContent } from '@/lib/db/schema'
import type { User } from '@/lib/db/schema'

export interface ProtectedAreaWithBase extends ProtectedArea {
  lockOwner: Pick<User, 'id' | 'email' | 'fullName' | 'username'> | null
}

export interface ProtectedAreaFilters {
  search?: string
  type?: string
  status?: string
  region?: string
  page?: number
  limit?: number
}

interface CreateProtectedAreaData {
  name: string
  slug: string
  type: 'national_park' | 'national_reserve' | 'natural_monument' | 'nature_sanctuary'
  description?: string
  userId: number
}

interface UpdateProtectedAreaData {
  name?: string
  slug?: string
  type?: 'national_park' | 'national_reserve' | 'natural_monument' | 'nature_sanctuary'
  location?: Record<string, unknown>
  area?: number
  creationYear?: number
  description?: string
  ecosystems?: string[]
  keySpecies?: number[]
  visitorInformation?: {
    schedule?: string
    contact?: string
    entranceFee?: string
    facilities?: string[]
  }
  richContent?: RichContent
  region?: string
  status?: 'draft' | 'published' | 'archived'
  mainImage?: {
    id: string
    url: string
    galleryId: number
  }
  galleryImages?: Array<{
    id: string
    url: string
    galleryId: number
  }>
  userId: number
}

export class ManageProtectedAreaRepository {
  static async count() {
    const result = await db.select({ count: count() }).from(protectedAreas)
    return result[0]?.count || 0
  }

  static async findAll(filters: ProtectedAreaFilters = {}) {
    const { search, type, status, region, page = 1, limit = 10 } = filters
    const offset = (page - 1) * limit

    const whereConditions = []

    if (search) {
      whereConditions.push(
        or(ilike(protectedAreas.name, `%${search}%`), ilike(protectedAreas.description, `%${search}%`)),
      )
    }

    if (type) {
      whereConditions.push(
        eq(protectedAreas.type, type as 'national_park' | 'national_reserve' | 'natural_monument' | 'nature_sanctuary'),
      )
    }

    if (status) {
      whereConditions.push(eq(protectedAreas.status, status as 'draft' | 'published' | 'archived'))
    }

    if (region) {
      whereConditions.push(eq(protectedAreas.region, region))
    }

    const condition = whereConditions.length > 0 ? and(...whereConditions) : undefined

    // Get total count
    const totalResult = await db.select({ count: count() }).from(protectedAreas).where(condition)

    const total = totalResult[0]?.count || 0

    // Get protected areas
    const results = await db
      .select({
        id: protectedAreas.id,
        name: protectedAreas.name,
        slug: protectedAreas.slug,
        type: protectedAreas.type,
        status: protectedAreas.status,
        area: protectedAreas.area,
        creationYear: protectedAreas.creationYear,
        description: protectedAreas.description,
        region: protectedAreas.region,
        mainImage: protectedAreas.mainImage,
        updatedAt: protectedAreas.updatedAt,
        hasDraft: protectedAreas.hasDraft,
        draftData: protectedAreas.draftData,
        draftCreatedAt: protectedAreas.draftCreatedAt,
        lockedBy: protectedAreas.lockedBy,
        lockExpiresAt: protectedAreas.lockExpiresAt,
      })
      .from(protectedAreas)
      .where(condition)
      .orderBy(desc(protectedAreas.updatedAt))
      .limit(limit)
      .offset(offset)

    // Get lock owners if any
    const lockedByIds = results.map((r) => r.lockedBy).filter((id): id is number => id !== null)

    const lockOwnersMap = new Map<number, Pick<User, 'id' | 'email' | 'fullName' | 'username'>>()
    if (lockedByIds.length > 0) {
      const lockOwners = await db
        .select({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          username: users.username,
        })
        .from(users)
        .where(inArray(users.id, lockedByIds))

      lockOwners.forEach((user) => {
        lockOwnersMap.set(user.id, user)
      })
    }

    // Map results with lock owner data
    const items = results.map((area) => {
      return {
        ...area,
        mainImageUrl: area.mainImage?.url || null,
        lockOwner: area.lockedBy ? lockOwnersMap.get(area.lockedBy) || null : null,
      }
    })

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  static async findById(id: number): Promise<ProtectedAreaWithBase | null> {
    const [area] = await db.select().from(protectedAreas).where(eq(protectedAreas.id, id)).limit(1)

    if (!area) return null

    // Get a lock owner if locked
    let lockOwner = null
    if (area.lockedBy) {
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          username: users.username,
        })
        .from(users)
        .where(eq(users.id, area.lockedBy))
        .limit(1)

      lockOwner = user || null
    }

    return {
      ...area,
      lockOwner,
    }
  }

  static async create(data: CreateProtectedAreaData) {
    const [newArea] = await db
      .insert(protectedAreas)
      .values({
        name: data.name,
        slug: data.slug,
        type: data.type,
        description: data.description,
        status: 'draft',
        richContent: {
          blocks: [
            {
              id: 'initial-block',
              type: 'paragraph',
              content: '',
            },
          ],
        },
      })
      .returning()

    return newArea
  }

  static async update(id: number, data: UpdateProtectedAreaData) {
    const area = await this.findById(id)
    if (!area) throw new Error('Área protegida no encontrada')

    // Check if the area is published
    if (area.status === 'published') {
      // Save changes as draft
      const { userId: _userId, ...draftData } = data
      await db
        .update(protectedAreas)
        .set({
          hasDraft: true,
          draftData,
          draftCreatedAt: new Date(),
        })
        .where(eq(protectedAreas.id, id))

      return area
    } else {
      // Update directly
      const { userId: _userId, ...areaData } = data
      const [updatedArea] = await db
        .update(protectedAreas)
        .set({
          ...areaData,
          updatedAt: new Date(),
        })
        .where(eq(protectedAreas.id, id))
        .returning()

      return updatedArea
    }
  }

  static async updateDraft(id: number, draftData: Record<string, unknown>, _userId: number) {
    const area = await this.findById(id)
    if (!area) throw new Error('Área protegida no encontrada')

    await db
      .update(protectedAreas)
      .set({
        hasDraft: true,
        draftData,
        draftCreatedAt: new Date(),
      })
      .where(eq(protectedAreas.id, id))
  }

  static async publishDraft(id: number) {
    const area = await this.findById(id)
    if (!area) throw new Error('Área protegida no encontrada')
    if (!area.hasDraft) throw new Error('No hay borrador para publicar')

    const draft = area.draftData

    // Update protected area with draft data and clear draft fields
    await db
      .update(protectedAreas)
      .set({
        ...draft,
        hasDraft: false,
        draftData: null,
        draftCreatedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(protectedAreas.id, id))
  }

  static async discardDraft(id: number) {
    const area = await this.findById(id)
    if (!area) throw new Error('Área protegida no encontrada')

    await db
      .update(protectedAreas)
      .set({
        hasDraft: false,
        draftData: null,
        draftCreatedAt: null,
      })
      .where(eq(protectedAreas.id, id))
  }

  static async delete(id: number) {
    // Delete protected area
    await db.delete(protectedAreas).where(eq(protectedAreas.id, id))
  }

  static async acquireLock(id: number, userId: number): Promise<boolean> {
    const area = await this.findById(id)
    if (!area) return false

    const now = new Date()
    const lockExpiry = new Date(now.getTime() + 30 * 60 * 1000) // 30 minutes

    // Check if already locked by another user
    if (area.lockedBy && area.lockedBy !== userId && area.lockExpiresAt && area.lockExpiresAt > now) {
      return false
    }

    await db
      .update(protectedAreas)
      .set({
        lockedBy: userId,
        lockedAt: now,
        lockExpiresAt: lockExpiry,
      })
      .where(eq(protectedAreas.id, id))

    return true
  }

  static async releaseLock(id: number, userId: number) {
    const area = await this.findById(id)
    if (!area) return

    // Only release if locked by the same user
    if (area.lockedBy === userId) {
      await db
        .update(protectedAreas)
        .set({
          lockedBy: null,
          lockedAt: null,
          lockExpiresAt: null,
        })
        .where(eq(protectedAreas.id, id))
    }
  }

  static async checkLockForImageUpload(id: number, userId: number) {
    const area = await this.findById(id)

    if (!area) {
      return { exists: false, lockedByAnother: false }
    }

    const now = new Date()
    const lockedByAnother = area.lockedBy && area.lockedBy !== userId && area.lockExpiresAt && area.lockExpiresAt > now

    return {
      exists: true,
      lockedByAnother: !!lockedByAnother,
    }
  }

  static async uploadFeaturedImage(
    id: number,
    imageUrl: string,
    imageData: {
      filename: string
      originalFilename: string
      mimeType: string
      size: number
      uploadedBy?: string
      uploadedByName?: string
      galleryId: number
    },
  ) {
    const area = await this.findById(id)
    if (!area) throw new Error('Área protegida no encontrada')

    // Generate a unique ID for the image
    const imageId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

    // Update protected area with main image data
    await db
      .update(protectedAreas)
      .set({
        mainImage: {
          id: imageId,
          url: imageUrl,
          galleryId: imageData.galleryId,
        },
        updatedAt: new Date(),
      })
      .where(eq(protectedAreas.id, id))

    return {
      id: imageId,
      url: imageUrl,
      galleryId: imageData.galleryId,
    }
  }
}
