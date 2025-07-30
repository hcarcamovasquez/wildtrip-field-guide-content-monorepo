/**
 * Cloudflare Image Resizing utilities
 * Generates URLs with resize parameters for dynamic image optimization
 */

export interface ImageResizeOptions {
  width?: number
  height?: number
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
  quality?: number
  format?: 'auto' | 'webp' | 'avif' | 'json'
  dpr?: number
}

/**
 * Get the CDN base URL from environment variable
 */
export function getCdnBaseUrl(): string {
  // Use VITE_ prefix for Vite environment variables
  return import.meta.env.VITE_R2_PUBLIC_URL || ''
}

/**
 * Generate a Cloudflare Image Resizing URL
 */
export function getResizedImageUrl(originalUrl: string, options: ImageResizeOptions = {}): string {
  // If no options provided, return original URL
  if (Object.keys(options).length === 0) {
    return originalUrl
  }

  // Build the options string
  const optionParts: string[] = []

  if (options.width) {
    optionParts.push(`width=${options.width}`)
  }
  if (options.height) {
    optionParts.push(`height=${options.height}`)
  }
  if (options.fit) {
    optionParts.push(`fit=${options.fit}`)
  }
  if (options.quality) {
    optionParts.push(`quality=${options.quality}`)
  }
  if (options.format) {
    optionParts.push(`format=${options.format}`)
  }
  if (options.dpr) {
    optionParts.push(`dpr=${options.dpr}`)
  }

  const optionsString = optionParts.join(',')

  // Extract the path from the URL
  let path = originalUrl
  const cdnBase = getCdnBaseUrl()

  // Remove the base URL if present
  if (originalUrl.startsWith(cdnBase)) {
    path = originalUrl.slice(cdnBase.length)
  } else if (originalUrl.startsWith('https://')) {
    // Extract path from full URL
    const url = new URL(originalUrl)
    path = url.pathname
  }

  // Ensure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path
  }

  // Construct the final URL with CDN and image resizing
  return `${cdnBase}/cdn-cgi/image/${optionsString}${path}`
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(originalUrl: string, widths: number[] = [320, 640, 960, 1280, 1920]): string {
  return widths
    .map((width) => {
      const url = getResizedImageUrl(originalUrl, { width, format: 'auto' })
      return `${url} ${width}w`
    })
    .join(', ')
}

/**
 * Get optimized image URL for a specific use case
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  variant: 'thumb' | 'small' | 'medium' | 'large' | 'hero' | 'full',
): string {
  const variants: Record<string, ImageResizeOptions> = {
    thumb: { width: 96, height: 96, fit: 'cover', quality: 80 },
    small: { width: 320, fit: 'scale-down', quality: 85 },
    medium: { width: 640, fit: 'scale-down', quality: 85 },
    large: { width: 960, fit: 'scale-down', quality: 90 },
    hero: { width: 1280, fit: 'scale-down', quality: 90 },
    full: { width: 1920, fit: 'scale-down', quality: 95 },
  }

  const options = variants[variant] || variants.medium
  return getResizedImageUrl(originalUrl, { ...options, format: 'auto' })
}

/**
 * Default sizes attribute for responsive images
 */
export function getDefaultSizes(): string {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
}