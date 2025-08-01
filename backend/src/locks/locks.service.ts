import { Injectable, ConflictException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { species, news, protectedAreas } from '../db/schema';
import { eq, and, gt, sql } from 'drizzle-orm';

export interface LockInfo {
  lockedBy: number | null;
  lockedAt: Date | null;
  lockExpiresAt: Date | null;
  lockedByUser?: any;
}

@Injectable()
export class LocksService {
  private readonly LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

  constructor(private dbService: DbService) {}

  async acquireLock(
    entityType: 'species' | 'news' | 'protectedAreas',
    entityId: number,
    userId: number,
  ): Promise<boolean> {
    const db = this.dbService.getDb();
    const table = this.getTable(entityType);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.LOCK_DURATION);

    // Check if already locked by another user
    const [existing] = await db
      .select()
      .from(table)
      .where(
        and(
          eq(table.id, entityId),
          sql`${table.lockedBy} IS NOT NULL`,
          sql`${table.lockedBy} != ${userId}`,
          gt(table.lockExpiresAt, now), // Lock not expired
        ),
      );

    if (existing) {
      throw new ConflictException(
        'This content is currently being edited by another user',
      );
    }

    // Acquire or refresh lock
    await db
      .update(table)
      .set({
        lockedBy: userId,
        lockedAt: now,
        lockExpiresAt: expiresAt,
      })
      .where(eq(table.id, entityId));

    return true;
  }

  async releaseLock(
    entityType: 'species' | 'news' | 'protectedAreas',
    entityId: number,
    userId: number,
  ): Promise<void> {
    const db = this.dbService.getDb();
    const table = this.getTable(entityType);

    await db
      .update(table)
      .set({
        lockedBy: null,
        lockedAt: null,
        lockExpiresAt: null,
      })
      .where(and(eq(table.id, entityId), eq(table.lockedBy, userId)));
  }

  async checkLock(
    entityType: 'species' | 'news' | 'protectedAreas',
    entityId: number,
  ): Promise<LockInfo> {
    const db = this.dbService.getDb();
    const table = this.getTable(entityType);
    const now = new Date();

    const [result] = await db
      .select()
      .from(table)
      .where(eq(table.id, entityId));

    if (!result) {
      return {
        lockedBy: null,
        lockedAt: null,
        lockExpiresAt: null,
      };
    }

    // Check if lock is expired
    if (result.lockExpiresAt && result.lockExpiresAt < now) {
      // Lock expired, clear it
      await db
        .update(table)
        .set({
          lockedBy: null,
          lockedAt: null,
          lockExpiresAt: null,
        })
        .where(eq(table.id, entityId));

      return {
        lockedBy: null,
        lockedAt: null,
        lockExpiresAt: null,
      };
    }

    return {
      lockedBy: result.lockedBy,
      lockedAt: result.lockedAt,
      lockExpiresAt: result.lockExpiresAt,
    };
  }

  async extendLock(
    entityType: 'species' | 'news' | 'protectedAreas',
    entityId: number,
    userId: number,
  ): Promise<boolean> {
    const db = this.dbService.getDb();
    const table = this.getTable(entityType);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.LOCK_DURATION);

    const result = await db
      .update(table)
      .set({
        lockExpiresAt: expiresAt,
      })
      .where(
        and(
          eq(table.id, entityId),
          eq(table.lockedBy, userId),
          gt(table.lockExpiresAt, now), // Only extend if not expired
        ),
      );

    return result.length > 0;
  }

  private getTable(entityType: 'species' | 'news' | 'protectedAreas') {
    switch (entityType) {
      case 'species':
        return species;
      case 'news':
        return news;
      case 'protectedAreas':
        return protectedAreas;
    }
  }
}
