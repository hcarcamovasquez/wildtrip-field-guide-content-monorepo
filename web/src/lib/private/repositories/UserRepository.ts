import { eq } from 'drizzle-orm'

import { db } from '../../db/config.ts'
import { users } from '../../db/schema'
import { generateUsername } from '../../utils/username-generator.ts'

export interface UserNewData {
  clerkId: string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  fullName?: string
  avatarUrl?: string
}

class UserServerRepository {
  async getOneByClerkId(clerkId: string) {
    const [result] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1)
    return result || null
  }

  async saveNewUser(newUserData: UserNewData) {
    let username = newUserData.username
    if (!username) {
      username = await generateUsername(newUserData.firstName, newUserData.lastName, newUserData.email)
    }

    // Create new user
    const [created] = await db
      .insert(users)
      .values({
        clerkId: newUserData.clerkId,
        email: newUserData.email,
        username: username,
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        fullName: newUserData.fullName,
        avatarUrl: newUserData.avatarUrl,
        isActive: true,
        role: 'user',
      })
      .returning()
    return created
  }
}

export const userServerRepository = new UserServerRepository()
