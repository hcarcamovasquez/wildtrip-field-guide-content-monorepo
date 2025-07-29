import { like } from 'drizzle-orm'

import { db } from '../db/config.ts'
import { users } from '../db/schema'

/**
 * Generates a username based on the user's name
 * If username already exists, adds a numeric suffix
 */
export async function generateUsername(firstName?: string, lastName?: string, email?: string): Promise<string> {
  // Clean and prepare base username
  const cleanName = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]/g, '') // Keep only alphanumeric
      .trim()

  let baseUsername = ''

  // Try different combinations
  if (firstName && lastName) {
    // Try firstname.lastname
    baseUsername = `${cleanName(firstName)}.${cleanName(lastName)}`
  } else if (firstName) {
    // Use just firstname
    baseUsername = cleanName(firstName)
  } else if (lastName) {
    // Use just lastname
    baseUsername = cleanName(lastName)
  } else if (email) {
    // Extract from email (before @)
    const emailPrefix = email.split('@')[0]
    baseUsername = cleanName(emailPrefix)
  } else {
    // Fallback to generic username
    baseUsername = 'usuario'
  }

  // Ensure minimum length
  if (baseUsername.length < 3) {
    baseUsername = 'usuario'
  }

  // Check if username exists and add suffix if needed
  let username = baseUsername
  let counter = 1

  while (true) {
    // Check if username exists
    const existing = await db.select().from(users).where(like(users.username, username)).limit(1)

    if (existing.length === 0) {
      break
    }

    // Add numeric suffix
    username = `${baseUsername}${counter}`
    counter++

    // Safety check to avoid infinite loop
    if (counter > 9999) {
      // Use timestamp as last resort
      username = `${baseUsername}${Date.now()}`
      break
    }
  }

  return username
}
