import { relations } from 'drizzle-orm'
import { boolean, integer, json, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

import type { RichContent } from './types'
import { users } from './users'

export const species = pgTable('species', {
  id: serial('id').primaryKey(),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).default('draft'),
  slug: text('slug').notNull().unique(),
  scientificName: text('scientific_name').notNull().default(''),
  commonName: text('common_name').notNull().default(''),
  family: text('family'),
  order: text('order'),
  class: text('class'),
  phylum: text('phylum'),
  kingdom: text('kingdom'),
  mainGroup: text('main_group', {
    enum: [
      'mammal',
      'bird',
      'reptile',
      'amphibian',
      'fish',
      'insect',
      'arachnid',
      'crustacean',
      'mollusk',
      'plant',
      'fungus',
      'algae',
      'other',
    ],
  }), // Main taxonomic group
  specificCategory: text('specific_category'), // Specific category in Spanish (e.g., "Mamífero marino", "Ave rapaz", "Planta carnívora")
  description: text('description'),
  habitat: text('habitat'),
  distribution: json('distribution'), // Can contain GeoJSON data
  conservationStatus: text('conservation_status', {
    enum: [
      'extinct',
      'extinct_in_wild',
      'critically_endangered',
      'endangered',
      'vulnerable',
      'near_threatened',
      'least_concern',
      'data_deficient',
      'not_evaluated',
    ],
  }),
  images: json('images').$type<string[]>(), // Array of URLs or references to images (deprecated - use mainImage and galleryImages)
  mainImage: json('main_image').$type<{
    id: string // UUID generated when adding
    url: string // Image URL from gallery
    galleryId: number // ID from mediaGallery table
  }>(), // Main image info
  galleryImages: json('gallery_images').$type<
    Array<{
      id: string // UUID generated when adding
      url: string // Image URL from gallery
      galleryId: number // ID from mediaGallery table
    }>
  >(), // Gallery images array
  distinctiveFeatures: text('distinctive_features'),
  references: json('references').$type<{ title: string; url: string }[]>(), // Bibliography or sources

  // Optional content using TinyMCE format
  richContent: json('rich_content').$type<RichContent>(), // Optional rich content

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

export type Species = typeof species.$inferSelect
export type NewSpecies = typeof species.$inferInsert

// Species relations
export const speciesRelations = relations(species, ({ one }) => ({
  lockedByUser: one(users, {
    fields: [species.lockedBy],
    references: [users.id],
  }),
}))
