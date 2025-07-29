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
    const { ids, targetFolderId } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return new Response('IDs inválidos', { status: 400 })
    }

    await ManageGalleryRepository.moveMedia(ids, targetFolderId)

    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Target folder not found')) {
      return new Response(error.message, { status: 404 })
    }
    console.error('Error moving media:', error)
    return new Response('Error al mover archivos', { status: 500 })
  }
}
