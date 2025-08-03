import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { protectedAreas } from '../../db/schema';
import { eq, desc, ilike, and, or, sql } from 'drizzle-orm';

@Injectable()
export class ProtectedAreasRepository {
  constructor(private dbService: DbService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    region?: string;
    status?: string;
  }) {
    const db = this.dbService.getDb();
    const { page = 1, limit = 20, search, type, region, status } = params;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: any[] = [];

    if (status && ['draft', 'published', 'archived'].includes(status)) {
      conditions.push(
        eq(protectedAreas.status, status as 'draft' | 'published' | 'archived'),
      );
    }

    if (
      type &&
      [
        'national_park',
        'national_reserve',
        'natural_monument',
        'nature_sanctuary',
      ].includes(type)
    ) {
      conditions.push(
        eq(
          protectedAreas.type,
          type as
            | 'national_park'
            | 'national_reserve'
            | 'natural_monument'
            | 'nature_sanctuary',
        ),
      );
    }

    if (region) {
      conditions.push(eq(protectedAreas.region, region));
    }

    if (search) {
      conditions.push(
        or(
          ilike(protectedAreas.name, `%${search}%`),
          ilike(protectedAreas.description, `%${search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(protectedAreas)
      .where(whereClause);

    // Get data
    const data = await db
      .select()
      .from(protectedAreas)
      .where(whereClause)
      .orderBy(desc(protectedAreas.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findById(id: number, includeDraft: boolean = false) {
    const db = this.dbService.getDb();
    const [result] = await db
      .select()
      .from(protectedAreas)
      .where(eq(protectedAreas.id, id));

    // Log draft data for debugging
    if (result && result.draftData) {
      console.log('Protected Areas findById - Draft data:', {
        id,
        hasDraft: result.hasDraft,
        draftData: result.draftData,
        mainImage: result.draftData.mainImage,
        galleryImages: result.draftData.galleryImages,
      });
    }

    // If includeDraft is true and there's draft data, merge it with the published data
    if (includeDraft && result && result.hasDraft && result.draftData) {
      return {
        ...result,
        ...result.draftData,
        isDraft: true,
      };
    }

    return result;
  }

  async findBySlug(slug: string) {
    const db = this.dbService.getDb();
    const [result] = await db
      .select()
      .from(protectedAreas)
      .where(eq(protectedAreas.slug, slug));
    return result;
  }

  async create(data: any) {
    const db = this.dbService.getDb();
    const [result] = await db.insert(protectedAreas).values(data).returning();
    return result;
  }

  async update(id: number, data: any) {
    const db = this.dbService.getDb();
    const [result] = await db
      .update(protectedAreas)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(protectedAreas.id, id))
      .returning();
    return result;
  }

  async delete(id: number) {
    const db = this.dbService.getDb();
    await db.delete(protectedAreas).where(eq(protectedAreas.id, id));
  }

  async publish(id: number) {
    const db = this.dbService.getDb();
    const [current] = await db
      .select()
      .from(protectedAreas)
      .where(eq(protectedAreas.id, id));

    if (!current) {
      throw new Error('Protected area not found');
    }

    // Si hay draft data, publicar el draft
    if (current.draftData) {
      const [result] = await db
        .update(protectedAreas)
        .set({
          ...current.draftData,
          draftData: null,
          hasDraft: false,
          draftCreatedAt: null,
          status: 'published' as const,
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(protectedAreas.id, id))
        .returning();

      return result;
    }
    // Si no hay draft pero está en borrador, simplemente publicar
    else if (current.status === 'draft') {
      const [result] = await db
        .update(protectedAreas)
        .set({
          status: 'published' as const,
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(protectedAreas.id, id))
        .returning();

      return result;
    }

    // Si ya está publicado y no hay draft, no hay nada que publicar
    throw new Error('Nothing to publish');
  }

  async createDraft(id: number, draftData: any) {
    const db = this.dbService.getDb();
    const [current] = await db
      .select()
      .from(protectedAreas)
      .where(eq(protectedAreas.id, id));

    if (!current) {
      throw new Error('Protected area not found');
    }

    // Merge with existing draft data (if any) instead of current data
    const existingDraft = current.draftData || {};
    const updatedDraft = {
      ...existingDraft,
      ...draftData,
    };

    // Log what we're saving for debugging
    console.log('Creating/updating protected area draft with data:', {
      id,
      draftData,
      existingDraft,
      updatedDraft,
      mainImage: updatedDraft.mainImage,
      galleryImages: updatedDraft.galleryImages,
    });

    const [result] = await db
      .update(protectedAreas)
      .set({
        draftData: updatedDraft,
        hasDraft: true,
        draftCreatedAt: current.draftCreatedAt || new Date(),
        updatedAt: new Date(),
      })
      .where(eq(protectedAreas.id, id))
      .returning();

    return result;
  }

  async discardDraft(id: number) {
    const db = this.dbService.getDb();
    const [result] = await db
      .update(protectedAreas)
      .set({
        draftData: null,
        hasDraft: false,
        draftCreatedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(protectedAreas.id, id))
      .returning();

    return result;
  }
}
