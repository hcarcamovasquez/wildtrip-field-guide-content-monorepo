import type { APIRoute } from 'astro'
import { desc, and, eq, or, ilike, count } from 'drizzle-orm'

import { db } from '../../../../lib/db/config'
import { mediaGallery } from '../../../../lib/db/schema'
// import { canAccessRoute, type Role } from '../../../../lib/utils/permissions' - Not currently used

export const GET: APIRoute = async ({ url, locals }) => {
  const user = locals.user
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Check permissions - allow all roles except 'user'
  // const userRole = user.role as Role
  if (user.role === 'user') {
    return new Response(JSON.stringify({ error: 'Access denied' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Get query parameters
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const search = url.searchParams.get('search') || ''
  const type = (url.searchParams.get('type') as 'image' | 'video') || 'image'
  const offset = (page - 1) * limit

  try {
    // Build where conditions
    const whereConditions = []
    whereConditions.push(eq(mediaGallery.type, type))

    // Add search condition if provided
    if (search) {
      whereConditions.push(
        or(
          ilike(mediaGallery.filename, `%${search}%`),
          ilike(mediaGallery.title, `%${search}%`),
          ilike(mediaGallery.altText, `%${search}%`),
          ilike(mediaGallery.description, `%${search}%`),
        ),
      )
    }

    const whereClause = and(...whereConditions)

    // Get total count
    const [{ total }] = await db.select({ total: count() }).from(mediaGallery).where(whereClause)

    // Get paginated results
    const items = await db
      .select({
        id: mediaGallery.id,
        url: mediaGallery.url,
        filename: mediaGallery.filename,
        title: mediaGallery.title,
        altText: mediaGallery.altText,
        description: mediaGallery.description,
        width: mediaGallery.width,
        height: mediaGallery.height,
        size: mediaGallery.size,
        mimeType: mediaGallery.mimeType,
        uploadedAt: mediaGallery.createdAt,
        uploadedBy: mediaGallery.uploadedBy,
        uploadedByName: mediaGallery.uploadedByName,
      })
      .from(mediaGallery)
      .where(whereClause)
      .orderBy(desc(mediaGallery.createdAt))
      .limit(limit)
      .offset(offset)

    return new Response(
      JSON.stringify({
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error browsing gallery:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
