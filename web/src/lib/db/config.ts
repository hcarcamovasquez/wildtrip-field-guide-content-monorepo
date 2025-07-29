import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

const databaseUrl = import.meta.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

// Detect if we're in local development
const isDevelopment = import.meta.env.DEV
const hasLocalDevelopment =
  isDevelopment && (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1'))

// Create database instance based on environment
// Always use Neon in production
export const db = hasLocalDevelopment
  ? drizzlePostgres(postgres(databaseUrl), { schema })
  : drizzleNeon(neon(databaseUrl), { schema })

export type Database = typeof db
