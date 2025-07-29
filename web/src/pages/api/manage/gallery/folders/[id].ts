import type { APIRoute } from 'astro'

import { ManageGalleryRepository } from '../../../../../lib/private/repositories/ManageGalleryRepository'
import { canManageGallery, canManageContent, type Role } from '../../../../../lib/utils/permissions'

export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = locals.user
  if (!user) {
    return new Response('No autorizado', { status: 401 })
  }

  const hasGalleryAccess = canManageGallery(user.role as Role) || canManageContent(user.role as Role)

  if (!hasGalleryAccess) {
    return new Response('No autorizado', { status: 403 })
  }

  const id = parseInt(params.id!)
  if (isNaN(id)) {
    return new Response('ID inválido', { status: 400 })
  }

  try {
    await ManageGalleryRepository.deleteFolder(id)
    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot delete folder')) {
      return new Response(error.message, { status: 400 })
    }
    console.error('Error deleting folder:', error)
    return new Response('Error al eliminar carpeta', { status: 500 })
  }
}

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user
  if (!user) {
    return new Response('No autorizado', { status: 401 })
  }

  const hasGalleryAccess = canManageGallery(user.role as Role) || canManageContent(user.role as Role)

  if (!hasGalleryAccess) {
    return new Response('No autorizado', { status: 403 })
  }

  const id = parseInt(params.id!)
  if (isNaN(id)) {
    return new Response('ID inválido', { status: 400 })
  }

  try {
    const data = await request.json()
    const updated = await ManageGalleryRepository.updateFolder(id, data)

    if (!updated) {
      return new Response('Carpeta no encontrada', { status: 404 })
    }

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error updating folder:', error)
    return new Response('Error al actualizar carpeta', { status: 500 })
  }
}
