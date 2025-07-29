import type { APIRoute } from 'astro'

import { ManageGalleryRepository } from '@/lib/private/repositories/ManageGalleryRepository.ts'
import {
  canManageGallery,
  canManageContent,
  canManageNews,
  canManageAreas,
  canManageSpecies,
  type Role,
} from '@/lib/utils/permissions.ts'
import { uploadToR2 } from '@/lib/utils/r2-upload.ts'

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user
  if (!user) {
    return new Response('No autorizado', { status: 401 })
  }

  // Check permissions
  const hasGalleryAccess =
    canManageGallery(user.role as Role) ||
    canManageContent(user.role as Role) ||
    canManageNews(user.role as Role) ||
    canManageAreas(user.role as Role) ||
    canManageSpecies(user.role as Role)

  if (!hasGalleryAccess) {
    return new Response('No autorizado', { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const originalName = formData.get('originalName') as string
    const folderId = formData.get('folderId')

    if (!file) {
      return new Response('No se proporcionó archivo', { status: 400 })
    }

    // Get file buffer
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)

    // Process image with Sharp for dimensions and WebP conversion
    let width, height
    let processedBuffer = uint8Array
    let outputType = file.type
    
    if (file.type.startsWith('image/')) {
      try {
        const sharp = (await import('sharp')).default
        
        // Get metadata first
        const metadata = await sharp(uint8Array).metadata()
        width = metadata.width
        height = metadata.height
        
        // Convert to WebP format
        processedBuffer = await sharp(uint8Array)
          .webp({ 
            quality: 85  // Good quality/size balance
          })
          .toBuffer()
        
        outputType = 'image/webp'
      } catch (error) {
        console.error('Error processing image:', error)
        // Continue with original if WebP conversion fails
      }
    }

    // Generate a unique filename for R2 root with .webp extension
    const timestamp = Date.now()
    const cleanName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9.-]/g, '-')
    const key = `${timestamp}-${cleanName}.webp` // Always use .webp extension

    // Create a File object from the processed buffer for uploadToR2
    const fileToUpload = new File([processedBuffer], key, { type: outputType })

    // Upload to R2
    const url = await uploadToR2(fileToUpload, key)

    // Save to database
    const media = await ManageGalleryRepository.createMedia({
      url,
      filename: key,
      originalFilename: originalName || file.name,
      mimeType: outputType,  // Use the output type (avif)
      size: processedBuffer.length,  // Use processed buffer size
      type: file.type.startsWith('video/') ? 'video' : 'image',
      width,
      height,
      folderId: folderId ? parseInt(folderId as string) : null,
      uploadedBy: user.id.toString(),
      uploadedByName: user.fullName || user.username || user.email,
    })

    return new Response(JSON.stringify(media), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return new Response('Error al subir archivo', { status: 500 })
  }
}
