import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { species } from '../db/schema';
import { eq, desc, ilike, and, or, sql } from 'drizzle-orm';

@Injectable()
export class SpeciesRepository {
  constructor(private dbService: DbService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    mainGroup?: string;
    status?: string;
  }) {
    const db = this.dbService.getDb();
    const { page = 1, limit = 20, search, mainGroup, status } = params;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: any[] = [];
    
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      conditions.push(eq(species.status, status as 'draft' | 'published' | 'archived'));
    }

    if (mainGroup) {
      const validGroups = ['mammal', 'bird', 'reptile', 'amphibian', 'fish', 'insect', 'arachnid', 'crustacean', 'mollusk', 'plant', 'fungus', 'algae', 'other'];
      if (validGroups.includes(mainGroup)) {
        conditions.push(eq(species.mainGroup, mainGroup as any));
      }
    }

    if (search) {
      conditions.push(
        or(
          ilike(species.commonName, `%${search}%`),
          ilike(species.scientificName, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(species)
      .where(whereClause);

    // Get data
    const data = await db
      .select()
      .from(species)
      .where(whereClause)
      .orderBy(desc(species.createdAt))
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

  async findById(id: number) {
    const db = this.dbService.getDb();
    const [result] = await db.select().from(species).where(eq(species.id, id));
    
    // Log draft data for debugging
    if (result && result.draftData) {
      console.log('Species findById - Draft data:', {
        id,
        hasDraft: result.hasDraft,
        draftData: result.draftData,
        mainImage: result.draftData.mainImage,
        galleryImages: result.draftData.galleryImages
      });
    }
    
    return result;
  }

  async findBySlug(slug: string) {
    const db = this.dbService.getDb();
    const [result] = await db.select().from(species).where(eq(species.slug, slug));
    return result;
  }

  async create(data: any) {
    const db = this.dbService.getDb();
    const [result] = await db.insert(species).values(data).returning();
    return result;
  }

  async update(id: number, data: any) {
    const db = this.dbService.getDb();
    const [result] = await db
      .update(species)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(species.id, id))
      .returning();
    return result;
  }

  async delete(id: number) {
    const db = this.dbService.getDb();
    await db.delete(species).where(eq(species.id, id));
  }

  async publish(id: number) {
    const db = this.dbService.getDb();
    const [current] = await db.select().from(species).where(eq(species.id, id));
    
    if (!current || !current.draftData) {
      throw new Error('No draft content to publish');
    }

    const [result] = await db
      .update(species)
      .set({
        ...current.draftData,
        draftData: null,
        hasDraft: false,
        draftCreatedAt: null,
        status: 'published' as const,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(species.id, id))
      .returning();
    
    return result;
  }

  async createDraft(id: number, draftData: any) {
    const db = this.dbService.getDb();
    const [current] = await db.select().from(species).where(eq(species.id, id));
    
    if (!current) {
      throw new Error('Species not found');
    }

    // Merge with existing draft data (if any) instead of current data
    const existingDraft = current.draftData || {};
    const updatedDraft = {
      ...existingDraft,
      ...draftData,
    };

    // Log what we're saving for debugging
    console.log('Creating/updating draft with data:', {
      id,
      draftData,
      existingDraft,
      updatedDraft,
      mainImage: updatedDraft.mainImage,
      galleryImages: updatedDraft.galleryImages
    });

    const [result] = await db
      .update(species)
      .set({
        draftData: updatedDraft,
        hasDraft: true,
        draftCreatedAt: current.draftCreatedAt || new Date(),
        updatedAt: new Date(),
      })
      .where(eq(species.id, id))
      .returning();
    
    return result;
  }

  async discardDraft(id: number) {
    const db = this.dbService.getDb();
    const [result] = await db
      .update(species)
      .set({
        draftData: null,
        hasDraft: false,
        draftCreatedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(species.id, id))
      .returning();
    
    return result;
  }
}