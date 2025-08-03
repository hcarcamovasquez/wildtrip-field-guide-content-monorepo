import { Injectable, Logger } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import {
  species,
  protectedAreas,
  news,
  mediaGallery,
  mediaFolders,
  users,
} from '../../db/schema';
import { sql } from 'drizzle-orm';
import {
  speciesData,
  protectedAreasData,
  newsData,
  getRandomImageData,
  getRandomImageDataArray,
  seedImages,
  seedUsers,
} from './seed-data';
import { slugify } from '@wildtrip/shared';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly db: DbService) {}

  async seed() {
    this.logger.log('Starting database seed...');

    try {
      // Clear existing data first
      await this.clearDatabase();

      // Seed users
      let usersCount = 0;
      for (const user of seedUsers) {
        await this.db.db.insert(users).values({
          ...user,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        usersCount++;
      }

      // Create media folders
      const [rootFolder] = await this.db.db
        .insert(mediaFolders)
        .values({
          name: 'Seed Images',
          slug: 'seed-images',
          path: '/seed-images',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Create media gallery entries
      const mediaEntries = await Promise.all(
        seedImages.map(async (img, index) => {
          const [entry] = await this.db.db
            .insert(mediaGallery)
            .values({
              filename: img.filename,
              originalFilename: img.filename,
              mimeType: 'image/webp',
              size: 100000, // Placeholder size
              width: 1600,
              height: 1200,
              url: img.url,
              folderId: rootFolder.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();
          return { ...entry, seedId: img.id };
        }),
      );

      // Create a map of seed image IDs to gallery IDs
      const imageMap = new Map(
        mediaEntries.map((entry) => [entry.seedId, entry.id]),
      );

      // Seed species
      let speciesCount = 0;
      for (const speciesItem of speciesData) {
        const mainImage = getRandomImageData();
        const galleryImages = getRandomImageDataArray(4);

        await this.db.db.insert(species).values({
          ...speciesItem,
          slug: slugify(speciesItem.commonName),
          status: 'published' as const,
          mainImage: {
            id: `main-${Date.now()}`,
            url: mainImage.url,
            galleryId: imageMap.get(mainImage.id) || 0,
          },
          gallery: galleryImages.map((img, i) => ({
            id: `gallery-${Date.now()}-${i}`,
            url: img.url,
            galleryId: imageMap.get(img.id) || 0,
          })),
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
        speciesCount++;
      }

      // Seed protected areas
      let areasCount = 0;
      for (const area of protectedAreasData) {
        const mainImage = getRandomImageData();
        const galleryImages = getRandomImageDataArray(4);

        await this.db.db.insert(protectedAreas).values({
          ...area,
          slug: slugify(area.name),
          status: 'published' as const,
          mainImage: {
            id: `main-${Date.now()}`,
            url: mainImage.url,
            galleryId: imageMap.get(mainImage.id) || 0,
          },
          galleryImages: galleryImages.map((img, i) => ({
            id: `gallery-${Date.now()}-${i}`,
            url: img.url,
            galleryId: imageMap.get(img.id) || 0,
          })),
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
        areasCount++;
      }

      // Seed news
      let newsCount = 0;
      for (const article of newsData) {
        const featuredImage = getRandomImageData();

        await this.db.db.insert(news).values({
          ...article,
          slug: slugify(article.title),
          status: 'published' as const,
          mainImage: {
            id: `main-${Date.now()}`,
            url: featuredImage.url,
            galleryId: imageMap.get(featuredImage.id) || 0,
          },
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
        newsCount++;
      }

      this.logger.log(`Seed completed successfully:`);
      this.logger.log(`- ${usersCount} users created`);
      this.logger.log(`- ${mediaEntries.length} media items created`);
      this.logger.log(`- ${speciesCount} species created`);
      this.logger.log(`- ${areasCount} protected areas created`);
      this.logger.log(`- ${newsCount} news articles created`);

      return {
        success: true,
        message: 'Database seeded successfully',
        stats: {
          users: usersCount,
          media: mediaEntries.length,
          species: speciesCount,
          protectedAreas: areasCount,
          news: newsCount,
        },
      };
    } catch (error) {
      this.logger.error('Error seeding database:', error);
      throw error;
    }
  }

  async clearDatabase() {
    this.logger.log('Clearing database...');

    try {
      // Delete in order to respect foreign key constraints
      await this.db.db.delete(news);
      await this.db.db.delete(protectedAreas);
      await this.db.db.delete(species);
      await this.db.db.delete(mediaGallery);
      await this.db.db.delete(mediaFolders);
      await this.db.db.delete(users);

      // Reset sequences
      await this.db.db.execute(sql`ALTER SEQUENCE news_id_seq RESTART WITH 1`);
      await this.db.db.execute(
        sql`ALTER SEQUENCE protected_areas_id_seq RESTART WITH 1`,
      );
      await this.db.db.execute(
        sql`ALTER SEQUENCE species_id_seq RESTART WITH 1`,
      );
      await this.db.db.execute(
        sql`ALTER SEQUENCE media_gallery_id_seq RESTART WITH 1`,
      );
      await this.db.db.execute(
        sql`ALTER SEQUENCE media_folders_id_seq RESTART WITH 1`,
      );
      await this.db.db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`);

      this.logger.log('Database cleared successfully');

      return {
        success: true,
        message: 'Database cleared successfully',
      };
    } catch (error) {
      this.logger.error('Error clearing database:', error);
      throw error;
    }
  }
}
