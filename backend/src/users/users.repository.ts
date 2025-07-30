import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { users } from '../db/schema';
import { eq, like, or, desc, asc, sql, and } from 'drizzle-orm';
import { UsernameGenerator } from '../utils/username-generator';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly db: DbService,
    private readonly usernameGenerator: UsernameGenerator,
  ) {}

  async findAll(params: {
    limit?: number;
    offset?: number;
    search?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { limit = 20, offset = 0, search, role, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    // Build where conditions
    const conditions: any[] = [];
    
    if (search) {
      conditions.push(
        or(
          like(users.email, `%${search}%`),
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`)
        )
      );
    }

    if (role) {
      conditions.push(eq(users.role, role));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Apply sorting
    const orderDirection = sortOrder === 'asc' ? asc : desc;
    let orderByColumn: any = users.createdAt;
    
    switch (sortBy) {
      case 'email':
        orderByColumn = users.email;
        break;
      case 'firstName':
        orderByColumn = users.firstName;
        break;
      case 'lastName':
        orderByColumn = users.lastName;
        break;
      case 'role':
        orderByColumn = users.role;
        break;
      case 'createdAt':
      default:
        orderByColumn = users.createdAt;
        break;
    }

    // Get data
    const items = await this.db.db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(orderDirection(orderByColumn))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await this.db.db
      .select({ count: sql<number>`count(*)::integer` })
      .from(users)
      .where(whereClause);

    return {
      items,
      totalItems: count,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(count / limit),
      hasNext: offset + limit < count,
      hasPrevious: offset > 0,
    };
  }

  async findById(id: string) {
    const [user] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.clerkId, id))
      .limit(1);
    return user;
  }

  async findByEmail(email: string) {
    const [user] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user;
  }

  async update(id: string, data: Partial<typeof users.$inferInsert>) {
    const [updatedUser] = await this.db.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, id))
      .returning();
    return updatedUser;
  }

  async create(data: typeof users.$inferInsert) {
    const [newUser] = await this.db.db.insert(users).values(data).returning();
    return newUser;
  }

  async delete(id: string) {
    await this.db.db.delete(users).where(eq(users.clerkId, id));
  }

  async syncFromClerk(clerkUser: {
    id: string;
    emailAddresses: { emailAddress: string }[];
    firstName?: string | null;
    lastName?: string | null;
    publicMetadata?: { role?: string };
  }) {
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) return null;

    const existingUser = await this.findById(clerkUser.id);
    
    const userData = {
      clerkId: clerkUser.id,
      email,
      firstName: clerkUser.firstName || null,
      lastName: clerkUser.lastName || null,
      role: clerkUser.publicMetadata?.role || 'viewer',
    };

    if (existingUser) {
      return this.update(clerkUser.id, userData);
    } else {
      // Generate unique username for new users
      const username = await this.usernameGenerator.generateUsername(
        clerkUser.firstName || undefined,
        clerkUser.lastName || undefined,
        email,
      );

      return this.create({
        ...userData,
        username,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
}