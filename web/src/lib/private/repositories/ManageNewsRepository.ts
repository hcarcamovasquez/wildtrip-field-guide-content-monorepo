import { desc, eq, or, ilike, sql, count } from 'drizzle-orm'

import { db } from '../../db/config'
import { news, users, mediaGallery } from '../../db/schema'
import type { NewNews, News } from '../../db/schema'

export interface NewsWithDetails extends News {
  lockOwner?: {
    id: number
    fullName: string | null
    username: string | null
    email: string
  } | null
}

export class ManageNewsRepository {
  static async count() {
    const result = await db.select({ value: count() }).from(news)
    return Number(result[0]?.value || 0)
  }

  static async findAll(
    options: {
      page?: number
      limit?: number
      search?: string
      status?: string
      category?: string
      sortBy?: 'createdAt' | 'updatedAt' | 'title'
      sortOrder?: 'asc' | 'desc'
    } = {},
  ) {
    const { page = 1, limit = 20, search, status, category, sortBy = 'updatedAt', sortOrder = 'desc' } = options

    const offset = (page - 1) * limit

    // Build conditions
    const conditions = []

    if (search) {
      conditions.push(
        or(ilike(news.title, `%${search}%`), ilike(news.summary, `%${search}%`), ilike(news.author, `%${search}%`)),
      )
    }

    if (status && status !== 'all') {
      conditions.push(eq(news.status, status as 'draft' | 'published' | 'archived'))
    }

    if (category && category !== 'all') {
      conditions.push(eq(news.category, category as 'education' | 'conservation' | 'research' | 'current_events'))
    }

    // Build where clause
    const whereClause =
      conditions.length > 0
        ? conditions.reduce((acc, condition) => (acc ? sql`${acc} AND ${condition}` : condition))
        : undefined

    // Apply sorting
    const orderColumn = news[sortBy] || news.updatedAt
    const orderDirection = sortOrder === 'desc' ? desc(orderColumn) : orderColumn

    // Get paginated results
    const results = await db
      .select({
        news: news,
      })
      .from(news)
      .where(whereClause)
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset)

    // Get total count for pagination using the same where clause
    const countResult = await db.select({ value: count() }).from(news).where(whereClause)

    const total = Number(countResult[0]?.value || 0)

    // Return news items directly
    const newsWithDetails = results.map((item) => item.news)

    return {
      data: newsWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  static async findById(id: number): Promise<NewsWithDetails | null> {
    const result = await db
      .select({
        // News fields
        id: news.id,
        title: news.title,
        slug: news.slug,
        category: news.category,
        author: news.author,
        summary: news.summary,
        content: news.content,
        mainImage: news.mainImage,
        tags: news.tags,
        status: news.status,
        publishedAt: news.publishedAt,
        createdAt: news.createdAt,
        updatedAt: news.updatedAt,
        // Draft fields
        hasDraft: news.hasDraft,
        draftData: news.draftData,
        draftCreatedAt: news.draftCreatedAt,
        // Lock fields
        lockedBy: news.lockedBy,
        lockedAt: news.lockedAt,
        lockExpiresAt: news.lockExpiresAt,
        // Lock owner fields
        lockOwnerId: users.id,
        lockOwnerFullName: users.fullName,
        lockOwnerUsername: users.username,
        lockOwnerEmail: users.email,
      })
      .from(news)
      .leftJoin(users, eq(news.lockedBy, users.id))
      .where(eq(news.id, id))
      .limit(1)

    if (result.length === 0) return null

    const row = result[0]

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      category: row.category,
      author: row.author,
      summary: row.summary,
      content: row.content,
      mainImage: row.mainImage,
      tags: row.tags,
      status: row.status,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      hasDraft: row.hasDraft,
      draftData: row.draftData,
      draftCreatedAt: row.draftCreatedAt,
      lockedBy: row.lockedBy,
      lockedAt: row.lockedAt,
      lockExpiresAt: row.lockExpiresAt,
      lockOwner: row.lockOwnerId
        ? {
            id: row.lockOwnerId,
            fullName: row.lockOwnerFullName,
            username: row.lockOwnerUsername,
            email: row.lockOwnerEmail!,
          }
        : null,
    }
  }

  static async create(data: Omit<NewNews, 'id' | 'createdAt' | 'updatedAt'>) {
    // Create news directly
    const [newsRecord] = await db.insert(news).values(data).returning()

    return newsRecord
  }

  static async update(id: number, data: Partial<News>) {
    // Only get the fields needed for update logic
    const existing = await db
      .select({
        id: news.id,
        status: news.status,
        hasDraft: news.hasDraft,
        draftData: news.draftData,
        draftCreatedAt: news.draftCreatedAt,
      })
      .from(news)
      .where(eq(news.id, id))
      .limit(1)

    if (!existing[0]) throw new Error('Noticia no encontrada')

    // Si el contenido está publicado, guardar cambios como draft
    if (existing[0].status === 'published') {
      // Actualizar solo los campos permitidos directamente en la noticia
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

      // Si hay campos para actualizar directamente
      if (Object.keys(directUpdates).length > 0) {
        await db
          .update(news)
          .set({ ...directUpdates, updatedAt: new Date() })
          .where(eq(news.id, id))
      }

      // Si hay campos para guardar como draft
      if (Object.keys(draftUpdates).length > 0) {
        const currentDraft = existing[0].draftData || {}
        await db
          .update(news)
          .set({
            hasDraft: true,
            draftData: { ...currentDraft, ...draftUpdates },
            draftCreatedAt: existing[0].hasDraft ? existing[0].draftCreatedAt : new Date(),
          })
          .where(eq(news.id, id))
      }
    } else {
      // Si es borrador, actualizar directamente
      const [updatedNews] = await db
        .update(news)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(news.id, id))
        .returning()

      return updatedNews
    }

