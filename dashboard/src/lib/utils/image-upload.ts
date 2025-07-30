/**
 * Simplified image upload utilities for Cloudflare R2
 * Only handles WebP conversion and basic validation
 */

/**
 * Convert image to WebP format for optimal storage
 */
export async function convertToWebP(file: File): Promise<File> {
  // If already WebP, return as is
  if (file.type === 'image/webp') {
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('No se pudo crear el contexto del canvas'))
        return
      }

      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('No se pudo convertir la imagen'))
            return
          }

          // Create new filename with .webp extension
          const newName = file.name.replace(/\.[^.]+$/, '.webp')
          const webpFile = new File([blob], newName, { type: 'image/webp' })
          resolve(webpFile)
        },
        'image/webp',
        0.85, // 85% quality for good balance
      )
    }

    img.onerror = () => {
      reject(new Error('No se pudo cargar la imagen'))
    }

    // Read file as data URL
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      reject(new Error('No se pudo leer el archivo'))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 15MB)
  const maxSize = 15 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: 'La imagen no debe superar los 15MB' }
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Formato de imagen no válido. Use JPG, PNG, WebP, AVIF o GIF' }
  }

  return { valid: true }
}

/**
 * Generate a clean filename for storage in R2 root
 * Images must be stored at root level for Cloudflare Image Resizing to work
 */
export function generateCleanFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const cleanName = originalName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  // Return filename without any path prefix - images go to R2 root
  return `${timestamp}-${random}-${cleanName}`
}
