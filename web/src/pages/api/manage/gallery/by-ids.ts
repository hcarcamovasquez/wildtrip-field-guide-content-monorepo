import type { APIRoute } from 'astro'
import { inArray } from 'drizzle-orm'

import { db } from '../../../../lib/db/config'
import { mediaGallery } from '../../../../lib/db/schema'
import { canAccessRoute, type Role } from '../../../../lib/utils/permissions'

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user
  if (!user || !canAccessRoute(user.role as Role, '/manage')) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ images: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get images by IDs
    const images = await db
      .select({
        id: mediaGallery.id,
        url: mediaGallery.url,
        filename: mediaGallery.filename,
        originalFilename: mediaGallery.originalFilename,
        title: mediaGallery.title,
        altText: mediaGallery.altText,
      })
      .from(mediaGallery)
      .where(inArray(mediaGallery.id, ids))

    return new Response(JSON.stringify({ images }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching images by IDs:', error)
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
