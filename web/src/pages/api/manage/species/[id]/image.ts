import type { APIRoute } from 'astro'

import { ManageGalleryRepository } from '@/lib/private/repositories/ManageGalleryRepository.ts'
import { ManageSpeciesRepository } from '@/lib/private/repositories/ManageSpeciesRepository.ts'
import { generateCleanFilename } from '@/lib/utils/image-upload.ts'
import { canManageSpecies, type Role } from '@/lib/utils/permissions.ts'
import { uploadToR2 } from '@/lib/utils/r2-upload.ts'

export const POST: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!canManageSpecies(user.role as Role)) {
    return new Response(JSON.stringify({ error: 'Sin permisos' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const id = parseInt(params.id as string)
  const species = await ManageSpeciesRepository.findById(id)
  if (!species) {
    return new Response(JSON.stringify({ error: 'Especie no encontrada' }), {
      status: 404,
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

    // Create media gallery entry
    const mediaEntry = await ManageGalleryRepository.createMedia({
      filename: key,
      originalFilename: file.name,
      mimeType: file.type,
      size: file.size,
      url,
      type: 'image',
      uploadedBy: user.id.toString(),
      uploadedByName: user.fullName || user.username || user.email,
    })

    // Update species with new image as JSON
    await ManageSpeciesRepository.update(
      id,
      {
        mainImage: {
          id: crypto.randomUUID(),
          url,
          galleryId: mediaEntry.id,
        },
      },
      user.id,
    )

    return new Response(
      JSON.stringify({
        id: mediaEntry.id,
        url,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error uploading image:', error)
    return new Response(JSON.stringify({ error: 'Error al procesar la imagen' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
