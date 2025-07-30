/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RichContent } from '@wildtrip/shared'

// Helper function to generate unique IDs
function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Convert rich content blocks to HTML for Tiptap
 */
export function richContentToHtml(richContent: RichContent | null): string {
  if (!richContent?.blocks) return ''

  return richContent.blocks
    .map((block: any) => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${block.content || ''}</p>`

        case 'heading': {
          const level = block.level || block.data?.level || 2
          return `<h${level}>${block.content || ''}</h${level}>`
        }

        case 'list': {
          const items = block.data?.items || []
          const isOrdered = block.listType === 'ordered' || block.data?.style === 'ordered'
          const tag = isOrdered ? 'ol' : 'ul'
          const itemsHtml = items.map((item: string) => `<li>${item}</li>`).join('')
          return `<${tag}>${itemsHtml}</${tag}>`
        }

        case 'quote':
        case 'blockquote':
          return `<blockquote>${block.content || ''}</blockquote>`

        case 'code':
          return `<pre><code>${block.content || ''}</code></pre>`

        case 'image': {
          const src = block.src || block.data?.url || ''
          const alt = block.alt || block.data?.alt || 'Image'

          // Build style string from block.style
          const styles: string[] = []

          if (block.width) {
            styles.push(`width: ${block.width}`)
          }
          if (block.height) {
            styles.push(`height: ${block.height}`)
          }

          if (block.style) {
            if (block.style.float && block.style.float !== 'none') {
              styles.push(`float: ${block.style.float}`)
            }
            if (block.style.display) {
              styles.push(`display: ${block.style.display}`)
            }
            if (block.style.margin) {
              styles.push(`margin: ${block.style.margin}`)
            }
            if (block.style.marginLeft) {
              styles.push(`margin-left: ${block.style.marginLeft}`)
            }
            if (block.style.marginRight) {
              styles.push(`margin-right: ${block.style.marginRight}`)
            }
            if (block.style.marginTop) {
              styles.push(`margin-top: ${block.style.marginTop}`)
            }
            if (block.style.marginBottom) {
              styles.push(`margin-bottom: ${block.style.marginBottom}`)
            }
            if (block.style.border) {
              styles.push(`border: ${block.style.border}`)
            }
            if (block.style.borderRadius) {
              styles.push(`border-radius: ${block.style.borderRadius}`)
            }
            if (block.style.boxShadow) {
              styles.push(`box-shadow: ${block.style.boxShadow}`)
            }
          }

          const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : ''
          return `<img src="${src}" alt="${alt}"${styleAttr} />`
        }

        case 'divider':
          return '<hr />'

        default:
          return `<p>${block.content || ''}</p>`
      }
    })
    .join('\n')
}

/**
 * Convert HTML from Tiptap to rich content blocks
 */
export function htmlToRichContent(html: string): RichContent {
  if (!html.trim()) {
    return { blocks: [] }
  }

  const blocks: any[] = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const elements = doc.body.children

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    const tagName = element.tagName.toLowerCase()

    switch (tagName) {
      case 'p':
        blocks.push({
          id: generateBlockId(),
          type: 'paragraph',
          content: element.innerHTML,
        })
        break

      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        blocks.push({
          id: generateBlockId(),
          type: 'heading',
          level: parseInt(tagName[1]),
          content: element.textContent || '',
        })
        break

      case 'ul':
      case 'ol': {
        const items = Array.from(element.querySelectorAll('li')).map((li) => li.innerHTML)
        blocks.push({
          id: generateBlockId(),
          type: 'list',
          listType: tagName === 'ol' ? 'ordered' : 'unordered',
          content: items.join('\n'),
          data: {
            items,
            style: tagName === 'ol' ? 'ordered' : 'unordered',
          },
        })
        break
      }

      case 'blockquote':
        blocks.push({
          id: generateBlockId(),
          type: 'blockquote',
          content: element.innerHTML,
        })
        break

      case 'pre': {
        const codeElement = element.querySelector('code')
        blocks.push({
          id: generateBlockId(),
          type: 'code',
          content: codeElement?.textContent || element.textContent || '',
        })
        break
      }

      case 'img': {
        const img = element as HTMLImageElement
        const imageBlock: any = {
          id: generateBlockId(),
          type: 'image',
          src: img.src,
          alt: img.alt,
          content: '',
        }

        // Extract style attribute
        const styleAttr = img.getAttribute('style')
        if (styleAttr) {
          // Parse style string to extract individual properties
          const styleObj: Record<string, string> = {}
          styleAttr.split(';').forEach((rule) => {
            const [property, value] = rule.split(':').map((s) => s.trim())
            if (property && value) {
              styleObj[property] = value
            }
          })

          // Extract width and height
          if (styleObj.width) {
            imageBlock.width = styleObj.width
          }
          if (styleObj.height) {
            imageBlock.height = styleObj.height
          }

          // Build style object for other properties
          const style: any = {}

          if (styleObj.float && styleObj.float !== 'none') {
            style.float = styleObj.float
          }
          if (styleObj.display) {
            style.display = styleObj.display
          }
          if (styleObj.margin) {
            style.margin = styleObj.margin
          }
          if (styleObj['margin-left']) {
            style.marginLeft = styleObj['margin-left']
          }
          if (styleObj['margin-right']) {
            style.marginRight = styleObj['margin-right']
          }
          if (styleObj['margin-top']) {
            style.marginTop = styleObj['margin-top']
          }
          if (styleObj['margin-bottom']) {
            style.marginBottom = styleObj['margin-bottom']
          }
          if (styleObj.border && styleObj.border !== 'none') {
            style.border = styleObj.border
          }
          if (styleObj['border-radius']) {
            style.borderRadius = styleObj['border-radius']
          }
          if (styleObj['box-shadow'] && styleObj['box-shadow'] !== 'none') {
            style.boxShadow = styleObj['box-shadow']
          }

          // Only add style object if it has properties
          if (Object.keys(style).length > 0) {
            imageBlock.style = style
          }
        }

        blocks.push(imageBlock)
        break
      }

      case 'hr':
        blocks.push({
          id: generateBlockId(),
          type: 'divider',
          content: '',
        })
        break

      default:
        // Default to paragraph for any other tags
        if (element.textContent?.trim()) {
          blocks.push({
            id: generateBlockId(),
            type: 'paragraph',
            content: element.innerHTML,
          })
        }
    }
  }

  return { blocks }
}
