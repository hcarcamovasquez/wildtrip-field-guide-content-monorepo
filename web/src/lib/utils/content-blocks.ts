import type { ContentBlock } from '@wildtrip/shared'
import { getOptimizedImageUrl, generateSrcSet } from './cloudflare-images'

// Convert HTML to content blocks - DOM-based version for client-side
export function htmlToContentBlocks(html: string): ContentBlock[] {
  // Use DOM parser if available (client-side)
  if (typeof DOMParser !== 'undefined') {
    return htmlToContentBlocksDOM(html)
  }
  // Fallback to regex-based parsing for server-side
  return htmlToContentBlocksRegex(html)
}

// DOM-based parsing (client-side)
function htmlToContentBlocksDOM(html: string): ContentBlock[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const blocks: ContentBlock[] = []

  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'paragraph',
          content: text,
        })
      }
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return

    const element = node as Element
    const tagName = element.tagName.toLowerCase()

    switch (tagName) {
      case 'p':
        if (element.textContent?.trim()) {
          blocks.push({
            id: crypto.randomUUID(),
            type: 'paragraph',
            content: element.innerHTML,
          })
        }
        break
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        blocks.push({
          id: crypto.randomUUID(),
          type: 'heading',
          level: parseInt(tagName.charAt(1)) as 1 | 2 | 3 | 4 | 5 | 6,
          content: element.textContent || '',
        })
        break
      case 'ul':
      case 'ol': {
        const listHtml = element.innerHTML
        blocks.push({
          id: crypto.randomUUID(),
          type: 'list',
          listType: tagName === 'ol' ? 'ordered' : 'unordered',
          content: listHtml,
        })
        break
      }
      case 'blockquote':
        blocks.push({
          id: crypto.randomUUID(),
          type: 'blockquote',
          content: element.innerHTML,
        })
        break
      case 'pre': {
        const code = element.querySelector('code')
        blocks.push({
          id: crypto.randomUUID(),
          type: 'code',
          content: code?.textContent || element.textContent || '',
        })
        break
      }
      case 'img':
        blocks.push({
          id: crypto.randomUUID(),
          type: 'image',
          src: element.getAttribute('src') || '',
          alt: element.getAttribute('alt') || '',
        })
        break
      case 'table':
        blocks.push({
          id: crypto.randomUUID(),
          type: 'table',
          content: element.outerHTML,
        })
        break
      default:
        // Process children for other elements
        element.childNodes.forEach(processNode)
    }
  }

  doc.body.childNodes.forEach(processNode)
  return blocks
}

// Regex-based parsing (server-side fallback)
function htmlToContentBlocksRegex(html: string): ContentBlock[] {
  const blocks: ContentBlock[] = []

  // Simple regex-based parsing for server compatibility
  const lines = html.split('\n').filter((line) => line.trim())

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed) return

    // Paragraph
    const pMatch = trimmed.match(/^<p[^>]*>(.*?)<\/p>$/)
    if (pMatch) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'paragraph',
        content: pMatch[1],
      })
      return
    }

    // Headings
    const hMatch = trimmed.match(/^<h([1-6])[^>]*>(.*?)<\/h[1-6]>$/)
    if (hMatch) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'heading',
        level: parseInt(hMatch[1]) as 1 | 2 | 3 | 4 | 5 | 6,
        content: hMatch[2],
      })
      return
    }

    // Images
    const imgMatch = trimmed.match(/^<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>$/)
    if (imgMatch) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'image',
        src: imgMatch[1],
        alt: imgMatch[2] || '',
      })
      return
    }

    // Blockquote
    const quoteMatch = trimmed.match(/^<blockquote[^>]*>(.*?)<\/blockquote>$/)
    if (quoteMatch) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'blockquote',
        content: quoteMatch[1],
      })
      return
    }

    // Lists
    const ulMatch = trimmed.match(/^<ul[^>]*>(.*?)<\/ul>$/s)
    if (ulMatch) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'list',
        listType: 'unordered',
        content: ulMatch[1],
      })
      return
    }

    const olMatch = trimmed.match(/^<ol[^>]*>(.*?)<\/ol>$/s)
    if (olMatch) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'list',
        listType: 'ordered',
        content: olMatch[1],
      })
      return
    }

    // Tables
    if (trimmed.startsWith('<table')) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'table',
        content: trimmed,
      })
      return
    }

    // Code blocks
    const codeMatch = trimmed.match(/^<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>$/)
    if (codeMatch) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'code',
        content: codeMatch[1],
      })
      return
    }

    // Default to HTML block
    if (trimmed.startsWith('<')) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'html',
        content: trimmed,
      })
    }
  })

  return blocks
}

