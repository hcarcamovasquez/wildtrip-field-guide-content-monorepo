import type { APIRoute } from 'astro'

import { ManageGalleryRepository } from '../../../../../lib/private/repositories/ManageGalleryRepository'
import { canManageGallery, canManageContent, type Role } from '../../../../../lib/utils/permissions'

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user
  if (!user) {
    return new Response('No autorizado', { status: 401 })
  }

  const hasGalleryAccess = canManageGallery(user.role as Role) || canManageContent(user.role as Role)

  if (!hasGalleryAccess) {
    return new Response('No autorizado', { status: 403 })
  }

  try {
    const { ids } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return new Response('IDs inválidos', { status: 400 })
    }

    // Delete each media file
    for (const id of ids) {
      await ManageGalleryRepository.deleteMedia(id)
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error batch deleting media:', error)
    return new Response('Error al eliminar archivos', { status: 500 })
  }
}
