import { desc, eq, or, ilike, sql, count } from 'drizzle-orm'

import { db } from '../../db/config'
import { users } from '../../db/schema'

export type Role = 'admin' | 'content_editor' | 'news_editor' | 'areas_editor' | 'species_editor' | 'user'

export interface UserWithRole {
  id: number
  clerkId: string
  email: string
  username: string | null
  firstName: string | null
  lastName: string | null
  fullName: string | null
  avatarUrl: string | null
  bio: string | null
  isActive: boolean
  role: string
  createdAt: Date
  updatedAt: Date
  lastSeenAt?: Date | null
}

export class ManageUserRepository {
  static async count() {
    const result = await db.select({ value: count() }).from(users)
    return Number(result[0]?.value || 0)
  }

  static async countByRole(role: string) {
    const result = await db.select({ value: count() }).from(users).where(eq(users.role, role))
    return Number(result[0]?.value || 0)
  }

  static async findAll(
    options: {
      page?: number
      limit?: number
      search?: string
      role?: string
      sortBy?: 'createdAt' | 'updatedAt' | 'fullName' | 'email'
      sortOrder?: 'asc' | 'desc'
    } = {},
  ) {
    const { page = 1, limit = 10, search, role, sortBy = 'createdAt', sortOrder = 'desc' } = options

    const offset = (page - 1) * limit

    // Build conditions
    const conditions = []

    if (search) {
      conditions.push(
        or(
          ilike(users.email, `%${search}%`),
          ilike(users.fullName, `%${search}%`),
          ilike(users.username, `%${search}%`),
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`),
        ),
      )
    }

    if (role) {
      conditions.push(eq(users.role, role))
    }

    // Build query with conditions
    const whereClause =
      conditions.length > 0
        ? conditions.length === 1
          ? conditions[0]
          : sql`${conditions.map((c) => sql`(${c})`).reduce((a, b) => sql`${a} AND ${b}`)}`
        : undefined

    // Apply ordering
    const orderColumn = users[sortBy] || users.createdAt
    const orderDirection = sortOrder === 'desc' ? desc(orderColumn) : orderColumn

    // Execute query
    const results = await db.select().from(users).where(whereClause).orderBy(orderDirection).limit(limit).offset(offset)

    // Get total count for pagination
    const countResult = await db.select({ count: count() }).from(users).where(whereClause)

    const total = Number(countResult[0]?.count || 0)

    return {
      users: results as UserWithRole[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  static async findById(id: number): Promise<UserWithRole | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1)

    return (result[0] as UserWithRole) || null
  }

  static async findByClerkId(clerkId: string): Promise<UserWithRole | null> {
    const result = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1)

    return (result[0] as UserWithRole) || null
  }

  static async updateRole(id: number, role: Role) {
    const result = await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id)).returning()

    return result[0] as UserWithRole
  }

  static async update(
    id: number,
    data: Partial<{
      email: string
      username: string
      firstName: string
      lastName: string
      fullName: string
      avatarUrl: string
      bio: string
      isActive: boolean
      role: string
    }>,
  ) {
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()

    return result[0] as UserWithRole
  }

  static async getRoleStats() {
    const roleStats = await db
      .select({
        role: users.role,
        count: count(),
      })
      .from(users)
      .groupBy(users.role)

    const stats: Record<string, number> = {}
    roleStats.forEach((stat) => {
      stats[stat.role] = Number(stat.count)
    })

    return stats
  }
}
