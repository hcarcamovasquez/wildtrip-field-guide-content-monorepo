import React, { useState, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
import { useToast } from '@/hooks/use-toast'
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

// Helper function to clean species data and avoid null/empty values
const cleanSpeciesData = (data: any): any => {
  return {
    ...data,
    // Ensure strings are never null
    commonName: data.commonName || '',
    scientificName: data.scientificName || '',
    slug: data.slug || '',
    description: data.description || '',
    habitat: data.habitat || '',
    distribution: data.distribution || '',
    distinctiveFeatures: data.distinctiveFeatures || '',
    seoTitle: data.seoTitle || '',
    seoDescription: data.seoDescription || '',
    seoKeywords: data.seoKeywords || '',
    family: data.family || '',
    order: data.order || '',
    class: data.class || '',
    phylum: data.phylum || '',
    kingdom: data.kingdom || '',
    specificCategory: data.specificCategory || '',
    // Handle enums - if empty string, set to undefined so they're not sent
    mainGroup: data.mainGroup || undefined,
    conservationStatus: data.conservationStatus || undefined,
    status: data.status || 'draft',
    // Keep other fields as they are
    mainImage: data.mainImage,
    galleryImages: data.galleryImages,
    richContent: data.richContent,
    references: data.references || [],
  }
}

export default function SpeciesForm({ species, currentUserId, isEditing }: SpeciesFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // Determine if we're editing a draft of published content
  const isEditingDraft = species.status === 'published' && species.hasDraft
  
  // Use useMemo to ensure effectiveData is computed correctly
  const effectiveData = useMemo(() => {
    if (isEditingDraft && species.draftData) {
      return {
        ...species,
        ...species.draftData,
        // Ensure we don't lose the ID and timestamps
        id: species.id,
        createdAt: species.createdAt,
        updatedAt: species.updatedAt
      }
    }
    return species
  }, [species, isEditingDraft])

  const [formData, setFormData] = useState<SpeciesData>(() => {
    const initialData = {
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
    }
    
    console.log('Initial form data mainImage:', initialData.mainImage)
    return initialData
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
    // Always check lock status via API to get the most current state
    if (species.id) {
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
      console.log('Checking lock status for species:', species.id)
      const data = await apiClient.species.checkLock(species.id)
      console.log('Lock status response:', data)

      if (data && data.lockedBy !== null) {
        if (String(data.lockedBy) === currentUserId) {
          // User already has the lock, restore edit mode
          console.log('User has lock, restoring edit mode')
          setIsEditMode(true)
          setHasLock(true)
          // If the species has draft data, ensure hasDraft is set
          if (species.draftData) {
            setHasDraft(true)
          }
        } else {
          // Someone else has the lock
          setIsLocked(true)
          setLockError(`Este contenido está siendo editado por otro usuario`)
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
    // Ensure text fields are never null
    const textFields = ['description', 'habitat', 'distribution', 'commonName', 'scientificName', 
                       'family', 'order', 'class', 'phylum', 'kingdom', 'specificCategory',
                       'seoTitle', 'seoDescription', 'seoKeywords', 'slug', 'distinctiveFeatures']
    
    let cleanedValue = value
    if (textFields.includes(field) && (value === null || value === undefined)) {
      cleanedValue = ''
    }
    
    setFormData((prev) => ({ ...prev, [field]: cleanedValue }))
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

    // Don't send empty strings for enum fields
    const enumFields = ['mainGroup', 'conservationStatus']
    if (enumFields.includes(field) && value === '') {
      return
    }

    setUpdating(field)

    try {
      let data
      
      // Prepare the value - convert empty strings to undefined for optional fields
      const preparedValue = (value === '' && !required) ? undefined : value
      
      // If it's published content, create/update draft
      if (species.status === 'published') {
        data = await apiClient.species.createDraft(species.id, { [field]: preparedValue })
      } else {
        // If it's already a draft, just update it
        data = await apiClient.species.update(species.id, { [field]: preparedValue })
      }
      
      setFieldSuccess(field)
      setTimeout(() => setFieldSuccess(null), 3000)

      // Update hasDraft based on server response
      if (species.status === 'published') {
        // The server should return hasDraft=true after creating a draft
        if (data.hasDraft !== undefined) {
          setHasDraft(data.hasDraft)
        }
        
        // For mainImage, we need to ensure the UI reflects the saved draft immediately
        // The form state already has the value from handleFieldChange
        // If this is the first draft change, update the badge
        if (!species.hasDraft && data.hasDraft) {
          // This is the first change creating a draft
          // The badge should now show "Publicado con cambios"
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
    console.log('Starting publish process for species:', species.id, {
      status: species.status,
      hasDraft: hasDraft
    });
    
    try {
      let updatedSpecies
      if (species.status === 'draft') {
        // First time publish - use publish endpoint
        console.log('First time publish - calling publish endpoint');
        updatedSpecies = await apiClient.species.publish(species.id)
      } else if (species.status === 'published' && hasDraft) {
        // Publish draft changes
        console.log('Publishing draft changes');
        updatedSpecies = await apiClient.species.publish(species.id)
      }

      console.log('Publish response:', updatedSpecies);

      // Clean and update form data
      const cleanedData = cleanSpeciesData(updatedSpecies)
      setFormData(cleanedData)
      setHasDraft(false)
      
      toast({
        title: "Contenido publicado",
        description: "Los cambios han sido publicados correctamente.",
      })
      
      // Invalidar el caché de la lista para reflejar el cambio de estado
      queryClient.invalidateQueries({ queryKey: ['species'] })
    } catch (error) {
      console.error('Error publishing species:', error)
      toast({
        title: "Error",
        description: "No se pudo publicar el contenido",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscardDraft = async () => {
    console.log('Discarding draft for species:', species.id)
    setShowDiscardDialog(false)
    setIsSaving(true)

    try {
      const updatedSpecies = await apiClient.species.discardDraft(species.id)
      console.log('Draft discarded successfully', updatedSpecies)
      
      // Clean the data to avoid null/empty values that cause validation errors
      const cleanedData = cleanSpeciesData(updatedSpecies)
      
      // Update the form with cleaned published data (no draft)
      setFormData(cleanedData)
      setHasDraft(false)
      
      // If we have gallery images, update them too
      if (updatedSpecies.galleryImages) {
        const transformedImages = updatedSpecies.galleryImages.map(
          (img: any, index: number) => ({
            id: img.galleryId || 0,
            url: img.url,
            filename: img.url.split('/').pop() || 'image.jpg',
            _key: img.id || `gallery-${Date.now()}-${index}`,
          }),
        )
        setGalleryImages(transformedImages)
      }
      
      // Show success message
      toast({
        title: "Cambios descartados",
        description: "Los cambios del borrador han sido descartados correctamente.",
      })
      
    } catch (error) {
      console.error('Error discarding draft:', error)
      toast({
        title: "Error",
        description: "No se pudieron descartar los cambios",
        variant: "destructive",
      })
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
            <Button type="button" variant="outline" size="sm" onClick={() => {
              console.log('Exit edit mode button clicked (alert), isEditMode:', isEditMode)
              setShowExitDialog(true)
            }}>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    console.log('Opening preview with data:', {
                      id: species.id,
                      hasDraft,
                      draftData: species.draftData,
                      formData: formData
                    })
                    setShowPreview(true)
                  }} 
                  type="button"
                >
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
                  onClick={() => {
                    console.log('Discard button clicked, hasDraft:', hasDraft, 'isEditMode:', isEditMode)
                    setShowDiscardDialog(true)
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Descartar cambios</span>
                </Button>
              )}

              {/* Botón de salir del modo edición */}
              {isEditMode && (
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  console.log('Exit edit mode button clicked (toolbar), isEditMode:', isEditMode)
                  setShowExitDialog(true)
                }}>
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
                console.log('Exiting edit mode...')
                try {
                  await releaseLock()
                  console.log('Lock released successfully')
                  setIsEditMode(false)
                  setShowExitDialog(false)
                  setHasLock(false)
                  
                  toast({
                    title: "Modo edición finalizado",
                    description: "Has salido del modo de edición correctamente.",
                  })
                } catch (error) {
                  console.error('Error releasing lock:', error)
                  toast({
                    title: "Error",
                    description: "No se pudo salir del modo de edición",
                    variant: "destructive",
                  })
                }
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
          previewUrl={`${import.meta.env.VITE_WEB_URL}/content/species/preview/${species.id}?t=${Date.now()}`}
          publicUrl={species.status === 'published' && !hasDraft ? `${import.meta.env.VITE_WEB_URL}/content/species/${species.slug}` : undefined}
          title={`Vista previa: ${species.commonName || species.scientificName}`}
        />
      )}
        </div>
      </div>
    </div>
  )
}