    return existing[0]
  }

  static async delete(id: number) {
    // Check if news exists
    const existing = await db.select({ id: news.id }).from(news).where(eq(news.id, id)).limit(1)

    if (!existing[0]) throw new Error('Noticia no encontrada')

    // Delete news directly
    await db.delete(news).where(eq(news.id, id))
  }

  static async acquireLock(id: number, userId: number, durationMinutes = 30): Promise<boolean> {
    // Only get the fields we need for lock checking
    const existing = await db
      .select({
        id: news.id,
        lockedBy: news.lockedBy,
        lockExpiresAt: news.lockExpiresAt,
      })
      .from(news)
      .where(eq(news.id, id))
      .limit(1)

    if (!existing[0]) return false

    const now = new Date()
    const lockExpiry = new Date(now.getTime() + durationMinutes * 60000)

    // Check if already locked by another user
    if (existing[0].lockedBy && existing[0].lockedBy !== userId && existing[0].lockExpiresAt) {
      if (new Date(existing[0].lockExpiresAt) > now) {
        return false // Still locked by another user
      }
    }

    // Acquire or renew lock
    await db
      .update(news)
      .set({
        lockedBy: userId,
        lockedAt: now,
        lockExpiresAt: lockExpiry,
      })
      .where(eq(news.id, id))

    return true
  }

  static async releaseLock(id: number, userId: number) {
    // Only get the fields we need
    const existing = await db
      .select({
        id: news.id,
        lockedBy: news.lockedBy,
      })
      .from(news)
      .where(eq(news.id, id))
      .limit(1)

    if (!existing[0]) return

    // Only release if locked by the same user
    if (existing[0].lockedBy === userId) {
      await db
        .update(news)
        .set({
          lockedBy: null,
          lockedAt: null,
          lockExpiresAt: null,
        })
        .where(eq(news.id, id))
    }
  }

  static async publishDraft(id: number) {
    // Only get draft-related fields
    const existing = await db
      .select({
        id: news.id,
        status: news.status,
        hasDraft: news.hasDraft,
        draftData: news.draftData,
      })
      .from(news)
      .where(eq(news.id, id))
      .limit(1)

    if (!existing[0] || !existing[0].hasDraft) throw new Error('No hay borrador para publicar')

    const draftData = existing[0].draftData as Partial<News>

    // Update news with draft data and clear draft
    await db
      .update(news)
      .set({
        ...draftData,
        status: 'published',
        publishedAt: new Date(),
        hasDraft: false,
        draftData: null,
        draftCreatedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(news.id, id))
  }

  static async discardDraft(id: number) {
    // Check if news exists
    const existing = await db
      .select({
        id: news.id,
      })
      .from(news)
      .where(eq(news.id, id))
      .limit(1)

    if (!existing[0]) throw new Error('Noticia no encontrada')

    await db
      .update(news)
      .set({
        hasDraft: false,
        draftData: null,
        draftCreatedAt: null,
      })
      .where(eq(news.id, id))
  }

  static async uploadFeaturedImage(
    newsId: number,
    imageUrl: string,
    imageData: {
      filename: string
      originalFilename: string
      mimeType: string
      size: number
      uploadedBy: string
      uploadedByName: string
    },
  ) {
    // Only check if news exists
    const existing = await db
      .select({ id: news.id, status: news.status, hasDraft: news.hasDraft, draftData: news.draftData })
      .from(news)
      .where(eq(news.id, newsId))
      .limit(1)

    if (!existing[0]) throw new Error('Noticia no encontrada')

    // Save to media gallery
    const [newImage] = await db
      .insert(mediaGallery)
      .values({
        url: imageUrl,
        filename: imageData.filename,
        originalFilename: imageData.originalFilename,
        mimeType: imageData.mimeType,
        size: imageData.size,
        type: 'image',
        uploadedBy: imageData.uploadedBy,
        uploadedByName: imageData.uploadedByName,
      })
      .returning()

    // Create the mainImage JSON object
    const mainImageData = {
      id: crypto.randomUUID(),
      url: imageUrl,
      galleryId: newImage.id,
    }

    // If published, save to draft; otherwise update directly
    if (existing[0].status === 'published') {
      // Get current draft data
      const currentDraft = existing[0].draftData || {}
      await db
        .update(news)
        .set({
          hasDraft: true,
          draftData: { ...currentDraft, mainImage: mainImageData },
          draftCreatedAt: existing[0].hasDraft ? undefined : new Date(),
        })
        .where(eq(news.id, newsId))
    } else {
      // Update news directly with JSON data
      await db
        .update(news)
        .set({
          mainImage: mainImageData,
          updatedAt: new Date(),
        })
        .where(eq(news.id, newsId))
    }

    return imageUrl
  }

  static async checkLockForImageUpload(
    newsId: number,
    userId: number,
  ): Promise<{
    exists: boolean
    lockedByAnother: boolean
    newsData?: {
      id: number
      lockedBy: number | null
    }
  }> {
    const result = await db
      .select({
        id: news.id,
        lockedBy: news.lockedBy,
      })
      .from(news)
      .where(eq(news.id, newsId))
      .limit(1)

    if (!result[0]) {
      return { exists: false, lockedByAnother: false }
    }

    const lockedByAnother = result[0].lockedBy !== null && result[0].lockedBy !== userId

    return {
      exists: true,
      lockedByAnother,
      newsData: result[0],
    }
  }
}
