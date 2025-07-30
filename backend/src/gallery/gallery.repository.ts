import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { mediaGallery, mediaFolders } from '../db/schema';
import { eq, desc, ilike, and, or, sql, isNull, inArray } from 'drizzle-orm';

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

    // Build where conditions
    const conditions: any[] = [];

    if (folderId !== undefined) {
      conditions.push(folderId === null ? isNull(mediaGallery.folderId) : eq(mediaGallery.folderId, folderId));
    }

    if (folderPath) {
      conditions.push(eq(mediaGallery.folderPath, folderPath));
    }

    if (uploadedBy) {
      conditions.push(eq(mediaGallery.uploadedBy, uploadedBy));
    }

    if (type && (type === 'image' || type === 'video')) {
      conditions.push(eq(mediaGallery.type, type));
    }

    if (search) {
      conditions.push(
        or(
          ilike(mediaGallery.filename, `%${search}%`),
          ilike(mediaGallery.title, `%${search}%`),
          ilike(mediaGallery.description, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(mediaGallery)
      .where(whereClause);

    // Get data with folder info
    const data = await db
      .select()
      .from(mediaGallery)
      .leftJoin(mediaFolders, eq(mediaGallery.folderId, mediaFolders.id))
      .where(whereClause)
      .orderBy(desc(mediaGallery.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: data.map(row => ({
        ...row.media_gallery,
        folder: row.media_folders,
      })),
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
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