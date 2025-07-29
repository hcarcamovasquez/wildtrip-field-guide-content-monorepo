import type { APIRoute } from 'astro'

import { ManageGalleryRepository } from '@/lib/private/repositories/ManageGalleryRepository.ts'
import { ManageProtectedAreaRepository } from '@/lib/private/repositories/ManageProtectedAreaRepository.ts'
import { generateCleanFilename } from '@/lib/utils/image-upload.ts'
import { canManageAreas, type Role } from '@/lib/utils/permissions.ts'
import { uploadToR2 } from '@/lib/utils/r2-upload.ts'

export const POST: APIRoute = async ({ request, params, locals }) => {
  const user = locals.user
  if (!user) {
    return new Response(JSON.stringify({ error: 'Usuario no autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!canManageAreas(user.role as Role)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { id } = params
  if (!id || isNaN(parseInt(id))) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Check if area exists and lock status
  const checkResult = await ManageProtectedAreaRepository.checkLockForImageUpload(parseInt(id), user.id)

  if (!checkResult.exists) {
    return new Response(JSON.stringify({ error: 'Área protegida no encontrada' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (checkResult.lockedByAnother) {
    return new Response(JSON.stringify({ error: 'Esta área protegida está siendo editada por otro usuario' }), {
      status: 423,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file || !file.size) {
      return new Response(JSON.stringify({ error: 'No se proporcionó imagen' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Generate clean filename for R2 root
    const cleanName = generateCleanFilename(file.name)
    const key = cleanName // No subdirectories - images go to R2 root

    // Upload to R2
    const url = await uploadToR2(file, key)

    // Save to media gallery first
    const media = await ManageGalleryRepository.createMedia({
      url,
      filename: key,
      originalFilename: file.name,
      mimeType: file.type,
      size: file.size,
      type: 'image',
      uploadedBy: user.id.toString(),
      uploadedByName: user.fullName || user.username || user.email,
    })

    // Update protected area with main image data
    await ManageProtectedAreaRepository.uploadFeaturedImage(parseInt(id), url, {
      filename: key,
      originalFilename: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedBy: user.id.toString(),
      uploadedByName: user.fullName || user.username || user.email,
      galleryId: media.id,
    })

    return new Response(
      JSON.stringify({
        url,
        galleryId: media.id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error uploading image:', error)
    return new Response(JSON.stringify({ error: 'Error al subir la imagen' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
