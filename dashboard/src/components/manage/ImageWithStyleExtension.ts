import { Node, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export interface ImageOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageWithStyle: {
      /**
       * Add an image with style
       */
      setImageWithStyle: (options: { src: string; alt?: string; title?: string; style?: string }) => ReturnType
    }
  }
}

export const ImageWithStyle = Node.create<ImageOptions>({
  name: 'image',

  addOptions() {
    return {
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      style: {
        default: null,
        // Importante: parseHTML y renderHTML para preservar el style
        parseHTML: (element) => {
          const style = element.getAttribute('style')
          return style || null
        },
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {}
          }
          return {
            style: attributes.style,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64 ? 'img[src]' : 'img[src]:not([src^="data:"])',
        getAttrs: (node) => {
          if (typeof node === 'string') return false

          const element = node as HTMLElement

          // Extraer todos los atributos incluyendo style
          return {
            src: element.getAttribute('src'),
            alt: element.getAttribute('alt'),
            title: element.getAttribute('title'),
            style: element.getAttribute('style'),
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    // Asegurarnos de que el style se incluya en el HTML renderizado
    const { style, ...otherAttrs } = HTMLAttributes

    const attrs = mergeAttributes(this.options.HTMLAttributes, otherAttrs)

    // Agregar style si existe
    if (style) {
      attrs.style = style
    }

    return ['img', attrs]
  },

  addCommands() {
    return {
      setImageWithStyle:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageWithStyle'),
        props: {
          handleDOMEvents: {
            drop(view, event) {
              const hasFiles = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length

              if (!hasFiles) {
                return false
              }

              const images = Array.from(event.dataTransfer.files).filter((file) => /image/i.test(file.type))

              if (images.length === 0) {
                return false
              }

              event.preventDefault()

              const { schema } = view.state
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              })

              if (!coordinates) return false

              images.forEach((image) => {
                const reader = new FileReader()

                reader.onload = (readerEvent) => {
                  const node = schema.nodes.image.create({
                    src: readerEvent.target?.result,
                  })

                  const transaction = view.state.tr.insert(coordinates.pos, node)
                  view.dispatch(transaction)
                }

                reader.readAsDataURL(image)
              })

              return true
            },
            paste(view, event) {
              const hasFiles = event.clipboardData && event.clipboardData.files && event.clipboardData.files.length

              if (!hasFiles) {
                return false
              }

              const images = Array.from(event.clipboardData.files).filter((file) => /image/i.test(file.type))

              if (images.length === 0) {
                return false
              }

              event.preventDefault()

              const { schema } = view.state

              images.forEach((image) => {
                const reader = new FileReader()

                reader.onload = (readerEvent) => {
                  const node = schema.nodes.image.create({
                    src: readerEvent.target?.result,
                  })

                  const transaction = view.state.tr.replaceSelectionWith(node)
                  view.dispatch(transaction)
                }

                reader.readAsDataURL(image)
              })

              return true
            },
          },
        },
      }),
    ]
  },
})
