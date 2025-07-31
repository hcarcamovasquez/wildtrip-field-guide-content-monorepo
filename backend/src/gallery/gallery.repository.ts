import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { mediaGallery, mediaFolders } from '../db/schema';
import { eq, desc, ilike, and, or, sql, isNull, inArray } from 'drizzle-orm';

type MediaWithFolder = {
  media_gallery: typeof mediaGallery.$inferSelect;
  media_folders: typeof mediaFolders.$inferSelect | null;
};

@Injectable()
export class GalleryRepository {
  constructor(private dbService: DbService) {}

  // Media Gallery Methods
  async findAllMedia(params: {
    page?: number;
    limit?: number;
    search?: string;
    folderId?: number;
    folderPath?: string;
    uploadedBy?: string;
    type?: string;
  }) {
    const db = this.dbService.getDb();
    const { page = 1, limit = 50, search, folderId, folderPath, uploadedBy, type } = params;
    const offset = (page - 1) * limit;

    // Build where conditions for media
    const mediaConditions: any[] = [];

    // Filter by folder - only show items in current folder (not subfolders)
    // If folderId is not provided, default to showing root items (folderId = null)
    if (folderId !== undefined) {
      mediaConditions.push(folderId === null ? isNull(mediaGallery.folderId) : eq(mediaGallery.folderId, folderId));
    } else {
      // Default to root directory when no folderId is specified
      mediaConditions.push(isNull(mediaGallery.folderId));
    }

    if (folderPath) {
      mediaConditions.push(eq(mediaGallery.folderPath, folderPath));
    }

    if (uploadedBy) {
      mediaConditions.push(eq(mediaGallery.uploadedBy, uploadedBy));
    }

    if (type && (type === 'image' || type === 'video')) {
      mediaConditions.push(eq(mediaGallery.type, type));
    }

    if (search) {
      mediaConditions.push(
        or(
          ilike(mediaGallery.filename, `%${search}%`),
          ilike(mediaGallery.title, `%${search}%`),
          ilike(mediaGallery.description, `%${search}%`)
        )
      );
    }

    const mediaWhereClause = mediaConditions.length > 0 ? and(...mediaConditions) : undefined;

    // Get folders in current directory
    const folderConditions: any[] = [];
    if (folderId !== undefined) {
      folderConditions.push(folderId === null ? isNull(mediaFolders.parentId) : eq(mediaFolders.parentId, folderId));
    } else {
      // Default to root directory when no folderId is specified
      folderConditions.push(isNull(mediaFolders.parentId));
    }
    
    if (search) {
      folderConditions.push(ilike(mediaFolders.name, `%${search}%`));
    }

    const folderWhereClause = folderConditions.length > 0 ? and(...folderConditions) : undefined;

    // Get total counts first
    const [{ totalFolderCount }] = await db
      .select({ totalFolderCount: sql<number>`count(*)::int` })
      .from(mediaFolders)
      .where(folderWhereClause);

    const [{ totalMediaCount }] = await db
      .select({ totalMediaCount: sql<number>`count(*)::int` })
      .from(mediaGallery)
      .where(mediaWhereClause);

    // Get folders (always show all folders on current page)
    const folders = await db
      .select({
        folder: mediaFolders,
        fileCount: sql<number>`(
          SELECT COUNT(*)::int FROM media_gallery 
          WHERE media_gallery.folder_id = media_folders.id
        )`,
        folderCount: sql<number>`(
          SELECT COUNT(*)::int FROM media_folders AS subfolders 
          WHERE subfolders.parent_id = media_folders.id
        )`,
      })
      .from(mediaFolders)
      .where(folderWhereClause)
      .orderBy(mediaFolders.name);

    // Calculate pagination for mixed content
    const itemsToSkip = (page - 1) * limit;
    const foldersCount = folders.length;
    
    // Determine which items to show on this page
    let pageFolders: typeof folders = [];
    let pageMedia: MediaWithFolder[] = [];
    
    if (itemsToSkip < foldersCount) {
      // We're still in the folders section
      pageFolders = folders.slice(itemsToSkip, itemsToSkip + limit);
      const remainingLimit = limit - pageFolders.length;
      
      if (remainingLimit > 0) {
        // Get some media items too
        pageMedia = await db
          .select()
          .from(mediaGallery)
          .leftJoin(mediaFolders, eq(mediaGallery.folderId, mediaFolders.id))
          .where(mediaWhereClause)
          .orderBy(desc(mediaGallery.createdAt))
          .limit(remainingLimit)
          .offset(0);
      }
    } else {
      // We're in the media section
      const mediaOffset = itemsToSkip - foldersCount;
      pageMedia = await db
        .select()
        .from(mediaGallery)
        .leftJoin(mediaFolders, eq(mediaGallery.folderId, mediaFolders.id))
        .where(mediaWhereClause)
        .orderBy(desc(mediaGallery.createdAt))
        .limit(limit)
        .offset(mediaOffset);
    }

    // Combine folders and media
    const combinedData = [
      ...pageFolders.map(f => ({
        ...f.folder,
        type: 'folder' as const,
        fileCount: f.fileCount,
        folderCount: f.folderCount,
      })),
      ...pageMedia.map(row => ({
        ...row.media_gallery,
        type: row.media_gallery.type as 'image' | 'video',
        folder: row.media_folders,
      })),
    ];

    return {
      data: combinedData,
      pagination: {
        page,
        limit,
        total: totalFolderCount + totalMediaCount,
        totalPages: Math.ceil((totalFolderCount + totalMediaCount) / limit),
      },
      stats: {
        totalFolders: totalFolderCount,
        totalFiles: totalMediaCount,
      },
    };
  }

