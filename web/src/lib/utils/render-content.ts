import { getOptimizedImageUrl, generateSrcSet } from './cloudflare-images'

import type { ContentBlock } from '@wildtrip/shared'

export function renderContentBlock(block: ContentBlock): string {
  switch (block.type) {
    case 'paragraph': {
      const textAlign = block.format?.textAlign ? ` style="text-align: ${block.format.textAlign}"` : ''
      return `<p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed"${textAlign}>${block.content}</p>`
    }

    case 'heading': {
      const level = block.level || 2
      const classes = {
        1: 'text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6',
        2: 'text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4',
        3: 'text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3',
        4: 'text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2',
        5: 'text-base font-semibold text-gray-900 dark:text-white mt-4 mb-2',
        6: 'text-sm font-semibold text-gray-900 dark:text-white mt-4 mb-2',
      }
      const textAlign = block.format?.textAlign ? ` style="text-align: ${block.format.textAlign}"` : ''
      return `<h${level} class="${classes[level] || classes[2]}"${textAlign}>${block.content}</h${level}>`
    }

    case 'blockquote':
      return `<blockquote class="border-l-4 border-primary dark:border-emerald-400 pl-4 italic text-gray-600 dark:text-gray-400 my-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-r-lg">${block.content}</blockquote>`

    case 'list':
      return `<div class="mb-4 text-gray-700 dark:text-gray-300">${block.content}</div>`

    case 'image': {
      // Build style attribute from block.style
      const styles: string[] = []
      const classes: string[] = ['rounded-lg']

      // Handle width and height
      if (block.width) {
        styles.push(`width: ${block.width}`)
      } else if (!block.style?.float || block.style.float === 'none') {
        classes.push('w-full')
      }

      if (block.height) {
        styles.push(`height: ${block.height}`)
      }

      // Handle style object if present
      if (block.style) {
        // Float
        if (block.style.float && block.style.float !== 'none') {
          styles.push(`float: ${block.style.float}`)
          classes.push('mb-4')

          // Float styles are handled in the style attribute
        }

        // Margins
        if (block.style.margin) {
          styles.push(`margin: ${block.style.margin}`)
        } else if (
          block.style.marginLeft ||
          block.style.marginRight ||
          block.style.marginTop ||
          block.style.marginBottom
        ) {
          if (block.style.marginLeft) styles.push(`margin-left: ${block.style.marginLeft}`)
          if (block.style.marginRight) styles.push(`margin-right: ${block.style.marginRight}`)
          if (block.style.marginTop) styles.push(`margin-top: ${block.style.marginTop}`)
          if (block.style.marginBottom) styles.push(`margin-bottom: ${block.style.marginBottom}`)
        }

        // Border
        if (block.style.border) {
          styles.push(`border: ${block.style.border}`)
          if (block.style.borderRadius) {
            styles.push(`border-radius: ${block.style.borderRadius}`)
          }
        } else {
          // Default border for non-floating images
          if (!block.style.float || block.style.float === 'none') {
            classes.push('shadow-md')
          }
        }

        // Box shadow
        if (block.style.boxShadow) {
          styles.push(`box-shadow: ${block.style.boxShadow}`)
        }

        // Display
        if (block.style.display) {
          styles.push(`display: ${block.style.display}`)
        }

        // Handle alignment for non-floating images
        if (
          (!block.style.float || block.style.float === 'none') &&
          block.style.marginLeft === 'auto' &&
          block.style.marginRight === 'auto'
        ) {
          classes.push('mx-auto')
        }
      } else {
        // Default styles for images without custom styles
        classes.push('w-full', 'shadow-md')
      }

      const classAttr = classes.length > 0 ? ` class="${classes.join(' ')}"` : ''
      const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : ''

      // Generate responsive image attributes
      const optimizedSrc = getOptimizedImageUrl(block.src, 'large')
      const srcset = generateSrcSet(block.src)

      // For floating images, don't wrap in figure and ensure float works properly
      if (block.style?.float && block.style.float !== 'none') {
        // Add max-width to prevent image from being too large
        if (!block.width) {
          styles.push('max-width: 50%')
        }
        return `<img src="${optimizedSrc}" srcset="${srcset}" sizes="(max-width: 640px) 100vw, 50vw" alt="${block.alt}"${classAttr}${styleAttr} loading="lazy" />`
      } else {
        // For non-floating images, wrap in figure with caption support
        return `<figure class="my-8">
          <img src="${optimizedSrc}" srcset="${srcset}" sizes="(max-width: 1024px) 100vw, 1024px" alt="${block.alt}"${classAttr}${styleAttr} loading="lazy" />
          ${block.caption ? `<figcaption class="text-center text-gray-500 dark:text-gray-400 text-sm mt-2">${block.caption}</figcaption>` : ''}
        </figure>`
      }
    }

    case 'table':
      return `<div class="my-8 overflow-x-auto">${block.content}</div>`

    case 'code':
      return `<pre class="bg-gray-900 dark:bg-gray-950 text-white p-4 rounded-lg overflow-x-auto my-6"><code>${block.content}</code></pre>`

    case 'html':
      return `<div class="my-4">${block.content}</div>`

    default:
      return ''
  }
}
