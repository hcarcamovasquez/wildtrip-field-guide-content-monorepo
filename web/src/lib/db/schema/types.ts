// Types for content blocks compatible with TinyMCE
export interface BlockBase {
  id: string
  type: string
}

export interface ParagraphBlock extends BlockBase {
  type: 'paragraph'
  content: string
  // TinyMCE-compatible attributes
  format?: {
    textAlign?: 'left' | 'center' | 'right' | 'justify'
    styles?: {
      fontWeight?: string
      fontStyle?: string
      textDecoration?: string
      color?: string
      backgroundColor?: string
    }
  }
}

export interface HeadingBlock extends BlockBase {
  type: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  content: string
  // TinyMCE-compatible attributes
  format?: {
    textAlign?: 'left' | 'center' | 'right'
    id?: string // For anchor links
  }
}

export interface ImageBlock extends BlockBase {
  type: 'image'
  src: string // TinyMCE uses 'src' instead of 'url'
  alt: string
  caption?: string
  width?: string | number
  height?: string | number
  // TinyMCE-compatible attributes
  style?: {
    float?: 'left' | 'right' | 'none'
    margin?: string
    marginLeft?: string
    marginRight?: string
    marginTop?: string
    marginBottom?: string
    border?: string
    borderRadius?: string
    boxShadow?: string
    display?: string
  }
  link?: {
    href?: string
    target?: '_blank' | '_self'
    rel?: string
  }
}

export interface TableBlock extends BlockBase {
  type: 'table'
  content: string // TinyMCE typically handles tables as HTML content
  // TinyMCE-compatible attributes
  style?: {
    borderCollapse?: 'collapse' | 'separate'
    width?: string
    height?: string
  }
  attributes?: {
    border?: string
    cellpadding?: string
    cellspacing?: string
    align?: 'left' | 'center' | 'right'
  }
}

export interface ListBlock extends BlockBase {
  type: 'list'
  listType: 'ordered' | 'unordered' | 'checklist'
  content: string // TinyMCE typically handles lists as HTML content
}

export interface QuoteBlock extends BlockBase {
  type: 'blockquote'
  content: string // TinyMCE typically handles blockquotes as HTML content
  cite?: string
}

export interface CodeBlock extends BlockBase {
  type: 'code'
  content: string
  language?: string
}

export interface HtmlBlock extends BlockBase {
  type: 'html'
  content: string // Raw HTML content
}

// Rich content document structure
export interface RichContent {
  blocks: ContentBlock[]
  // Optional metadata
  version?: string
  meta?: {
    wordcount?: number
    charcount?: number
  }
}

export type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | TableBlock
  | ListBlock
  | QuoteBlock
  | CodeBlock
  | HtmlBlock