  // Images-only method for MediaPickerModal
  async findImagesOnly(params: {
    page?: number;
    limit?: number;
    search?: string;
    uploadedBy?: string;
    type?: string;
  }) {
    const db = this.dbService.getDb();
    const { page = 1, limit = 50, search, uploadedBy, type } = params;
    const offset = (page - 1) * limit;

    // Build where conditions for media only (no folders)
    const mediaConditions: any[] = [];

    if (uploadedBy) {
      mediaConditions.push(eq(mediaGallery.uploadedBy, uploadedBy));
    }

    // Default to images only, but allow override
    if (type && (type === 'image' || type === 'video')) {
      mediaConditions.push(eq(mediaGallery.type, type));
    } else {
      // Default to images only
      mediaConditions.push(eq(mediaGallery.type, 'image'));
    }

    if (search) {
      mediaConditions.push(
        or(
          ilike(mediaGallery.filename, `%${search}%`),
          ilike(mediaGallery.title, `%${search}%`),
          ilike(mediaGallery.description, `%${search}%`)
        )
      );
    }

    const mediaWhereClause = mediaConditions.length > 0 ? and(...mediaConditions) : undefined;

    // Get total count
    const [{ totalCount }] = await db
      .select({ totalCount: sql<number>`count(*)::int` })
      .from(mediaGallery)
      .where(mediaWhereClause);

    // Get paginated images
    const images = await db
      .select({
        id: mediaGallery.id,
        filename: mediaGallery.filename,
        url: mediaGallery.url,
        title: mediaGallery.title,
        altText: mediaGallery.altText,
        width: mediaGallery.width,
        height: mediaGallery.height,
        size: mediaGallery.size,
        uploadedAt: mediaGallery.createdAt,
      })
      .from(mediaGallery)
      .where(mediaWhereClause)
      .orderBy(desc(mediaGallery.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      items: images,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findMediaById(id: number) {
    const db = this.dbService.getDb();
    const [result] = await db
      .select()
      .from(mediaGallery)
      .leftJoin(mediaFolders, eq(mediaGallery.folderId, mediaFolders.id))
      .where(eq(mediaGallery.id, id));
    
    if (!result) return null;
    
    return {
      ...result.media_gallery,
      folder: result.media_folders,
    };
  }

  async findMediaByIds(ids: number[]) {
    const db = this.dbService.getDb();
    const results = await db
      .select()
      .from(mediaGallery)
      .where(inArray(mediaGallery.id, ids));
    
    return results;
  }

  async createMedia(data: any) {
    const db = this.dbService.getDb();
    const [result] = await db.insert(mediaGallery).values(data).returning();
    return result;
  }

  async updateMedia(id: number, data: any) {
    const db = this.dbService.getDb();
    const [result] = await db
      .update(mediaGallery)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(mediaGallery.id, id))
      .returning();
    return result;
  }

  async deleteMedia(id: number) {
    const db = this.dbService.getDb();
    await db.delete(mediaGallery).where(eq(mediaGallery.id, id));
  }

  async deleteMediaBatch(ids: number[]) {
    const db = this.dbService.getDb();
    await db.delete(mediaGallery).where(inArray(mediaGallery.id, ids));
  }

  // Media Folders Methods
  async findAllFolders() {
    const db = this.dbService.getDb();
    return db.select().from(mediaFolders).orderBy(mediaFolders.path);
  }

  async findFolderById(id: number) {
    const db = this.dbService.getDb();
    const [result] = await db.select().from(mediaFolders).where(eq(mediaFolders.id, id));
    return result;
  }

  async findFolderBySlug(slug: string) {
    const db = this.dbService.getDb();
    const [result] = await db.select().from(mediaFolders).where(eq(mediaFolders.slug, slug));
    return result;
  }

  async createFolder(data: any) {
    const db = this.dbService.getDb();
    const [result] = await db.insert(mediaFolders).values(data).returning();
    return result;
  }

  async updateFolder(id: number, data: any) {
    const db = this.dbService.getDb();
    const [result] = await db
      .update(mediaFolders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(mediaFolders.id, id))
      .returning();
    return result;
  }

  async deleteFolder(id: number) {
    const db = this.dbService.getDb();
    await db.delete(mediaFolders).where(eq(mediaFolders.id, id));
  }

  async moveMediaToFolder(mediaIds: number[], folderId: number | null) {
    const db = this.dbService.getDb();
    
    // Get folder path if folderId is provided
    let folderPath: string | null = null;
    if (folderId) {
      const folder = await this.findFolderById(folderId);
      if (folder) {
        folderPath = folder.path;
      }
    }

    await db
      .update(mediaGallery)
      .set({
        folderId,
        folderPath,
        updatedAt: new Date(),
      })
      .where(inArray(mediaGallery.id, mediaIds));
  }
}