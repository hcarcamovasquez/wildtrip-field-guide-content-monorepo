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
    const data = await request.json()
    const { name, parentId, description, color, icon } = data

    if (!name) {
      return new Response('Nombre requerido', { status: 400 })
    }

    const folder = await ManageGalleryRepository.createFolder({
      name,
      parentId: parentId || null,
      description: description || null,
      color: color || null,
      icon: icon || null,
      createdBy: user.id.toString(),
      createdByName: user.fullName || user.username || user.email || null,
    })

    return new Response(JSON.stringify(folder), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating folder:', error)
    return new Response('Error al crear carpeta', { status: 500 })
  }
}
