import { relations } from 'drizzle-orm'
import { boolean, index, integer, json, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { mediaFolders } from './mediaFolders'

export const mediaGallery = pgTable(
  'media_gallery',
  {
    id: serial('id').primaryKey(),

    // Basic media info
    url: text('url').notNull(), // Full URL to R2
    filename: varchar('filename', { length: 255 }).notNull(),
    originalFilename: varchar('original_filename', { length: 255 }),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    size: integer('size').notNull(), // Size in bytes

    // Media type
    type: text('media_type', {
      enum: ['image', 'video'],
    })
      .notNull()
      .default('image'),

    // Folder organization
    folderId: integer('folder_id').references(() => mediaFolders.id, { onDelete: 'set null' }),
    folderPath: text('folder_path'), // Cached folder path for quick filtering

    // Dimensions (for images)
    width: integer('width'),
    height: integer('height'),

    // Metadata
    title: varchar('title', { length: 255 }),
    description: text('description'),
    altText: varchar('alt_text', { length: 500 }),
    tags: json('tags').$type<string[]>().default([]),

    // User info
    uploadedBy: varchar('uploaded_by', { length: 255 }), // User ID
    uploadedByName: varchar('uploaded_by_name', { length: 255 }), // User name for display

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),

    // Visibility
    isPublic: boolean('is_public').default(false).notNull(),
  },
  (table) => [
    index('media_gallery_folder_id_idx').on(table.folderId),
    index('media_gallery_folder_path_idx').on(table.folderPath),
    index('media_gallery_uploaded_by_idx').on(table.uploadedBy),
  ],
)

export type MediaGallery = typeof mediaGallery.$inferSelect
export type NewMediaGallery = typeof mediaGallery.$inferInsert

// Relations
export const mediaGalleryRelations = relations(mediaGallery, ({ one }) => ({
  folder: one(mediaFolders, {
    fields: [mediaGallery.folderId],
    references: [mediaFolders.id],
  }),
}))