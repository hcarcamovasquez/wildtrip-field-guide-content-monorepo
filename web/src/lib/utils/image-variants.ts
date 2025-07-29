/**
 * Utilities for working with image variants
 */

import type { UploadedImageUrls } from './r2-upload'

export interface ImageVariantUrls {
  original: string
  thumb48: string
  thumb96: string
  small: string
  medium: string
  hero: string
  full: string
}

/**
 * Get image variant URLs from media gallery metadata
 */
export function getImageVariants(metadata: Record<string, unknown>): ImageVariantUrls | null {
  if (!metadata?.variants) return null

  const variants = metadata.variants as UploadedImageUrls

  return {
    original: variants.original,
    thumb48: variants.thumb48,
    thumb96: variants.thumb96,
    small: variants.small320,
    medium: variants.medium640,
    hero: variants.hero1280,
    full: variants.full1600,
  }
}

/**
 * Get the best variant URL for a given size requirement
 */
export function getBestVariant(
  variants: ImageVariantUrls | null,
  preferredSize: 'thumb' | 'small' | 'medium' | 'hero' | 'full' = 'hero',
): string {
  if (!variants) return ''

  switch (preferredSize) {
    case 'thumb':
      return variants.thumb96 || variants.thumb48 || variants.small || variants.hero
    case 'small':
      return variants.small || variants.medium || variants.hero
    case 'medium':
      return variants.medium || variants.hero || variants.full
    case 'hero':
      return variants.hero || variants.full || variants.medium
    case 'full':
      return variants.full || variants.hero || variants.original
    default:
      return variants.hero || variants.original
  }
}

/**
 * Get srcset string for responsive images
 */
export function getImageSrcSet(variants: ImageVariantUrls | null): string {
  if (!variants) return ''

  const srcSetParts: string[] = []

  if (variants.small) srcSetParts.push(`${variants.small} 320w`)
  if (variants.medium) srcSetParts.push(`${variants.medium} 640w`)
  if (variants.hero) srcSetParts.push(`${variants.hero} 1280w`)
  if (variants.full) srcSetParts.push(`${variants.full} 1600w`)

  return srcSetParts.join(', ')
}

/**
 * Generate sizes attribute for responsive images
 */
export function getImageSizes(
  breakpoints: {
    mobile?: string
    tablet?: string
    desktop?: string
    default: string
  } = {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw',
    default: '100vw',
  },
): string {
  const sizes: string[] = []

  if (breakpoints.mobile) sizes.push(`(max-width: 640px) ${breakpoints.mobile}`)
  if (breakpoints.tablet) sizes.push(`(max-width: 1024px) ${breakpoints.tablet}`)
  if (breakpoints.desktop) sizes.push(`(max-width: 1536px) ${breakpoints.desktop}`)
  sizes.push(breakpoints.default)

  return sizes.join(', ')
}

/**
 * Create responsive image attributes
 */
export function getResponsiveImageAttrs(
  variants: ImageVariantUrls | null,
  alt: string,
  sizes?: string,
): {
  src: string
  srcset: string
  sizes: string
  alt: string
  loading: 'lazy' | 'eager'
} {
  return {
    src: getBestVariant(variants, 'hero'),
    srcset: getImageSrcSet(variants),
    sizes: sizes || getImageSizes(),
    alt,
    loading: 'lazy' as const,
  }
}
