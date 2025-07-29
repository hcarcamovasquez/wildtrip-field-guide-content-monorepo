import { eq, and, or, ilike, sql, desc, asc, isNull, count } from 'drizzle-orm'

import { db } from '../../db/config.ts'
import type { MediaGallery, MediaFolder, NewMediaGallery } from '../../db/schema'
import { mediaGallery, mediaFolders } from '../../db/schema'

export interface CreateFolderInput {
  name: string
  parentId?: number | null
  description?: string | null
  color?: string | null
  icon?: string | null
  createdBy?: string | null
  createdByName?: string | null
}

export interface GalleryFilters {
  search?: string
  folderId?: number | null
  type?: 'image' | 'video'
  uploadedBy?: string
  tags?: string[]
  limit?: number
  offset?: number
  sortBy?: 'name' | 'date' | 'size' | 'type'
  sortOrder?: 'asc' | 'desc'
}

export interface FolderWithCount extends MediaFolder {
  fileCount: number
  folderCount: number
}

export interface MediaWithFolder extends MediaGallery {
  folder?: MediaFolder | null
}

export const ManageGalleryRepository = {
  // Folder operations
  async createFolder(data: CreateFolderInput): Promise<MediaFolder> {
    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Calculate path based on parent
    let path = '/'
    let depth = 0

    if (data.parentId) {
      const parent = await this.findFolderById(data.parentId)
      if (parent) {
        path = `${parent.path}${parent.path === '/' ? '' : '/'}${slug}`
        depth = parent.depth + 1
      }
    } else {
      path = `/${slug}`
    }

    const [folder] = await db
      .insert(mediaFolders)
      .values({
        ...data,
        slug,
        path,
        depth,
      })
      .returning()

    return folder
  },

  async updateFolder(id: number, data: Partial<MediaFolder>): Promise<MediaFolder | null> {
    const [updated] = await db.update(mediaFolders).set(data).where(eq(mediaFolders.id, id)).returning()

    return updated || null
  },

  async deleteFolder(id: number): Promise<boolean> {
    // Check if folder is empty (no files or subfolders)
    const hasContent = await db
      .select({ count: count() })
      .from(mediaGallery)
      .where(eq(mediaGallery.folderId, id))
      .then((res) => res[0]?.count || 0)

    if (hasContent > 0) {
      throw new Error('Cannot delete folder with files')
    }

    const hasSubfolders = await db
      .select({ count: count() })
      .from(mediaFolders)
      .where(eq(mediaFolders.parentId, id))
      .then((res) => res[0]?.count || 0)

    if (hasSubfolders > 0) {
      throw new Error('Cannot delete folder with subfolders')
    }

    await db.delete(mediaFolders).where(eq(mediaFolders.id, id))
    return true
  },

  async findFolderById(id: number): Promise<MediaFolder | null> {
    const [folder] = await db.select().from(mediaFolders).where(eq(mediaFolders.id, id)).limit(1)

    return folder || null
  },

  async findFoldersByParent(parentId: number | null): Promise<FolderWithCount[]> {
    const foldersQuery = parentId ? eq(mediaFolders.parentId, parentId) : isNull(mediaFolders.parentId)

    // Get folders first
    const folders = await db.select().from(mediaFolders).where(foldersQuery).orderBy(asc(mediaFolders.name))

    // Then get counts for each folder
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        // Get file count
        const [fileCountResult] = await db
          .select({ count: count() })
          .from(mediaGallery)
          .where(eq(mediaGallery.folderId, folder.id))

        // Get subfolder count
        const [folderCountResult] = await db
          .select({ count: count() })
          .from(mediaFolders)
          .where(eq(mediaFolders.parentId, folder.id))

        return {
          ...folder,
          fileCount: Number(fileCountResult?.count || 0),
          folderCount: Number(folderCountResult?.count || 0),
        }
      }),
    )

    return foldersWithCounts
  },

  async getFolderPath(folderId: number): Promise<MediaFolder[]> {
    const folder = await this.findFolderById(folderId)
    if (!folder) return []

    const pathParts = folder.path.split('/').filter(Boolean)
    const folders: MediaFolder[] = []

    // Build path by traversing up
    let currentPath = ''
    for (const part of pathParts) {
      currentPath += `/${part}`
      const [f] = await db.select().from(mediaFolders).where(eq(mediaFolders.path, currentPath)).limit(1)

      if (f) folders.push(f)
    }

    return folders
  },

  // Media operations
  async createMedia(data: NewMediaGallery): Promise<MediaGallery> {
    // If folder is specified, get folder path
    let folderPath = null
    if (data.folderId) {
      const folder = await this.findFolderById(data.folderId)
      if (folder) {
        folderPath = folder.path
      }
    }

    const [media] = await db
      .insert(mediaGallery)
      .values({
        ...data,
        folderPath,
      })
      .returning()

    return media
  },

  async updateMedia(id: number, data: Partial<MediaGallery>): Promise<MediaGallery | null> {
    // If folder is being updated, update folderPath too
    const updateData = { ...data }
    if (data.folderId !== undefined) {
      if (data.folderId) {
        const folder = await this.findFolderById(data.folderId)
        updateData.folderPath = folder?.path || null
      } else {
        updateData.folderPath = null
      }
    }

    const [updated] = await db.update(mediaGallery).set(updateData).where(eq(mediaGallery.id, id)).returning()

    return updated || null
  },

  async deleteMedia(id: number): Promise<boolean> {
    await db.delete(mediaGallery).where(eq(mediaGallery.id, id))
    return true
  },

  async findMediaById(id: number): Promise<MediaWithFolder | null> {
    const results = await db
      .select({
        media: mediaGallery,
        folder: mediaFolders,
      })
      .from(mediaGallery)
      .leftJoin(mediaFolders, eq(mediaGallery.folderId, mediaFolders.id))
      .where(eq(mediaGallery.id, id))
      .limit(1)

    if (!results[0]) return null

    return {
      ...results[0].media,
      folder: results[0].folder,
    }
  },

  async findMedia(filters: GalleryFilters = {}): Promise<{
    items: MediaWithFolder[]
    total: number
  }> {
    const conditions = []

    // Folder filter
    if (filters.folderId !== undefined) {
      if (filters.folderId === null) {
        conditions.push(isNull(mediaGallery.folderId))
      } else {
        conditions.push(eq(mediaGallery.folderId, filters.folderId))
      }
    }

    // Search filter
    if (filters.search) {
      conditions.push(
        or(
          ilike(mediaGallery.filename, `%${filters.search}%`),
          ilike(mediaGallery.originalFilename, `%${filters.search}%`),
          ilike(mediaGallery.title, `%${filters.search}%`),
          ilike(mediaGallery.description, `%${filters.search}%`),
          ilike(mediaGallery.altText, `%${filters.search}%`),
        ),
      )
    }

    // Type filter
    if (filters.type) {
      conditions.push(eq(mediaGallery.type, filters.type))
    }

    // Uploaded by filter
    if (filters.uploadedBy) {
      conditions.push(eq(mediaGallery.uploadedBy, filters.uploadedBy))
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      conditions.push(sql`${mediaGallery.tags}::jsonb @> ${JSON.stringify(filters.tags)}::jsonb`)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Count total
    const [{ total }] = await db.select({ total: count() }).from(mediaGallery).where(whereClause)

    // Get items with folder info
    const orderColumn =
      filters.sortBy === 'name'
        ? mediaGallery.filename
        : filters.sortBy === 'size'
          ? mediaGallery.size
          : filters.sortBy === 'type'
            ? mediaGallery.type
            : mediaGallery.createdAt

    const orderDirection = filters.sortOrder === 'asc' ? asc : desc

    const items = await db
      .select({
        media: mediaGallery,
        folder: mediaFolders,
      })
      .from(mediaGallery)
      .leftJoin(mediaFolders, eq(mediaGallery.folderId, mediaFolders.id))
      .where(whereClause)
      .orderBy(orderDirection(orderColumn))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0)

    return {
      items: items.map(({ media, folder }) => ({
        ...media,
        folder,
      })),
      total: Number(total),
    }
  },

  async moveMedia(mediaIds: number[], targetFolderId: number | null): Promise<void> {
    let folderPath = null

    if (targetFolderId) {
      const folder = await this.findFolderById(targetFolderId)
      if (!folder) {
        throw new Error('Target folder not found')
      }
      folderPath = folder.path
    }

    await db
      .update(mediaGallery)
      .set({
        folderId: targetFolderId,
        folderPath,
      })
      .where(and(sql`${mediaGallery.id} = ANY(${mediaIds})`))
  },

  async getStorageStats(): Promise<{
    totalSize: number
    totalFiles: number
    totalFolders: number
    byType: { type: string; count: number; size: number }[]
  }> {
    const [stats] = await db
      .select({
        totalSize: sql<number>`COALESCE(SUM(${mediaGallery.size}), 0)`,
        totalFiles: count(),
      })
      .from(mediaGallery)

    const [folderCount] = await db
      .select({
        count: count(),
      })
      .from(mediaFolders)

    const typeStats = await db
      .select({
        type: mediaGallery.type,
        count: count(),
        size: sql<number>`COALESCE(SUM(${mediaGallery.size}), 0)`,
      })
      .from(mediaGallery)
      .groupBy(mediaGallery.type)

    return {
      totalSize: Number(stats.totalSize),
      totalFiles: Number(stats.totalFiles),
      totalFolders: Number(folderCount.count),
      byType: typeStats.map((t) => ({
        type: t.type,
        count: Number(t.count),
        size: Number(t.size),
      })),
    }
  },
}
