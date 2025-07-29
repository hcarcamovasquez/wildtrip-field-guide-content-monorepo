import type { APIRoute } from 'astro'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db/config.ts'
import { mediaFolders, mediaGallery, news, protectedAreas, species, users } from '@/lib/db/schema'
import { getRandomImage, getRandomImages, newsData, protectedAreasData, speciesData } from '@/lib/db/seed/seed-data.ts'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Helper function to add images to media gallery
async function addToMediaGallery(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any, // Accept both db and transaction types
  imageUrl: string,
  title?: string,
  userId?: number,
  folderId?: number,
) {
  const filename = imageUrl.split('/').pop() || 'unknown.jpg'

  // Generate random dimensions for images
  const width = Math.floor(Math.random() * 2000) + 2000 // 2000-4000px
  const height = Math.floor(Math.random() * 1500) + 1500 // 1500-3000px

  let folderPath = null
  if (folderId) {
    const [folder] = await tx.select().from(mediaFolders).where(eq(mediaFolders.id, folderId)).limit(1)
    if (folder) {
      folderPath = folder.path
    }
  }

  const [galleryItem] = await tx
    .insert(mediaGallery)
    .values({
      url: imageUrl,
      filename: filename,
      originalFilename: filename,
      mimeType: 'image/avif',
      size: Math.floor(Math.random() * 2000000) + 500000, // Random size between 500KB and 2.5MB
      type: 'image',
      title: title,
      width: width,
      height: height,
      uploadedBy: userId ? userId.toString() : 'seed-script',
      uploadedByName: userId ? 'Humberto Carcamo Vasquez' : 'Sistema de Seed',
      folderId: folderId,
      folderPath: folderPath,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()

  return galleryItem
}

export const POST: APIRoute = async () => {
  // Only allow in development
  if (import.meta.env.PROD) {
    return new Response(
      JSON.stringify({
        error: 'This endpoint is only available in development',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  try {
    return await db.transaction(async (tx) => {
      // Clean existing data in correct order (respecting foreign key constraints)
      console.log('Cleaning existing data...')

      // First, create or get the user
      const [existingUser] = await tx
        .select()
        .from(users)
        .where(eq(users.clerkId, 'user_30BmmrWilJGCfsmzjCwixD8ihUV'))
        .limit(1)

      let seedUser
        // Create the user if it doesn't exist
      ;[seedUser] = await tx
        .insert(users)
        .values({
          clerkId: 'user_30BmmrWilJGCfsmzjCwixD8ihUV',
          email: 'hcarcamovasquez@gmail.com',
          username: 'hcarcamovasquez',
          firstName: 'Humberto',
          lastName: 'Carcamo Vasquez',
          fullName: 'Humberto Carcamo Vasquez',
          role: 'admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      await tx.insert(users).values({
        clerkId: 'user_30BqmTZTZHqFWbNv2cxueXkqP47',
        email: 'humberto@wildtrip.cl',
        username: 'hcarcamo',
        firstName: 'Humberto',
        lastName: 'Carcamo Vasquez',
        fullName: 'Humberto Carcamo Vasquez',
        role: 'content_editor',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await tx.insert(users).values({
        clerkId: 'user_30BjOpbFxTY4D4a97TpsDPjK2S6',
        email: 'hcarcamovasquez+clerk_test@example.com',
        username: 'hcarcamo',
        firstName: 'Humberto',
        lastName: 'Carcamo Vasquez',
        fullName: 'Humberto Carcamo Vasquez',
        role: 'content_editor',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Create folder structure for media gallery
      const [rootFolder] = await tx
        .insert(mediaFolders)
        .values({
          name: 'Contenido',
          slug: 'contenido',
          path: '/contenido',
          depth: 0,
          isPublic: false,
          isSystem: true,
          createdBy: seedUser.id.toString(),
          createdByName: seedUser.fullName,
        })
        .returning()

      const [speciesFolder] = await tx
        .insert(mediaFolders)
        .values({
          name: 'Especies',
          slug: 'especies',
          parentId: rootFolder.id,
          path: '/contenido/especies',
          depth: 1,
          isPublic: false,
          isSystem: true,
          createdBy: seedUser.id.toString(),
          createdByName: seedUser.fullName,
        })
        .returning()

      const [areasFolder] = await tx
        .insert(mediaFolders)
        .values({
          name: 'Áreas Protegidas',
          slug: 'areas-protegidas',
          parentId: rootFolder.id,
          path: '/contenido/areas-protegidas',
          depth: 1,
          isPublic: false,
          isSystem: true,
          createdBy: seedUser.id.toString(),
          createdByName: seedUser.fullName,
        })
        .returning()

      const [newsFolder] = await tx
        .insert(mediaFolders)
        .values({
          name: 'Noticias',
          slug: 'noticias',
          parentId: rootFolder.id,
          path: '/contenido/noticias',
          depth: 1,
          isPublic: false,
          isSystem: true,
          createdBy: seedUser.id.toString(),
          createdByName: seedUser.fullName,
        })
        .returning()

      // Insert species
      const insertedSpecies = []
      for (const speciesItem of speciesData) {
        const images = getRandomImages(5)

        // Get images for the species
        const mainImage = images[0] // First image as main
        const galleryImages = images.slice(1) // Rest as gallery

        // Add main image to media gallery first
        const mainImageGalleryItem = await addToMediaGallery(
          tx,
          mainImage,
          `${speciesItem.commonName} - Imagen principal`,
          seedUser.id,
          speciesFolder.id,
        )

        // Prepare gallery images data
        const galleryImagesData = []
        for (let i = 0; i < galleryImages.length; i++) {
          const galleryItem = await addToMediaGallery(
            tx,
            galleryImages[i],
            `${speciesItem.commonName} - Galería ${i + 1}`,
            seedUser.id,
            speciesFolder.id,
          )
          galleryImagesData.push({
            id: crypto.randomUUID(),
            url: galleryItem.url,
            galleryId: galleryItem.id,
          })
        }

        // Create species record with JSON columns
        const [speciesRecord] = await tx
          .insert(species)
          .values({
            slug: generateSlug(speciesItem.commonName!),
            status: 'published',
            hasDraft: false,
            scientificName: speciesItem.scientificName,
            commonName: speciesItem.commonName,
            family: speciesItem.family,
            order: speciesItem.order,
            class: speciesItem.class,
            phylum: speciesItem.phylum,
            kingdom: speciesItem.kingdom,
            conservationStatus: speciesItem.conservationStatus,
            habitat: speciesItem.habitat,
            distribution: speciesItem.distribution,
            description: speciesItem.description,
            distinctiveFeatures: speciesItem.distinctiveFeatures,
            references: speciesItem.references || [],
            images: images, // Keep for backward compatibility
            mainImage: {
              id: crypto.randomUUID(),
              url: mainImageGalleryItem.url,
              galleryId: mainImageGalleryItem.id,
            },
            mainGroup: speciesItem.mainGroup,
            specificCategory: speciesItem.specificCategory,
            galleryImages: galleryImagesData,
            richContent: speciesItem.richContent,
          })
          .returning()

        // No need to update media gallery items anymore - relationships are stored in JSON columns

        insertedSpecies.push(speciesRecord)
      }

      // Insert protected areas
      const insertedAreas = []
      for (const area of protectedAreasData) {
        const images = getRandomImages(5)

        // Get images for the area
        const mainImage = images[0] // First image as main
        const galleryImages = images.slice(1) // Rest as gallery

        // Add main image to media gallery and get its ID
        const mainImageGalleryItem = await addToMediaGallery(
          tx,
          mainImage,
          `${area.name} - Imagen principal`,
          seedUser.id,
          areasFolder.id,
        )

        // Prepare gallery images data
        const galleryImagesData = []

        // Add gallery images to media gallery
        for (let i = 0; i < galleryImages.length; i++) {
          const galleryItem = await addToMediaGallery(
            tx,
            galleryImages[i],
            `${area.name} - Galería ${i + 1}`,
            seedUser.id,
            areasFolder.id,
          )
          galleryImagesData.push({
            id: `gallery-${Date.now()}-${i}`,
            url: galleryItem.url,
            galleryId: galleryItem.id,
          })
        }

        // Create protected area record with JSON columns
        const [areaRecord] = await tx
          .insert(protectedAreas)
          .values({
            slug: generateSlug(area.name),
            status: 'published',
            hasDraft: false,
            name: area.name,
            type: area.type,
            location: area.location,
            area: area.area,
            creationYear: area.creationYear,
            description: area.description,
            ecosystems: area.ecosystems,
            keySpecies: null, // This field was missing
            visitorInformation: area.visitorInformation,
            mainImage: {
              id: `main-${Date.now()}`,
              url: mainImageGalleryItem.url,
              galleryId: mainImageGalleryItem.id,
            },
            galleryImages: galleryImagesData,
            region: area.region,
            richContent: area.richContent,
            publishedAt: new Date(),
          })
          .returning()

        // No need to update media gallery items anymore - relationships are stored in JSON columns

        insertedAreas.push({ ...areaRecord, title: area.name })
      }

      // Insert news
      const insertedNews = []
      for (const newsItem of newsData) {
        // Get featured image
        const featuredImage = getRandomImage()

        // Add featured image to media gallery first
        const mainImageGalleryItem = await addToMediaGallery(
          tx,
          featuredImage,
          `${newsItem.title} - Imagen destacada`,
          seedUser.id,
          newsFolder.id,
        )

        // Create news record with JSON column
        const [newsRecord] = await tx
          .insert(news)
          .values({
            title: newsItem.title,
            slug: generateSlug(newsItem.title),
            status: 'published',
            hasDraft: false,
            author: newsItem.author,
            category: newsItem.category,
            summary: newsItem.summary,
            content: newsItem.content,
            mainImage: {
              id: crypto.randomUUID(),
              url: mainImageGalleryItem.url,
              galleryId: mainImageGalleryItem.id,
            },
            tags: newsItem.tags,
            publishedAt: new Date(),
          })
          .returning()

        // No need to update media gallery items anymore - relationships are stored in JSON columns

        insertedNews.push(newsRecord)

        // Add content images to media gallery
        if (newsItem.content?.blocks) {
          for (const block of newsItem.content.blocks) {
            if (block.type === 'image' && block.src) {
              await addToMediaGallery(
                tx,
                block.src,
                block.alt || `${newsItem.title} - Contenido`,
                seedUser.id,
                newsFolder.id,
              )
            }
          }
        }
      }

      // Note: Relations functionality has been removed from the schema

      // Count total media gallery entries added
      const mediaCount =
        insertedSpecies.length * 5 +
        insertedAreas.length * 5 +
        insertedNews.length +
        insertedNews.reduce((acc, newsItem) => {
          const contentImages =
            newsItem.content?.blocks?.filter((b: { type: string }) => b.type === 'image').length || 0
          return acc + contentImages
        }, 0)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Database seeded successfully',
          data: {
            user: {
              id: seedUser.id,
              email: seedUser.email,
              name: seedUser.fullName,
              created: !existingUser,
            },
            species: insertedSpecies.length,
            protectedAreas: insertedAreas.length,
            news: insertedNews.length,
            mediaFolders: 4, // Root + 3 category folders
            mediaGallery: mediaCount,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    })
  } catch (_error) {
    console.error('Seed error:', _error)
    return new Response(
      JSON.stringify({
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}

export const DELETE: APIRoute = async () => {
  // Only allow in development
  if (import.meta.env.PROD) {
    return new Response(
      JSON.stringify({
        error: 'This endpoint is only available in development',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  try {
    return await db.transaction(async (tx) => {
      // Delete all data in reverse order of dependencies
      await tx.delete(news)
      await tx.delete(protectedAreas)
      await tx.delete(species)
      await tx.delete(mediaGallery)
      await tx.delete(mediaFolders)
      await tx.delete(users)

      // Reset user ID sequence ALTER SEQUENCE users_id_seq RESTART WITH 1
      await tx.execute('ALTER SEQUENCE users_id_seq RESTART WITH 1')
      await tx.execute('ALTER SEQUENCE media_gallery_id_seq RESTART WITH 1')
      await tx.execute('ALTER SEQUENCE news_id_seq RESTART WITH 1')
      await tx.execute('ALTER SEQUENCE protected_areas_id_seq RESTART WITH 1')
      await tx.execute('ALTER SEQUENCE species_id_seq RESTART WITH 1')

      // Note: We don't delete the user as they might have other content

      return new Response(
        JSON.stringify({
          success: true,
          message: 'All seed data deleted successfully (user preserved)',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    })
  } catch (_error) {
    console.error('Delete error:', _error)
    return new Response(
      JSON.stringify({
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
