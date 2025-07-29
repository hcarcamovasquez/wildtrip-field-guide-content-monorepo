/**
 * Image processing utilities for browser-side image manipulation
 * Handles AVIF conversion, smart resizing, and aspect ratio detection
 */

export type ImageAspectRatio = 'landscape' | 'portrait' | 'square'

export interface ImageDimensions {
  width: number
  height: number
  aspectRatio: number
  aspectType: ImageAspectRatio
}

export interface ImageVariant {
  file: File
  dimensions: ImageDimensions
  sizeType: string
}

/**
 * Detect image aspect ratio type
 */
export function detectAspectRatio(width: number, height: number): ImageAspectRatio {
  const ratio = width / height
  const tolerance = 0.1 // 10% tolerance for square detection

  if (Math.abs(ratio - 1) < tolerance) {
    return 'square'
  } else if (ratio > 1) {
    return 'landscape'
  } else {
    return 'portrait'
  }
}

/**
 * Calculate dimensions for a specific aspect ratio variant
 */
function calculateVariantDimensions(
  targetWidth: number,
  aspectType: ImageAspectRatio,
  originalRatio: number,
): { width: number; height: number } {
  switch (aspectType) {
    case 'landscape': {
      // Use 16:9 for wide images, 4:3 for standard landscape
      const landscapeRatio = originalRatio > 1.5 ? 16 / 9 : 4 / 3
      return {
        width: targetWidth,
        height: Math.round(targetWidth / landscapeRatio),
      }
    }

    case 'portrait': {
      // Use 3:4 for standard portrait, 9:16 for very tall images
      const portraitRatio = originalRatio < 0.66 ? 9 / 16 : 3 / 4
      return {
        width: targetWidth,
        height: Math.round(targetWidth / portraitRatio),
      }
    }

    case 'square': {
      return {
        width: targetWidth,
        height: targetWidth,
      }
    }
  }
}

/**
 * Convert an image file to AVIF format using Canvas API
 * Falls back to WebP if AVIF is not supported
 */
export async function convertToAVIF(file: File, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('No se pudo crear el contexto del canvas'))
      return
    }

    img.onload = async () => {
      // Set canvas dimensions to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw image to canvas
      ctx.drawImage(img, 0, 0)

      // Try AVIF first, fall back to WebP
      const formats = [
        { type: 'image/avif', ext: '.avif', quality },
        { type: 'image/webp', ext: '.webp', quality },
      ]

      for (const format of formats) {
        try {
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, format.type, format.quality)
          })

          if (blob && blob.size > 0) {
            const convertedFile = new File([blob], file.name.replace(/\.[^/.]+$/, format.ext), { type: format.type })
            resolve(convertedFile)
            return
          }
        } catch {
          // Continue to next format
        }
      }

      reject(new Error('No se pudo convertir la imagen a AVIF o WebP'))
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
 * Resize an image with smart aspect ratio handling
 */
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  maintainAspect = true,
  quality = 0.9,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('No se pudo crear el contexto del canvas'))
      return
    }

    img.onload = async () => {
      let { width, height } = img

      if (maintainAspect) {
        // Calculate new dimensions maintaining aspect ratio
        const scale = Math.min(maxWidth / width, maxHeight / height, 1)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      } else {
        // Use exact dimensions (for thumbnails)
        width = maxWidth
        height = maxHeight
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      if (!maintainAspect) {
        // Center crop for thumbnails
        const sourceAspect = img.width / img.height
        const targetAspect = width / height

        let sx = 0,
          sy = 0,
          sw = img.width,
          sh = img.height

        if (sourceAspect > targetAspect) {
          // Source is wider - crop sides
          sw = img.height * targetAspect
          sx = (img.width - sw) / 2
        } else {
          // Source is taller - crop top/bottom
          sh = img.width / targetAspect
          sy = (img.height - sh) / 2
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height)
      } else {
        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height)
      }

      // Try to convert to same format as input, with AVIF preference
      const outputType =
        file.type === 'image/avif' ? 'image/avif' : file.type === 'image/webp' ? 'image/webp' : 'image/avif'

      try {
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, outputType, quality)
        })

        if (blob) {
          const resizedFile = new File([blob], file.name, { type: outputType })
          resolve(resizedFile)
          return
        }
      } catch {
        // Fall back to JPEG if needed
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('No se pudo redimensionar la imagen'))
              return
            }
            const resizedFile = new File([blob], file.name, { type: 'image/jpeg' })
            resolve(resizedFile)
          },
          'image/jpeg',
          quality,
        )
      }
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
 * Generate all image variants according to the sizing strategy
 */
export async function generateImageVariants(file: File): Promise<ImageVariant[]> {
  const variants: ImageVariant[] = []

  // First, get original dimensions
  const originalDimensions = await getImageDimensions(file)
  const aspectType = detectAspectRatio(originalDimensions.width, originalDimensions.height)

  // Convert original to AVIF with size limit (2400px max side)
  const maxOriginalSize = 2400
  const originalScale = Math.min(
    maxOriginalSize / originalDimensions.width,
    maxOriginalSize / originalDimensions.height,
    1,
  )

  let processedOriginal = file
  if (originalScale < 1 || file.type !== 'image/avif') {
    processedOriginal = await resizeImage(
      file,
      Math.round(originalDimensions.width * originalScale),
      Math.round(originalDimensions.height * originalScale),
      true,
      0.95,
    )
    processedOriginal = await convertToAVIF(processedOriginal, 0.95)
  }

  variants.push({
    file: processedOriginal,
    dimensions: await getImageDimensions(processedOriginal),
    sizeType: 'original',
  })

  // Define variant sizes
  const variantConfigs = [
    { width: 48, height: 48, sizeType: 'thumb-48', quality: 0.85, crop: true },
    { width: 96, height: 96, sizeType: 'thumb-96', quality: 0.85, crop: true },
    { width: 320, sizeType: 'small-320', quality: 0.85 },
    { width: 640, sizeType: 'medium-640', quality: 0.9 },
    { width: 1280, sizeType: 'hero-1280', quality: 0.9 },
    { width: 1600, sizeType: 'full-1600', quality: 0.92 },
  ]

  for (const config of variantConfigs) {
    // Skip if original is smaller than target
    if (originalDimensions.width < config.width && !config.crop) {
      continue
    }

    let resized: File

    if (config.crop) {
      // Thumbnails - exact dimensions with center crop
      resized = await resizeImage(file, config.width, config.height!, false, config.quality)
    } else {
      // Calculate dimensions based on aspect ratio
      const dimensions = calculateVariantDimensions(config.width, aspectType, originalDimensions.aspectRatio)

      resized = await resizeImage(file, dimensions.width, dimensions.height, true, config.quality)
    }

    // Convert to AVIF
    const avifFile = await convertToAVIF(resized, config.quality)
    const finalDimensions = await getImageDimensions(avifFile)

    // Add aspect ratio suffix for non-thumbnail sizes
    const sizeType = config.crop ? config.sizeType : `${config.sizeType}-${aspectType}`

    variants.push({
      file: avifFile,
      dimensions: finalDimensions,
      sizeType,
    })
  }

  return variants
}

/**
 * Get image dimensions from a file
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const aspectRatio = img.width / img.height
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio,
        aspectType: detectAspectRatio(img.width, img.height),
      })
    }

    img.onerror = () => {
      reject(new Error('No se pudo cargar la imagen para obtener dimensiones'))
    }

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

// Re-export for backward compatibility
export const convertToWebP = convertToAVIF
