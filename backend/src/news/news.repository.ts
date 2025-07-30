import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { news } from '../db/schema';
import { eq, desc, ilike, and, or, sql, inArray } from 'drizzle-orm';

@Injectable()
export class NewsRepository {
  constructor(private dbService: DbService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    tags?: string[];
    status?: string;
  }) {
    const db = this.dbService.getDb();
    const { page = 1, limit = 20, search, category, tags, status } = params;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: any[] = [];
    
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      conditions.push(eq(news.status, status as 'draft' | 'published' | 'archived'));
    }

    if (category && ['education', 'current_events', 'conservation', 'research'].includes(category)) {
      conditions.push(eq(news.category, category as 'education' | 'current_events' | 'conservation' | 'research'));
    }

    if (search) {
      conditions.push(
        or(
          ilike(news.title, `%${search}%`),
          ilike(news.summary, `%${search}%`),
          ilike(news.author, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(news)
      .where(whereClause);

    // Get data
    const data = await db
      .select()
      .from(news)
      .where(whereClause)
      .orderBy(desc(news.publishedAt), desc(news.createdAt))
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
    const [result] = await db.select().from(news).where(eq(news.id, id));
    return result;
  }

  async findBySlug(slug: string) {
    const db = this.dbService.getDb();
    const [result] = await db.select().from(news).where(eq(news.slug, slug));
    return result;
  }

  async create(data: any) {
    const db = this.dbService.getDb();
    const [result] = await db.insert(news).values(data).returning();
    return result;
  }

  async update(id: number, data: any) {
    const db = this.dbService.getDb();
    const [result] = await db
      .update(news)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(news.id, id))
      .returning();
    return result;
  }

  async delete(id: number) {
    const db = this.dbService.getDb();
    await db.delete(news).where(eq(news.id, id));
  }

  async publish(id: number) {
    const db = this.dbService.getDb();
    const [result] = await db
      .update(news)
      .set({
        status: 'published',
        publishedAt: new Date(),
        hasDraft: false,
        draftData: null,
        updatedAt: new Date(),
      })
      .where(eq(news.id, id))
      .returning();
    return result;
  }

  async createDraft(id: number, draftData: any) {
    const db = this.dbService.getDb();
    const [result] = await db
      .update(news)
      .set({
        hasDraft: true,
        draftData,
        draftCreatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(news.id, id))
      .returning();
    return result;
  }

  async discardDraft(id: number) {
    const db = this.dbService.getDb();
    const [result] = await db
      .update(news)
      .set({
        hasDraft: false,
        draftData: null,
        draftCreatedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(news.id, id))
      .returning();
    return result;
  }
}