// Convert content blocks to HTML
export function contentBlocksToHtml(blocks: ContentBlock[]): string {
  if (!blocks || !Array.isArray(blocks)) {
    return ''
  }

  return blocks
    .map((block) => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${block.content}</p>`
        case 'heading':
          return `<h${block.level}>${block.content}</h${block.level}>`
        case 'image': {
          const optimizedSrc = getOptimizedImageUrl(block.src, 'large')
          const srcset = generateSrcSet(block.src)
          return `<img src="${optimizedSrc}" srcset="${srcset}" sizes="(max-width: 1024px) 100vw, 1024px" alt="${block.alt || ''}" loading="lazy" />`
        }
        case 'list': {
          const tag = block.listType === 'ordered' ? 'ol' : 'ul'
          return `<${tag}>${block.content}</${tag}>`
        }
        case 'blockquote':
          return `<blockquote>${block.content}</blockquote>`
        case 'table':
          return block.content
        case 'code':
          return `<pre><code>${block.content}</code></pre>`
        case 'html':
          return block.content
        default: {
          // Type guard to ensure exhaustive check
          // const _exhaustiveCheck: never = block
          return ''
        }
      }
    })
    .join('\n')
}

// Helper function to support legacy format with metadata/attributes
export function convertLegacyBlock(block: Record<string, unknown>): ContentBlock {
  const id = typeof block.id === 'string' ? block.id : crypto.randomUUID()
  const type = String(block.type)

  switch (type) {
    case 'paragraph':
      return { id, type: 'paragraph', content: String(block.content || '') }

    case 'heading': {
      const metadata = block.metadata as Record<string, unknown> | undefined
      const attributes = block.attributes as Record<string, unknown> | undefined
      const level = Number(metadata?.level || attributes?.level || block.level || 2)
      return {
        id,
        type: 'heading',
        level: (level >= 1 && level <= 6 ? level : 2) as 1 | 2 | 3 | 4 | 5 | 6,
        content: String(block.content || ''),
      }
    }

    case 'image': {
      const metadata = block.metadata as Record<string, unknown> | undefined
      const attributes = block.attributes as Record<string, unknown> | undefined
      return {
        id,
        type: 'image',
        src: String(metadata?.src || attributes?.src || block.src || ''),
        alt: String(metadata?.alt || attributes?.alt || block.alt || ''),
      }
    }

    case 'list': {
      const metadata = block.metadata as Record<string, unknown> | undefined
      const attributes = block.attributes as Record<string, unknown> | undefined
      const listType = String(metadata?.style || attributes?.listType || block.listType || 'unordered')
      const contentValue = block.content
      const content = Array.isArray(contentValue)
        ? `<li>${contentValue.map((item) => String(item)).join('</li><li>')}</li>`
        : String(contentValue || '')
      return {
        id,
        type: 'list',
        listType: listType === 'ordered' ? 'ordered' : 'unordered',
        content,
      }
    }

    case 'quote':
    case 'blockquote':
      return { id, type: 'blockquote', content: String(block.content || '') }

    case 'code':
      return { id, type: 'code', content: String(block.content || '') }

    case 'table':
      return { id, type: 'table', content: String(block.content || '') }

    case 'html':
      return { id, type: 'html', content: String(block.content || '') }

    default:
      return { id, type: 'html', content: String(block.content || '') }
  }
}

// Convert legacy blocks array to ContentBlock[]
export function convertLegacyBlocks(blocks: unknown[]): ContentBlock[] {
  if (!Array.isArray(blocks)) return []
  return blocks.map((block) => convertLegacyBlock(block as Record<string, unknown>))
}
