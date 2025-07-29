import { relations } from 'drizzle-orm'
import { pgTable, serial, integer, text, json, timestamp, boolean } from 'drizzle-orm/pg-core'

import type { RichContent } from './types'
import { users } from './users'

export const news = pgTable('news', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).default('draft'),
  slug: text('slug').notNull().unique(),
  author: text('author'),
  category: text('category', {
    enum: ['education', 'current_events', 'conservation', 'research'],
  }).notNull(),
  summary: text('summary'),

  // Required content using TinyMCE format
  content: json('content').$type<RichContent>().notNull(), // Mandatory rich content

  mainImage: json('main_image').$type<{
    id: string // UUID generated when adding
    url: string // Image URL from gallery
    galleryId: number // ID from mediaGallery table
  }>(), // Main image info
  tags: json('tags').$type<string[]>(), // Array of tags

  // SEO fields
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),

  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),

  // Draft system fields (previously in baseContent)
  draftData: json('draft_data').$type<Record<string, unknown>>(),
  hasDraft: boolean('has_draft').default(false).notNull(),
  draftCreatedAt: timestamp('draft_created_at'),

  // Locking system fields (previously in baseContent)
  lockedBy: integer('locked_by').references(() => users.id, { onDelete: 'set null' }),
  lockedAt: timestamp('locked_at'),
  lockExpiresAt: timestamp('lock_expires_at'),
})

export type News = typeof news.$inferSelect
export type NewNews = typeof news.$inferInsert

// News relations
export const newsRelations = relations(news, ({ one }) => ({
  lockedByUser: one(users, {
    fields: [news.lockedBy],
    references: [users.id],
  }),
}))
