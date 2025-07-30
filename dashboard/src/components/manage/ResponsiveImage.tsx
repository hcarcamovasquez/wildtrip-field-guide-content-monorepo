import { getOptimizedImageUrl, generateSrcSet, getDefaultSizes } from '@/lib/utils/cloudflare-images'

interface ResponsiveImageProps {
  src?: string | null
  alt: string
  sizes?: string
  className?: string
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
  variant?: 'thumb' | 'small' | 'medium' | 'large' | 'hero' | 'full'
}

export default function ResponsiveImage({
  src,
  alt,
  sizes,
  className = '',
  loading = 'lazy',
  fetchPriority = 'auto',
  variant = 'hero',
}: ResponsiveImageProps) {
  // Don't render if no valid source
  if (!src) return null

  // Generate optimized URL and srcset
  const optimizedSrc = getOptimizedImageUrl(src, variant)
  const srcset = generateSrcSet(src)
  const imageSizes = sizes || getDefaultSizes()

  return (
    <img
      src={optimizedSrc}
      srcSet={srcset}
      sizes={imageSizes}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      className={className}
    />
  )
}
