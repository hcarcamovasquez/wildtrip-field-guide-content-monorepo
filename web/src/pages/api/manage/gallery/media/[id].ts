import type { APIRoute } from 'astro'

import { ManageGalleryRepository } from '../../../../../lib/private/repositories/ManageGalleryRepository'
import {
  canManageGallery,
  canManageContent,
  canManageNews,
  canManageAreas,
  canManageSpecies,
  type Role,
} from '../../../../../lib/utils/permissions'

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user
  if (!user) {
    return new Response('No autorizado', { status: 401 })
  }

  const hasGalleryAccess =
    canManageGallery(user.role as Role) ||
    canManageContent(user.role as Role) ||
    canManageNews(user.role as Role) ||
    canManageAreas(user.role as Role) ||
    canManageSpecies(user.role as Role)

  if (!hasGalleryAccess) {
    return new Response('No autorizado', { status: 403 })
  }

  const id = parseInt(params.id!)
  if (isNaN(id)) {
    return new Response('ID inválido', { status: 400 })
  }

  try {
    const data = await request.json()
    const updated = await ManageGalleryRepository.updateMedia(id, data)

    if (!updated) {
      return new Response('Archivo no encontrado', { status: 404 })
    }

    // Return with folder info
    const mediaWithFolder = await ManageGalleryRepository.findMediaById(id)

    return new Response(JSON.stringify(mediaWithFolder), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error updating media:', error)
    return new Response('Error al actualizar archivo', { status: 500 })
  }
}

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
    await ManageGalleryRepository.deleteMedia(id)
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting media:', error)
    return new Response('Error al eliminar archivo', { status: 500 })
  }
}
