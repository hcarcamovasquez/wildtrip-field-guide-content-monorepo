import { clerkClient } from '@clerk/astro/server'
import { defineMiddleware } from 'astro:middleware'

import { userServerRepository } from '../lib/private/repositories/UserRepository.ts'
import type { Role } from '../lib/utils/permissions'

export const userMiddleware = defineMiddleware(async (context, next) => {
  const { locals } = context
  // Get auth from locals (set by Clerk middleware)
  const auth = locals.auth()
  const { userId: clerkId, sessionClaims } = auth

  // If no user is authenticated, skip user data fetching
  if (!clerkId) {
    return next()
  }

  try {
    // Check if user data is already in sessionClaims
    const publicMetadata = (sessionClaims as any)?.metadata
    const roleInSession = publicMetadata?.role as Role | undefined
    const userIdInSession = publicMetadata?.userId as number | undefined

    if (roleInSession && userIdInSession) {
      // All data is in session, create user object without DB query
      const clerkUser = await locals.currentUser()

      locals.user = {
        id: userIdInSession,
        clerkId: clerkId,
        email: clerkUser?.emailAddresses[0]?.emailAddress || '',
        username: clerkUser?.username || '',
        firstName: clerkUser?.firstName || '',
        lastName: clerkUser?.lastName || '',
        fullName: clerkUser?.fullName || '',
        avatarUrl: clerkUser?.imageUrl || '',
        bio: null,
        role: roleInSession,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    } else {
      // Missing data in session, need to check database
      let user = await userServerRepository.getOneByClerkId(clerkId)

      if (!user) {
        // User doesn't exist, create from Clerk data
        const clerkUser = await locals.currentUser()

        user = await userServerRepository.saveNewUser({
          clerkId: clerkId,
          email: clerkUser?.emailAddresses[0]?.emailAddress || '',
          username: clerkUser?.username || undefined,
          firstName: clerkUser?.firstName || undefined,
          lastName: clerkUser?.lastName || undefined,
          fullName: clerkUser?.fullName || undefined,
          avatarUrl: clerkUser?.imageUrl || undefined,
        })
      }

      if (user) {
        // Update Clerk with role and userId from database
        const client = clerkClient(context)
        await client.users.updateUserMetadata(clerkId, {
          publicMetadata: {
            role: user.role,
            userId: user.id,
          },
        })

        locals.user = user
      }
    }
  } catch (error) {
    console.error('Error in user middleware:', error)
    // Continue without user data rather than failing
  }

  return next()
})
