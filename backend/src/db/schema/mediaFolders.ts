import { relations } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { mediaGallery } from './mediaGallery';

export const mediaFolders = pgTable(
  'media_folders',
  {
    id: serial('id').primaryKey(),

    // Folder information
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    description: text('description'),

    // Hierarchical structure
    parentId: integer('parent_id'),
    path: text('path').notNull(), // Full path like /root/folder1/subfolder
    depth: integer('depth').notNull().default(0), // 0 for root, 1 for first level, etc.

    // Permissions and visibility
    isPublic: boolean('is_public').default(false).notNull(),
    isSystem: boolean('is_system').default(false).notNull(), // For system folders that can't be deleted

    // User information
    createdBy: varchar('created_by', { length: 255 }),
    createdByName: varchar('created_by_name', { length: 255 }),

    // Metadata
    icon: varchar('icon', { length: 50 }), // Icon name for folder
    color: varchar('color', { length: 7 }), // Hex color for folder

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('media_folders_path_idx').on(table.path),
    index('media_folders_parent_id_idx').on(table.parentId),
    index('media_folders_slug_idx').on(table.slug),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: 'media_folders_parent_fk',
    }).onDelete('cascade'),
  ],
);

export type MediaFolder = typeof mediaFolders.$inferSelect;
export type NewMediaFolder = typeof mediaFolders.$inferInsert;

// Relations
export const mediaFoldersRelations = relations(
  mediaFolders,
  ({ one, many }) => ({
    parent: one(mediaFolders, {
      fields: [mediaFolders.parentId],
      references: [mediaFolders.id],
      relationName: 'parentChild',
    }),
    children: many(mediaFolders, { relationName: 'parentChild' }),
    media: many(mediaGallery),
  }),
);
