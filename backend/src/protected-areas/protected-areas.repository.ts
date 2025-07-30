import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { protectedAreas } from '../db/schema';
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
    const { page = 1, limit = 20, search, type, region, status = 'published' } = params;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: any[] = [];
    
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      conditions.push(eq(protectedAreas.status, status as 'draft' | 'published' | 'archived'));
    }

    if (type && ['national_park', 'national_reserve', 'natural_monument', 'nature_sanctuary'].includes(type)) {
      conditions.push(eq(protectedAreas.type, type as 'national_park' | 'national_reserve' | 'natural_monument' | 'nature_sanctuary'));
    }

    if (region) {
      conditions.push(eq(protectedAreas.region, region));
    }

    if (search) {
      conditions.push(
        or(
          ilike(protectedAreas.name, `%${search}%`),
          ilike(protectedAreas.description, `%${search}%`)
        )
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

  async findById(id: number) {
    const db = this.dbService.getDb();
    const [result] = await db.select().from(protectedAreas).where(eq(protectedAreas.id, id));
    return result;
  }

  async findBySlug(slug: string) {
    const db = this.dbService.getDb();
    const [result] = await db.select().from(protectedAreas).where(eq(protectedAreas.slug, slug));
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
    const [result] = await db
      .update(protectedAreas)
      .set({
        status: 'published',
        publishedAt: new Date(),
        hasDraft: false,
        draftData: null,
        updatedAt: new Date(),
      })
      .where(eq(protectedAreas.id, id))
      .returning();
    return result;
  }

  async createDraft(id: number, draftData: any) {
    const db = this.dbService.getDb();
    const [result] = await db
      .update(protectedAreas)
      .set({
        hasDraft: true,
        draftData,
        draftCreatedAt: new Date(),
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
        hasDraft: false,
        draftData: null,
        draftCreatedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(protectedAreas.id, id))
      .returning();
    return result;
  }
}