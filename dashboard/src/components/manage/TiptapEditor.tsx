import { useEditor, EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import { useEffect, useState } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { ImageWithStyle } from './ImageWithStyleExtension'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  ImageIcon,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import MediaPickerModal from './MediaPickerModal'
import ImageOptionsModal, { type ImageOptions } from './ImageOptionsModal'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  readOnly?: boolean
  className?: string
  showToolbar?: boolean
  height?: string
  enableImages?: boolean
}

const ToolbarButton = ({ 
  onClick, 
  active = false, 
  disabled = false, 
  title, 
  children 
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    className={cn('h-8 w-8 p-0 flex-shrink-0', active && 'bg-muted')}
    title={title}
  >
    {children}
  </Button>
)

const MenuBar = ({
  editor,
  enableImages = false,
  onImageClick,
}: {
  editor: Editor
  enableImages?: boolean
  onImageClick?: () => void
}) => {
  if (!editor) {
    return null
  }

  const tools = (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Negrita"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Cursiva"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Subrayado"
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Tachado"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="Código"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Título 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Título 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Título 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Lista"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Lista numerada"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Cita"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })}
        title="Alinear izquierda"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })}
        title="Centrar"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })}
        title="Alinear derecha"
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        active={editor.isActive({ textAlign: 'justify' })}
        title="Justificar"
      >
        <AlignJustify className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Deshacer"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Rehacer"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>

      {enableImages && (
        <>
          <div className="mx-1 h-6 w-px bg-border" />
          <ToolbarButton
            onClick={() => onImageClick && onImageClick()}
            title="Insertar imagen"
          >
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
        </>
      )}
    </>
  )

  return (
    <>
      {/* Desktop toolbar */}
      <div className="hidden sm:flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 bg-muted/50 p-2">
        {tools}
      </div>
      
      {/* Mobile toolbar */}
      <div className="flex sm:hidden items-center justify-between rounded-t-lg border border-b-0 bg-muted/50 p-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px]">
            <SheetHeader>
              <SheetTitle>Herramientas de edición</SheetTitle>
            </SheetHeader>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {tools}
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Negrita"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Cursiva"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          {enableImages && (
            <ToolbarButton
              onClick={() => onImageClick && onImageClick()}
              title="Insertar imagen"
            >
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
          )}
        </div>
      </div>
    </>
  )
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = 'Escribe aquí...',
  readOnly = false,
  className = '',
  showToolbar = true,
  height = '400px',
  enableImages = false,
}: TiptapEditorProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [showImageOptions, setShowImageOptions] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ url: string; title?: string } | null>(null)
  const [editingImage, setEditingImage] = useState<HTMLImageElement | null>(null)

  const extensions = enableImages
    ? [
        StarterKit,
        Placeholder.configure({
          placeholder,
          emptyEditorClass: 'is-editor-empty',
        }),
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary hover:underline',
          },
        }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        ImageWithStyle.configure({
          HTMLAttributes: {
            class: 'rounded-lg',
          },
        }),
      ]
    : [
        StarterKit,
        Placeholder.configure({
          placeholder,
          emptyEditorClass: 'is-editor-empty',
        }),
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary hover:underline',
          },
        }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
      ]

  const editor = useEditor({
    extensions,
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
  })

  // Update editor state when readOnly changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly)
    }
  }, [editor, readOnly])

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  // Add click handler for images
  useEffect(() => {
    if (!editor || !enableImages) return

    const handleImageClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'IMG' && target.closest('.ProseMirror')) {
        event.preventDefault()
        event.stopPropagation()
        
        // Find the position of the clicked image in the editor
        const pos = editor.view.posAtDOM(target, 0)
        if (pos >= 0) {
          // Select the image node
          editor.commands.setNodeSelection(pos)
          setEditingImage(target as HTMLImageElement)
          setShowImageOptions(true)
        }
      }
    }

    editor.view.dom.addEventListener('click', handleImageClick)

    return () => {
      editor.view.dom.removeEventListener('click', handleImageClick)
    }
  }, [editor, enableImages])

  return (
    <>
      <div className={cn('overflow-hidden rounded-lg border', className)}>
        {showToolbar && !readOnly && editor && (
          <MenuBar editor={editor} enableImages={enableImages} onImageClick={() => setShowMediaPicker(true)} />
        )}
        <EditorContent
          editor={editor}
          className={cn(
            'prose prose-sm max-w-none p-4',
            'dark:prose-invert',
            'prose-headings:font-semibold',
            'prose-p:leading-7',
            'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
            'prose-blockquote:border-l-4 prose-blockquote:border-muted prose-blockquote:pl-4 prose-blockquote:italic',
            'prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-foreground',
            'prose-pre:bg-muted',
            'prose-img:rounded-lg',
            'prose-table:border-collapse prose-table:border prose-table:border-muted',
            'prose-th:border prose-th:border-muted prose-th:bg-muted/50 prose-th:p-2',
            'prose-td:border prose-td:border-muted prose-td:p-2',
            'focus:outline-none',
            '[&_.ProseMirror]:outline-none',
            '[&_.ProseMirror]:min-h-[200px]',
            '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground',
            '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
            '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left',
            '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none',
            '[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0',
          )}
          style={{ minHeight: height }}
        />
      </div>

      {showMediaPicker && editor && (
        <MediaPickerModal
          open={showMediaPicker}
          onOpenChange={(open) => setShowMediaPicker(open)}
          onSelect={(images) => {
            if (images.length > 0) {
              setSelectedImage({ url: images[0].url, title: images[0].title })
              setShowMediaPicker(false)
              setTimeout(() => {
                setShowImageOptions(true)
              }, 100)
            }
          }}
          multiSelect={false}
        />
      )}
      {showImageOptions && (selectedImage || editingImage) && editor && (() => {
        const initialOptions = editingImage
          ? (() => {
              const style = editingImage.style
              const width = style.width || '50%'
              const height = style.height || 'auto'
              // Determine size based on width
              let size: 'small' | 'medium' | 'large' | 'full' | 'custom' = 'custom'
              if (width === '25%') size = 'small'
              else if (width === '50%') size = 'medium'
              else if (width === '75%') size = 'large'
              else if (width === '100%') size = 'full'
              
              return {
                size,
                width: size === 'custom' ? width : undefined,
                height: height,
                customHeight: height !== 'auto' ? height : undefined,
                border: !!style.border && style.border !== 'none',
              }
            })()
          : { size: 'medium' as const, border: false }
        
        return (
          <ImageOptionsModal
            open={showImageOptions}
            onOpenChange={(open: boolean) => {
              setShowImageOptions(open)
              if (!open) {
                setEditingImage(null)
                setSelectedImage(null)
              }
            }}
            initialOptions={initialOptions}
            isEditing={!!editingImage}
          onDelete={
            editingImage
              ? () => {
                  // Delete the image
                  const { from } = editor.state.selection
                  editor.chain().focus().deleteRange({ from, to: from + 1 }).run()
                  onChange(editor.getHTML())
                  setEditingImage(null)
                  setShowImageOptions(false)
                }
              : undefined
          }
          onConfirm={(options: ImageOptions) => {
            // Build style string with all options
            const styles: string[] = []
            styles.push(`width: ${options.width || '50%'}`)
            styles.push(`height: ${options.height || 'auto'}`)
            styles.push('display: block')
            styles.push('margin-left: auto')
            styles.push('margin-right: auto')
            
            if (options.border) {
              styles.push('border: 2px solid #e5e7eb')
              styles.push('border-radius: 0.5rem')
            }
            
            const styleString = styles.join('; ')
            
            if (editingImage) {
              // Update existing image
              const { from } = editor.state.selection
              const node = editor.state.doc.nodeAt(from)
              
              if (node && node.type.name === 'image') {
                // Actualizar los atributos del nodo
                editor.chain()
                  .focus()
                  .setNodeSelection(from)
                  .updateAttributes('image', {
                    src: node.attrs.src,
                    alt: node.attrs.alt,
                    title: node.attrs.title,
                    style: styleString
                  })
                  .run()
                  
                // Forzar actualización del HTML
                setTimeout(() => {
                  onChange(editor.getHTML())
                }, 100)
              }
            } else if (selectedImage) {
              // Insert new image
              editor.commands.setImageWithStyle({
                src: selectedImage.url,
                alt: selectedImage.title || '',
                style: styleString
              })
              onChange(editor.getHTML())
            }
            
            setShowImageOptions(false)
            setSelectedImage(null)
            setEditingImage(null)
          }}
        />
      )})()}
    </>
  )
}