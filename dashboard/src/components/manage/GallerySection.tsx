import { useState, useEffect } from 'react'
import { Plus, X, GripVertical, Loader2, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import MediaPickerModal from './MediaPickerModal'
import ResponsiveImage from './ResponsiveImage'

// Generate a simple unique key
const generateKey = () => `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

interface GalleryImage {
  id: number | string
  url: string
  filename: string
  title?: string
  altText?: string
  width?: number
  height?: number
  order?: number
  _key?: string // Internal key for React rendering
}

interface GallerySectionProps {
  entityId: number
  entityType: 'species' | 'protected_area'
  images: GalleryImage[]
  onUpdate: (images: GalleryImage[]) => void
  isDisabled: boolean
  updating?: boolean
  fieldSuccess?: boolean
}

export default function GallerySection({
  images = [],
  onUpdate,
  isDisabled,
  updating,
  fieldSuccess,
}: GallerySectionProps) {
  // Initialize images with keys only once
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(() =>
    images.map((img) => ({
      ...img,
      _key: img._key || generateKey(),
    })),
  )
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    // Only update if the images prop has actually changed (different IDs)
    const currentIds = galleryImages
      .map((img) => img.id)
      .sort()
      .join(',')
    const newIds = images
      .map((img) => img.id)
      .sort()
      .join(',')

    if (currentIds !== newIds) {
      // Preserve existing keys for images that already exist
      const keyMap = new Map(galleryImages.map((img) => [img.id, img._key]))

      const imagesWithKeys = images.map((img) => ({
        ...img,
        _key: keyMap.get(img.id) || img._key || generateKey(),
      }))
      setGalleryImages(imagesWithKeys)
    }
  }, [images])

  const handleImagesSelected = async (selectedImages: GalleryImage[]) => {
    // Filter out any images that are already in the gallery (by ID)
    const existingIds = new Set(galleryImages.map((img) => img.id))
    const uniqueNewImages = selectedImages.filter((img) => !existingIds.has(img.id))

    if (uniqueNewImages.length === 0) {
      return // No new images to add
    }

    // Add new images to the gallery with unique keys
    const newImages = uniqueNewImages.map((img, index) => ({
      ...img,
      order: galleryImages.length + index,
      _key: generateKey(),
    }))

    const updatedImages = [...galleryImages, ...newImages]
    setGalleryImages(updatedImages)

    // Update the parent component
    onUpdate(updatedImages)
  }

  const handleRemoveImage = async (imageId: number | string) => {
    const updatedImages = galleryImages.filter((img) => img.id !== imageId)
    setGalleryImages(updatedImages)
    onUpdate(updatedImages)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const draggedImage = galleryImages[draggedIndex]
    const newImages = [...galleryImages]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)

    // Update order values
    const reorderedImages = newImages.map((img, idx) => ({ ...img, order: idx }))
    setGalleryImages(reorderedImages)
    setDraggedIndex(index)
  }

  const handleDrop = () => {
    if (draggedIndex !== null) {
      const reorderedImages = galleryImages.map((img, idx) => ({ ...img, order: idx }))
      onUpdate(reorderedImages)
    }
    handleDragEnd()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Galería de imágenes
            {updating && <Loader2 className="h-3 w-3 animate-spin" />}
            {fieldSuccess && <Check className="h-3 w-3 text-green-600" />}
          </CardTitle>
          <CardDescription>Agrega imágenes adicionales para mostrar en la galería</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {galleryImages.map((image, index) => (
                  <div
                    key={image._key || `${image.id}-${index}`}
                    draggable={!isDisabled}
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={handleDrop}
                    className={cn(
                      'group relative overflow-hidden rounded-lg bg-muted',
                      isDragging && draggedIndex === index && 'opacity-50',
                      !isDisabled && 'cursor-move',
                    )}
                  >
                    <div className="aspect-square">
                      <ResponsiveImage
                        src={image.url}
                        alt={image.altText || image.title || image.filename}
                        className="h-full w-full object-cover"
                        variant="small"
                      />
                    </div>

                    {!isDisabled && (
                      <>
                        <div className="absolute top-2 left-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="rounded bg-black/50 p-1">
                            <GripVertical className="h-4 w-4 text-white" />
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => handleRemoveImage(image.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    )}

                    {image.title && (
                      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="truncate text-xs text-white">{image.title}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMediaPicker(true)}
              disabled={isDisabled}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar imágenes
            </Button>
          </div>
        </CardContent>
      </Card>

      <MediaPickerModal
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
        onSelect={handleImagesSelected}
        multiSelect={true}
      />
    </>
  )
}
