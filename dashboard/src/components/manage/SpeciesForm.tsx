import { useState, useEffect } from 'react'
import {
  AlertCircle,
  Check,
  Info,
  X,
  Loader2,
  Eye,
  Send,
  Edit3,
  Trash2,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import TiptapEditor from './TiptapEditor'
import { richContentToHtml, htmlToRichContent } from '@/lib/utils/tiptap-converter'
import MediaPickerModal from './MediaPickerModal'
import PreviewModal from './PreviewModal'
import LockBanner from './LockBanner'
import GallerySection from './GallerySection'
import SEOFieldsSection from './SEOFieldsSection'
import type { SpeciesWithDetails } from '@/types'
import { CONSERVATION_STATUSES, MAIN_GROUPS } from '@wildtrip/shared'
import type { ContentBlock, ImageBlock, RichContent } from '@wildtrip/shared/types'
import { apiClient } from '@/lib/api/client'

interface SpeciesFormProps {
  species: SpeciesWithDetails
  currentUserId: number
  isEditing: boolean
}

interface SpeciesData {
  scientificName: string
  commonName: string
  family: string
  order: string
  class: string
  phylum: string
  kingdom: string
  mainGroup: string
  specificCategory: string
  description: string
  habitat: string
  distribution: string
  conservationStatus: string
  mainImage?: {
    id: string
    url: string
    galleryId: number
  } | null
  galleryImages?: Array<{
    id: string
    url: string
    galleryId: number
  }> | null
  distinctiveFeatures?: Record<string, unknown>
  references?: Record<string, unknown>
  richContent?: RichContent
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
}

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function SpeciesForm({ species, currentUserId, isEditing }: SpeciesFormProps) {
  // Determine if we're editing a draft of published content
  const isEditingDraft = species.status === 'published' && species.hasDraft
  const effectiveData = isEditingDraft && species.draftData ? { ...species, ...species.draftData } : species

  const [formData, setFormData] = useState<SpeciesData>({
    scientificName: effectiveData.scientificName || '',
    commonName: effectiveData.commonName || '',
    family: effectiveData.family || '',
    order: effectiveData.order || '',
    class: effectiveData.class || '',
    phylum: effectiveData.phylum || '',
    kingdom: effectiveData.kingdom || '',
    mainGroup: effectiveData.mainGroup || '',
    specificCategory: effectiveData.specificCategory || '',
    description: effectiveData.description || '',
    habitat: effectiveData.habitat || '',
    distribution: typeof effectiveData.distribution === 'string' ? effectiveData.distribution : '',
    conservationStatus: effectiveData.conservationStatus || '',
    mainImage: effectiveData.mainImage || null,
    galleryImages: effectiveData.galleryImages || [],
    distinctiveFeatures:
      typeof effectiveData.distinctiveFeatures === 'string' ? {} : effectiveData.distinctiveFeatures || {},
    references: Array.isArray(effectiveData.references) ? {} : effectiveData.references || {},
    richContent: effectiveData.richContent || { blocks: [] },
    seoTitle: effectiveData.seoTitle || '',
    seoDescription: effectiveData.seoDescription || '',
    seoKeywords: effectiveData.seoKeywords || '',
  })

  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasLock, setHasLock] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [lockError, setLockError] = useState<string | null>(null)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [fieldSuccess, setFieldSuccess] = useState<string | null>(null)
  const [hasDraft, setHasDraft] = useState(species.hasDraft)
  const [galleryImages, setGalleryImages] = useState<
    Array<{
      id: number
      url: string
      filename: string
      title?: string
      altText?: string
      width?: number
      height?: number
      order?: number
    }>
  >([])
  const [loadingGallery, setLoadingGallery] = useState(false)
  const [editorContent, setEditorContent] = useState(() => {
    return formData?.richContent?.blocks ? richContentToHtml(formData.richContent) : ''
  })

  // Check lock status on mount
  useEffect(() => {
    // Check if species already has lock info from server
    if (species.lock) {
      if (species.lock.userId === String(currentUserId)) {
        // User already has the lock, enable edit mode
        setIsEditMode(true)
        setHasLock(true)
      } else {
        // Someone else has the lock
        setIsLocked(true)
        setLockError(`Este contenido está siendo editado por ${species.lock.userName || 'otro usuario'}`)
      }
    } else {
      // No lock info from server, check via API
      checkLockStatus()
    }

    // Load gallery images if editing
    if (isEditing && species.id) {
      fetchGalleryImages()
    }
  }, [])

  // Release lock when component unmounts or when hasLock changes
  useEffect(() => {
    return () => {
      if (hasLock && species.id) {
        // Use navigator.sendBeacon for reliable cleanup
        navigator.sendBeacon(`${import.meta.env.VITE_API_URL}/api/species/${species.id}/lock`, JSON.stringify({ method: 'DELETE' }))
      }
    }
  }, [hasLock, species.id])

  const checkLockStatus = async () => {
    try {
      const data = await apiClient.species.checkLock(species.id)

      if (data.isLocked) {
        if (data.lockedBy === currentUserId) {
          // User already has the lock, enable edit mode
          setIsEditMode(true)
          setHasLock(true)
        } else {
          // Someone else has the lock
          setIsLocked(true)
          setLockError(`Este contenido está siendo editado por ${data.lockOwner?.name || 'otro usuario'}`)
        }
      }
    } catch (error) {
      console.error('Error checking lock:', error)
    }
  }

  const releaseLock = async () => {
    try {
      await apiClient.species.unlock(species.id)
      setHasLock(false)
    } catch (error) {
      console.error('Error releasing lock:', error)
    }
  }

  const handleEnterEditMode = async () => {
    if (!species.id) return

    try {
      await apiClient.species.lock(species.id)
      setIsEditMode(true)
      setShowEditConfirm(false)
      setLockError(null)
      setHasLock(true)
    } catch (error: any) {
      console.error('Error acquiring lock:', error)
      if (error.response?.status === 409) {
        const data = error.response.data
        setLockError(`Este contenido está siendo editado por ${data.lockOwner?.name || 'otro usuario'}`)
      } else {
        setLockError('Error al intentar editar el contenido')
      }
    }
  }

  const handleFieldChange = (field: keyof SpeciesData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const fetchGalleryImages = async () => {
    setLoadingGallery(true)
    try {
      // Gallery images are now stored in the species entity itself
      // Use effectiveData to get draft data if available
      const galleryImagesData = effectiveData.galleryImages || []

      // Transform the gallery images to the format expected by GallerySection
      const transformedImages = galleryImagesData.map(
        (img: { id: string; url: string; galleryId: number }, index: number) => ({
          id: img.galleryId || 0,
          url: img.url,
          filename: img.url.split('/').pop() || 'image.jpg',
          _key: img.id || `gallery-${Date.now()}-${index}`,
        }),
      )

      setGalleryImages(transformedImages)
    } catch (error) {
      console.error('Error loading gallery images:', error)
    } finally {
      setLoadingGallery(false)
    }
  }

  const handleGalleryUpdate = async (
    images: Array<{
      id: number | string
      url: string
      filename: string
      title?: string
      altText?: string
      width?: number
      height?: number
      order?: number
      _key?: string
    }>,
  ) => {
    // Convert string IDs to numbers, using 0 as fallback for non-numeric IDs
    const convertedImages = images.map((img) => ({
      ...img,
      id: typeof img.id === 'number' ? img.id : parseInt(img.id as string) || 0,
    }))
    setGalleryImages(convertedImages)
    
    // Transform gallery images to the format expected by the backend
    const galleryImagesData = convertedImages.map((img) => ({
      id: img._key || crypto.randomUUID(),
      url: img.url,
      galleryId: img.id,
    }))
    
    // Save to backend
    await handleFieldBlur('galleryImages', galleryImagesData)
  }

  const handleFieldBlur = async (field: string, value: unknown, required = false) => {
    if (!isEditMode || !species.id) return

    // Validate required fields
    if (required && !value) {
      return
    }

    setUpdating(field)

    try {
      const data = await apiClient.species.update(species.id, { [field]: value })
      
      setFieldSuccess(field)
      setTimeout(() => setFieldSuccess(null), 3000)

      // Update hasDraft based on server response
      if (species.status === 'published' && data.hasDraft !== undefined) {
        setHasDraft(data.hasDraft)
        
        // If the response includes draft data, update the form data with the merged state
        if (data.draftData) {
          const mergedData = { ...species, ...data.draftData }
          
          if (data.field === 'mainImage') {
            setFormData(prev => ({
              ...prev,
              mainImage: mergedData.mainImage || null
            }))
          } else if (data.field === 'galleryImages') {
            setFormData(prev => ({
              ...prev,
              galleryImages: mergedData.galleryImages || []
            }))
            
            // Also update the gallery images state
            const galleryImagesData = mergedData.galleryImages || []
            const transformedImages = galleryImagesData.map(
              (img: { id: string; url: string; galleryId: number }, index: number) => ({
                id: img.galleryId || 0,
                url: img.url,
                filename: img.url.split('/').pop() || 'image.jpg',
                _key: img.id || `gallery-${Date.now()}-${index}`,
              })
            )
            setGalleryImages(transformedImages)
          }
        }
      }
    } catch (error) {
      console.error(`Error saving ${field}:`, error)
    } finally {
      setUpdating(null)
    }
  }

  const handlePublish = async () => {
    setShowPublishDialog(false)
    setIsSaving(true)
    try {
      let response

      if (species.status === 'published' && hasDraft) {
        // Publish draft changes
        // For now, use update to publish (backend needs publish endpoint)
        response = await apiClient.species.update(species.id, { status: 'published' })
      } else {
        // First time publish
        response = await apiClient.species.update(species.id, { 
          status: 'published', 
          publishedAt: new Date().toISOString() 
        })
      }

      if (response.ok) {
        window.location.reload()
      } else {
        throw new Error('Error al publicar')
      }
    } catch (error) {
      console.error('Error publishing species:', error)
      alert('Error al publicar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscardDraft = async () => {
    setShowDiscardDialog(false)
    setIsSaving(true)

    try {
      // For now, reload to discard changes (backend needs discard endpoint)
      window.location.reload()

      // Recargar la página para mostrar la versión publicada
      window.location.reload()
    } catch (error) {
      console.error('Error discarding draft:', error)
      alert('Error al descartar los cambios')
    } finally {
      setIsSaving(false)
    }
  }

  const isFieldDisabled = isLocked || !isEditMode

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-20">
      {/* Lock banner */}
      {lockError && (
        <div className="mb-6">
          <LockBanner lockedBy={lockError} />
        </div>
      )}

      {/* Read-only mode card */}
      {!isEditMode && !lockError && (
        <Card className="mb-6">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">El contenido está en modo de solo lectura</span>
            </div>
            <Button type="button" size="sm" onClick={() => setShowEditConfirm(true)}>
              <Edit3 className="mr-2 h-4 w-4" />
              Editar contenido
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit mode alert */}
      {isEditMode && (
        <Alert className="mb-6">
          <Edit3 className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Estás en modo de edición. Los cambios se guardarán automáticamente.</span>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowExitDialog(true)}>
              Salir del modo edición
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Toolbar superior */}
        <div className="sticky top-0 z-10 mb-6 border-b bg-background px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <h1 className="text-lg font-semibold sm:text-xl">{isEditing ? 'Editar Especie' : 'Nueva Especie'}</h1>
              <div className="flex items-center gap-2">
                {species.status === 'draft' && <Badge variant="secondary">Borrador</Badge>}
                {species.status === 'published' && !hasDraft && (
                  <Badge variant="default">Publicado</Badge>
                )}
                {species.status === 'published' && hasDraft && (
                  <Badge variant="outline" className="border-amber-500 text-amber-700">
                    Publicado con cambios
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Vista previa - siempre visible cuando hay ID */}
              {isEditing && species.id && (
                <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} type="button">
                  <Eye className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Vista previa</span>
                </Button>
              )}

              {/* Botón de descartar cambios - solo para contenido publicado con draft */}
              {species.status === 'published' && hasDraft && isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDiscardDialog(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Descartar cambios</span>
                </Button>
              )}

              {/* Botón de salir del modo edición */}
              {isEditMode && (
                <Button type="button" variant="outline" size="sm" onClick={() => setShowExitDialog(true)}>
                  <X className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Salir de edición</span>
                </Button>
              )}

              {/* Botón de publicar/publicar cambios */}
              {isEditMode && (
                <>
                  {/* Publicar borrador */}
                  {species.status === 'draft' && (
                    <Button type="button" size="sm" onClick={() => setShowPublishDialog(true)} disabled={isSaving}>
                      <Send className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Publicar</span>
                    </Button>
                  )}
                  
                  {/* Publicar cambios (solo si hay draft) */}
                  {species.status === 'published' && hasDraft && (
                    <Button type="button" size="sm" onClick={() => setShowPublishDialog(true)} disabled={isSaving}>
                      <Send className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Publicar cambios</span>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Draft alert for published content */}
        {species.status === 'published' && hasDraft && isEditMode && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Estás editando un borrador de contenido publicado. Los cambios no serán visibles públicamente hasta que
              publiques el borrador.
            </AlertDescription>
          </Alert>
        )}


        {/* Grid de 2 columnas */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Columna izquierda - Información básica */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Información básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Nombre científico *{updating === 'scientificName' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'scientificName' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Input
                      value={formData.scientificName}
                      onChange={(e) => handleFieldChange('scientificName', e.target.value)}
                      onBlur={() => handleFieldBlur('scientificName', formData.scientificName, true)}
                      disabled={isFieldDisabled}
                      className="italic"
                      placeholder="Ej: Puma concolor"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Nombre común *{updating === 'commonName' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'commonName' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Input
                      value={formData.commonName}
                      onChange={(e) => handleFieldChange('commonName', e.target.value)}
                      onBlur={() => handleFieldBlur('commonName', formData.commonName, true)}
                      disabled={isFieldDisabled}
                      placeholder="Ej: Puma"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Estado de conservación
                      {updating === 'conservationStatus' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'conservationStatus' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Select
                      value={formData.conservationStatus}
                      onValueChange={(value) => {
                        handleFieldChange('conservationStatus', value)
                        handleFieldBlur('conservationStatus', value)
                      }}
                      disabled={isFieldDisabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONSERVATION_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.emoji} {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>URL amigable</Label>
                    <Input value={generateSlug(formData.scientificName)} disabled readOnly className="bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={species.status || 'draft'} disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                        <SelectItem value="archived">Archivado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Columna derecha - Contenido y configuración */}
          <div className="space-y-6 lg:col-span-8">
            {/* Imagen principal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Imagen de portada
                  {updating === 'mainImage' && <Loader2 className="h-3 w-3 animate-spin" />}
                  {fieldSuccess === 'mainImage' && <Check className="h-3 w-3 text-green-600" />}
                </CardTitle>
                <CardDescription>Arrastra o selecciona una imagen para la portada de la especie</CardDescription>
              </CardHeader>
              <CardContent>
                {formData.mainImage?.url ? (
                  <div className="relative">
                    <img
                      src={formData.mainImage.url}
                      alt="Imagen de portada"
                      className="h-64 w-full rounded-lg object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={() => setShowMediaPicker(true)}
                        disabled={isFieldDisabled}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          handleFieldChange('mainImage', null)
                          handleFieldBlur('mainImage', null)
                        }}
                        disabled={isFieldDisabled}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowMediaPicker(true)}
                    disabled={isFieldDisabled}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Seleccionar imagen principal
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Galería de imágenes */}
            {isEditing && species.id && (
              <GallerySection
                entityId={species.id}
                entityType="species"
                images={galleryImages}
                onUpdate={handleGalleryUpdate}
                isDisabled={isFieldDisabled || loadingGallery}
                updating={updating === 'gallery'}
                fieldSuccess={fieldSuccess === 'gallery'}
              />
            )}

            {/* SEO */}
            <SEOFieldsSection
              seoTitle={formData.seoTitle || ''}
              seoDescription={formData.seoDescription || ''}
              seoKeywords={formData.seoKeywords || ''}
              onSeoTitleChange={(value) => {
                setFormData((prev) => ({ ...prev, seoTitle: value }))
                handleFieldBlur('seoTitle', value)
              }}
              onSeoDescriptionChange={(value) => {
                setFormData((prev) => ({ ...prev, seoDescription: value }))
                handleFieldBlur('seoDescription', value)
              }}
              onSeoKeywordsChange={(value) => {
                setFormData((prev) => ({ ...prev, seoKeywords: value }))
                handleFieldBlur('seoKeywords', value)
              }}
              generateData={{
                type: 'species',
                data: {
                  commonName: formData.commonName,
                  scientificName: formData.scientificName,
                  description: formData.description,
                  habitat: formData.habitat,
                  conservationStatus: formData.conservationStatus,
                },
              }}
              disabled={isFieldDisabled}
            />

            {/* Categoría */}
            <Card>
              <CardHeader>
                <CardTitle>Categoría</CardTitle>
                <CardDescription>Clasificación por grupo y categoría específica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Grupo principal
                      {updating === 'mainGroup' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'mainGroup' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Select
                      value={formData.mainGroup}
                      onValueChange={(value) => {
                        handleFieldChange('mainGroup', value)
                        handleFieldBlur('mainGroup', value)
                      }}
                      disabled={isFieldDisabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {MAIN_GROUPS.map((group) => (
                          <SelectItem key={group.value} value={group.value}>
                            {group.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Categoría específica
                      {updating === 'specificCategory' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'specificCategory' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Input
                      value={formData.specificCategory}
                      onChange={(e) => handleFieldChange('specificCategory', e.target.value)}
                      onBlur={() => handleFieldBlur('specificCategory', formData.specificCategory)}
                      disabled={isFieldDisabled}
                      placeholder="Ej: Felino"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información taxonómica */}
            <Card>
              <CardHeader>
                <CardTitle>Información taxonómica</CardTitle>
                <CardDescription>Clasificación científica de la especie</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Reino
                      {updating === 'kingdom' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'kingdom' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Input
                      value={formData.kingdom}
                      onChange={(e) => handleFieldChange('kingdom', e.target.value)}
                      onBlur={() => handleFieldBlur('kingdom', formData.kingdom)}
                      disabled={isFieldDisabled}
                      placeholder="Ej: Animalia, Plantae, Fungi"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Filo
                      {updating === 'phylum' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'phylum' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Input
                      value={formData.phylum}
                      onChange={(e) => handleFieldChange('phylum', e.target.value)}
                      onBlur={() => handleFieldBlur('phylum', formData.phylum)}
                      disabled={isFieldDisabled}
                      placeholder="Ej: Chordata"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Clase
                      {updating === 'class' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'class' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Input
                      value={formData.class}
                      onChange={(e) => handleFieldChange('class', e.target.value)}
                      onBlur={() => handleFieldBlur('class', formData.class)}
                      disabled={isFieldDisabled}
                      placeholder="Ej: Mammalia"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Orden
                      {updating === 'order' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'order' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Input
                      value={formData.order}
                      onChange={(e) => handleFieldChange('order', e.target.value)}
                      onBlur={() => handleFieldBlur('order', formData.order)}
                      disabled={isFieldDisabled}
                      placeholder="Ej: Carnivora"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Familia
                      {updating === 'family' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'family' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Input
                      value={formData.family}
                      onChange={(e) => handleFieldChange('family', e.target.value)}
                      onBlur={() => handleFieldBlur('family', formData.family)}
                      disabled={isFieldDisabled}
                      placeholder="Ej: Felidae"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descripción general */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción general</CardTitle>
                <CardDescription>Información básica sobre la especie</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Descripción
                    {updating === 'description' && <Loader2 className="h-3 w-3 animate-spin" />}
                    {fieldSuccess === 'description' && <Check className="h-3 w-3 text-green-600" />}
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    onBlur={() => handleFieldBlur('description', formData.description)}
                    disabled={isFieldDisabled}
                    rows={4}
                    placeholder="Descripción general de la especie..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Hábitat
                    {updating === 'habitat' && <Loader2 className="h-3 w-3 animate-spin" />}
                    {fieldSuccess === 'habitat' && <Check className="h-3 w-3 text-green-600" />}
                  </Label>
                  <Textarea
                    value={formData.habitat}
                    onChange={(e) => handleFieldChange('habitat', e.target.value)}
                    onBlur={() => handleFieldBlur('habitat', formData.habitat)}
                    disabled={isFieldDisabled}
                    rows={3}
                    placeholder="Descripción del hábitat natural..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Distribución
                    {updating === 'distribution' && <Loader2 className="h-3 w-3 animate-spin" />}
                    {fieldSuccess === 'distribution' && <Check className="h-3 w-3 text-green-600" />}
                  </Label>
                  <Textarea
                    value={formData.distribution}
                    onChange={(e) => handleFieldChange('distribution', e.target.value)}
                    onBlur={() => handleFieldBlur('distribution', formData.distribution)}
                    disabled={isFieldDisabled}
                    rows={3}
                    placeholder="Distribución geográfica..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contenido detallado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Contenido detallado
                  {updating === 'richContent' && <Loader2 className="h-3 w-3 animate-spin" />}
                  {fieldSuccess === 'richContent' && <Check className="h-3 w-3 text-green-600" />}
                </CardTitle>
                <CardDescription>Información completa con formato enriquecido</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onBlur={() => {
                    // Auto-save on blur if content has changed
                    if (editorContent && isEditMode) {
                      const richContent = htmlToRichContent(editorContent)
                      const hasContent =
                        richContent.blocks.length > 0 &&
                        richContent.blocks.some((block: ContentBlock) => {
                          if (block.type === 'image') {
                            const imageBlock = block as ImageBlock
                            return !!imageBlock.src
                          }
                          return block.content && block.content.trim().length > 0
                        })

                      if (hasContent || !species?.richContent?.blocks?.length) {
                        handleFieldBlur('richContent', richContent)
                      }
                    }
                  }}
                >
                  <TiptapEditor
                    content={editorContent}
                    onChange={(value) => {
                      setEditorContent(value)

                      // Convert HTML to rich content
                      const richContent = htmlToRichContent(value)

                      // Update form data
                      setFormData((prev) => ({
                        ...prev,
                        richContent: richContent,
                      }))

                      // Save the content change
                      if (isEditMode && species.id) {
                        handleFieldBlur('richContent', richContent)
                      }
                    }}
                    placeholder="Escribe el contenido de la especie..."
                    height="500px"
                    readOnly={!isEditMode}
                    showToolbar={isEditMode}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Exit Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Salir del modo edición?</DialogTitle>
            <DialogDescription>Los cambios se guardan automáticamente al editar cada campo.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Seguir editando
            </Button>
            <Button
              onClick={async () => {
                await releaseLock()
                setIsEditMode(false)
                setShowExitDialog(false)
                window.location.reload()
              }}
            >
              Salir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Confirm Dialog */}
      <Dialog open={showEditConfirm} onOpenChange={setShowEditConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Entrar en modo edición?</DialogTitle>
            <DialogDescription>
              Al entrar en modo edición, otros usuarios no podrán editar este contenido hasta que termines.
            </DialogDescription>
          </DialogHeader>
          {lockError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{lockError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditConfirm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEnterEditMode}>Entrar en modo edición</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {species.status === 'published' && hasDraft ? '¿Publicar cambios?' : '¿Publicar especie?'}
            </DialogTitle>
            <DialogDescription>
              {species.status === 'published' && hasDraft
                ? 'Los cambios realizados se publicarán y estarán visibles públicamente.'
                : 'Una vez publicada, la especie será visible en el sitio público.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePublish} disabled={isSaving}>
              {isSaving
                ? 'Publicando...'
                : species.status === 'published' && hasDraft
                  ? 'Publicar cambios'
                  : 'Publicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discard Draft Dialog */}
      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Descartar cambios?</DialogTitle>
            <DialogDescription>
              Se descartarán todos los cambios realizados desde la última publicación. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiscardDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDiscardDraft} disabled={isSaving}>
              {isSaving ? 'Descartando...' : 'Descartar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
        onSelect={(items) => {
          if (items.length > 0) {
            const selectedImage = items[0]
            const mainImageData = {
              id: crypto.randomUUID(),
              url: selectedImage.url,
              galleryId: selectedImage.id,
            }
            handleFieldChange('mainImage', mainImageData)
            handleFieldBlur('mainImage', mainImageData)
            setShowMediaPicker(false)
          }
        }}
        multiSelect={false}
      />

      {/* Preview Modal */}
      {showPreview && species.id && (
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          previewUrl={`${import.meta.env.VITE_WEB_URL}/content/species/preview/${species.id}`}
          publicUrl={species.status === 'published' && !hasDraft ? `${import.meta.env.VITE_WEB_URL}/content/species/${species.slug}` : undefined}
          title={`Vista previa: ${species.commonName || species.scientificName}`}
        />
      )}
        </div>
      </div>
    </div>
  )
}
