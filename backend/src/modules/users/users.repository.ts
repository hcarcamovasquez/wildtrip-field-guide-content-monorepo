import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { users } from '../../db/schema';
import { and, asc, desc, eq, like, or, sql } from 'drizzle-orm';
import { UsernameGenerator } from '../../utils/username-generator';

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
    const {
      limit = 20,
      offset = 0,
      search,
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    // Build where conditions
    const conditions: any[] = [];

    if (search) {
      conditions.push(
        or(
          like(users.email, `%${search}%`),
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`),
        ),
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

  async findById(id: number) {
    const [user] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }

  async findByClerkId(clerkId: string) {
    const [user] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
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

  async update(id: number, data: Partial<typeof users.$inferInsert>) {
    const [updatedUser] = await this.db.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateByClerkId(
    clerkId: string,
    data: Partial<typeof users.$inferInsert>,
  ) {
    const [updatedUser] = await this.db.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, clerkId))
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

  async createFromClerk(userData: {
    clerkId: string;
    email: string;
    name: string | null;
    username: string | null;
    profileImageUrl: string | null;
    role?: string;
  }) {
    // Extract first and last name from full name
    const nameParts = userData.name?.split(' ') || [];
    const firstName = nameParts[0] || null;
    const lastName = nameParts.slice(1).join(' ') || null;

    // Generate username if not provided
    let username = userData.username;
    if (!username) {
      username = await this.usernameGenerator.generateUsername(
        firstName || undefined,
        lastName || undefined,
        userData.email,
      );
    }

    return this.create({
      clerkId: userData.clerkId,
      email: userData.email,
      firstName,
      lastName,
      username,
      role: userData.role || 'user', // Use provided role or default to user
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async updateFromClerk(userData: {
    clerkId: string;
    email?: string;
    name: string | null;
    username: string | null;
    profileImageUrl: string | null;
    role?: string;
  }) {
    const existingUser = await this.findByClerkId(userData.clerkId);
    if (!existingUser) {
      // If user doesn't exist and we have email, create it
      if (userData.email) {
        return this.createFromClerk({
          ...userData,
          email: userData.email,
        });
      }
      return null;
    }

    // Extract first and last name from full name
    const nameParts = userData.name?.split(' ') || [];
    const firstName = nameParts[0] || null;
    const lastName = nameParts.slice(1).join(' ') || null;

    const updateData: Partial<typeof users.$inferInsert> = {
      firstName,
      lastName,
      updatedAt: new Date(),
    };

    if (userData.email) {
      updateData.email = userData.email;
    }

    if (userData.username) {
      updateData.username = userData.username;
    }

    if (userData.role) {
      updateData.role = userData.role;
    }

    return this.updateByClerkId(userData.clerkId, updateData);
  }

  async deleteByClerkId(clerkId: string) {
    await this.delete(clerkId);
  }
}
