import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import TiptapEditor from './TiptapEditor'
import { richContentToHtml, htmlToRichContent } from '@/lib/utils/tiptap-converter'
import MediaPickerModal from './MediaPickerModal'
import PreviewModal from './PreviewModal'
import SEOFieldsSection from './SEOFieldsSection'
import { Eye, Lock, X, Edit3, Trash2, Send, AlertTriangle, Check, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import LockBanner from './LockBanner'
import GallerySection from './GallerySection'
import type { RichContent, ContentBlock, ImageBlock } from '@wildtrip/shared/types'
import { PROTECTED_AREA_TYPES, CHILE_REGIONS } from '@wildtrip/shared'
import { apiClient } from '@/lib/api/client'

interface ProtectedAreaFormProps {
  initialData: {
    name: string
    slug: string
    type: string
    status: string
    area?: number | null
    creationYear?: number | null
    description?: string | null
    ecosystems?: string[] | null
    region?: string | null
    visitorInformation?: {
      schedule?: string
      contact?: string
      entranceFee?: string
      facilities?: string[]
    } | null
    richContent?: RichContent | null
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
    seoTitle?: string | null
    seoDescription?: string | null
    seoKeywords?: string | null
    // Draft and lock fields
    hasDraft: boolean
    draftData: Partial<{
      name: string
      slug: string
      type: string
      status: string
      area?: number | null
      creationYear?: number | null
      description?: string | null
      ecosystems?: string[] | null
      region?: string | null
      visitorInformation?: {
        schedule?: string
        contact?: string
        entranceFee?: string
        facilities?: string[]
      } | null
      richContent?: RichContent | null
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
      seoTitle?: string | null
      seoDescription?: string | null
      seoKeywords?: string | null
    }>
    draftCreatedAt?: string | null
    lockedBy?: string | null
    lockExpiresAt?: string | null
    currentUserId: string
    lockOwner?: {
      id: string
      name: string
    } | null
  }
  isEditing: boolean
  areaId: number
  currentUserId: string
}

// Helper function to clean protected area data and avoid null/empty values
const cleanProtectedAreaData = (data: any): any => {
  return {
    ...data,
    // Ensure strings are never null
    name: data.name || '',
    slug: data.slug || '',
    description: data.description || '',
    type: data.type || 'other',
    status: data.status || 'draft',
    region: data.region || '',
    // Ensure arrays are never null
    ecosystems: data.ecosystems || [],
    // Keep other fields as is but handle undefined
    area: data.area || null,
    creationYear: data.creationYear || null,
    visitorInformation: data.visitorInformation || null,
    richContent: data.richContent || null,
    mainImage: data.mainImage || null,
    galleryImages: data.galleryImages || [],
    seoTitle: data.seoTitle || '',
    seoDescription: data.seoDescription || '',
    seoKeywords: data.seoKeywords || '',
  }
}

export default function ProtectedAreaForm({ initialData, isEditing, areaId, currentUserId }: ProtectedAreaFormProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // Mezclar datos del draft si existe
  const effectiveData =
    initialData?.hasDraft && initialData?.draftData ? { ...initialData, ...initialData.draftData } : initialData

  // Estados principales
  const [isEditMode, setIsEditMode] = useState(false)
  const [hasLock, setHasLock] = useState(false)
  const [formData, setFormData] = useState(effectiveData)
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [fieldSuccess, setFieldSuccess] = useState<string | null>(null)
  const [hasLocalChanges, setHasLocalChanges] = useState(false)
  const [hasDraft, setHasDraft] = useState(initialData?.hasDraft || false)
  const [galleryImages, setGalleryImages] = useState<
    Array<{
      id: number | string
      url: string
      filename: string
      title?: string
      altText?: string
      width?: number
      height?: number
      order?: number
      _key?: string
    }>
  >([])
  const [loadingGallery, setLoadingGallery] = useState(false)

  // Estados de diálogos
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [lockError, setLockError] = useState<string | null>(null)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Referencias
  const [editorContent, setEditorContent] = useState(() => {
    const data = effectiveData || formData
    return data?.richContent?.blocks ? richContentToHtml(data.richContent) : ''
  })

  // Check lock status
  const [lockInfo, setLockInfo] = useState({
    isLocked: false,
    lockedByUser: initialData?.lockOwner || null,
  })

  const checkLockStatus = async () => {
    if (!areaId) return
    
    try {
      console.log('Checking lock status for protected area:', areaId)
      const data = await apiClient.protectedAreas.checkLock(areaId)
      console.log('Lock status response:', data)
      console.log('Current user ID:', currentUserId, 'Type:', typeof currentUserId)
      console.log('Locked by:', data?.lockedBy, 'Type:', typeof data?.lockedBy)
      
      if (data && data.lockedBy !== null) {
        // Ensure both values are numbers for comparison
        const lockedByUserId = Number(data.lockedBy)
        const currentUserIdNum = Number(currentUserId)
        
        console.log('Comparing:', lockedByUserId, 'vs', currentUserIdNum)
        
        if (lockedByUserId === currentUserIdNum) {
          // User already has the lock, restore edit mode
          console.log('User has lock, restoring edit mode')
          setIsEditMode(true)
          setHasLock(true)
          setLockInfo({
            isLocked: false,
            lockedByUser: null,
          })
          setLockError(null)
          // If the area has draft data, ensure hasDraft is set
          if (initialData?.draftData) {
            setHasDraft(true)
          }
        } else {
          // Someone else has the lock
          setLockInfo({
            isLocked: true,
            lockedByUser: { name: 'otro usuario' },
          })
          setLockError(`Este contenido está siendo editado por otro usuario`)
        }
      }
    } catch (error) {
      console.error('Error checking lock status:', error)
    }
  }

  useEffect(() => {
    checkLockStatus()

    // Load gallery images if editing
    if (isEditing && areaId) {
      fetchGalleryImages()
    }
  }, [])

  // Release lock when component unmounts or when hasLock changes
  useEffect(() => {
    return () => {
      if (hasLock && areaId) {
        releaseLock()
      }
    }
  }, [hasLock, areaId])

  // Release lock on unmount if in edit mode
  useEffect(() => {
    return () => {
      if (isEditMode && areaId) {
        releaseLock()
      }
    }
  }, [isEditMode, areaId])

  const handleEnterEditMode = async () => {
    if (!areaId) return

    try {
      await apiClient.protectedAreas.lock(areaId)
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

  const handleExitEditMode = async () => {
    try {
      await releaseLock()
      setIsEditMode(false)
      setShowExitConfirm(false)
      
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
  }

  const releaseLock = async () => {
    if (!areaId) return

    try {
      await apiClient.protectedAreas.unlock(areaId)
      setHasLock(false)
    } catch (error) {
      console.error('Error releasing lock:', error)
    }
  }

  const fetchGalleryImages = async () => {
    setLoadingGallery(true)
    try {
      // Get gallery images from effectiveData (which includes draft data if available)
      const galleryImagesData = effectiveData?.galleryImages || []

      // Transform the gallery images to the format expected by GallerySection
      const transformedImages = galleryImagesData.map(
        (img: { id: string; url: string; galleryId: number }, index: number) => ({
          id: img.galleryId || `temp-${index}`,
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

  const handleGalleryUpdate = (
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
    setGalleryImages(images)
    setHasLocalChanges(true)

    // Transform to the new JSON structure
    const galleryImagesData = images.map((img, index) => ({
      id: img._key || `gallery-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 11)}`,
      url: img.url,
      galleryId: typeof img.id === 'number' ? img.id : parseInt(img.id as string) || 0,
    }))

    handleFieldBlur('galleryImages', galleryImagesData)
  }

  // Guardado automático por campo
  const handleFieldBlur = async (field: string, value: unknown, required = false) => {
    if (!isEditing || !areaId || !isEditMode) {
      return
    }

    // No guardar si el campo requerido está vacío
    if (required && !value) {
      return
    }

    setUpdating(field)

    try {
      let data
      
      // If it's published content, create/update draft
      if (formData.status === 'published') {
        data = await apiClient.protectedAreas.createDraft(areaId, { [field]: value })
      } else {
        // If it's already a draft, just update it
        data = await apiClient.protectedAreas.update(areaId, { [field]: value })
      }

      setFieldSuccess(field)
      setTimeout(() => setFieldSuccess(null), 3000)

      // Update hasDraft based on server response
      if (formData.status === 'published') {
        console.log('Protected area draft response:', { 
          field, 
          hasDraft: data.hasDraft,
          fullResponse: data 
        })
        if (data.hasDraft !== undefined) {
          setHasDraft(data.hasDraft)
        }
        // Always reset local changes after saving
        setHasLocalChanges(false)
        // The form state already has the updated value from local changes
        // We don't need to update it again from the server response
      }
    } catch (error) {
      console.error(`Error saving ${field}:`, error)
    } finally {
      setUpdating(null)
    }
  }

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasLocalChanges(true)
  }

  const handlePublish = () => {
    // Verificar si realmente hay cambios para publicar
    if (formData.status === 'published' && !hasDraft && hasLocalChanges) {
      alert(
        'Los cambios aún no se han guardado en la base de datos. Por favor, haz clic fuera de los campos editados para guardar automáticamente los cambios, luego podrás publicarlos.',
      )
      return
    }

    setShowPublishDialog(true)
  }

  const confirmPublish = async () => {
    setSaving(true)
    setShowPublishDialog(false)

    try {
      let updatedArea
      if (formData.status === 'draft') {
        // First time publish
        updatedArea = await apiClient.protectedAreas.update(areaId, { 
          status: 'published',
          publishedAt: new Date().toISOString()
        })
      } else if (formData.status === 'published' && hasDraft) {
        // Publish draft changes
        updatedArea = await apiClient.protectedAreas.publish(areaId)
      }

      if (updatedArea) {
        // Clean and update form data
        const cleanedData = cleanProtectedAreaData(updatedArea)
        setFormData(cleanedData)
        setHasDraft(false)
        setHasLocalChanges(false)
        
        toast({
          title: "Contenido publicado",
          description: "Los cambios han sido publicados correctamente.",
        })
        
        // Invalidar el caché de la lista para reflejar el cambio de estado
        queryClient.invalidateQueries({ queryKey: ['protected-areas'] })
      }
    } catch (error) {
      console.error('Error publishing:', error)
      toast({
        title: "Error",
        description: "No se pudo publicar el contenido",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDiscardDraft = async () => {
    setShowDiscardDialog(false)
    setSaving(true)

    try {
      const updatedProtectedArea = await apiClient.protectedAreas.discardDraft(areaId)
      console.log('Draft discarded successfully', updatedProtectedArea)
      
      // Clean the data to avoid null/empty values that cause validation errors
      const cleanedData = cleanProtectedAreaData(updatedProtectedArea)
      
      // Update the form with cleaned published data (no draft)
      setFormData(cleanedData)
      setHasDraft(false)
      setHasLocalChanges(false)
      
      // Update editor content with published version
      const publishedContent = updatedProtectedArea?.richContent?.blocks ? richContentToHtml(updatedProtectedArea.richContent) : ''
      setEditorContent(publishedContent)
      
      // Update gallery images if they exist
      if (updatedProtectedArea.galleryImages) {
        const transformedImages = updatedProtectedArea.galleryImages.map(
          (img: any, index: number) => ({
            id: img.galleryId || `temp-${index}`,
            url: img.url,
            filename: img.url.split('/').pop() || 'image.jpg',
            _key: img.id || `gallery-${Date.now()}-${index}`,
          }),
        )
        setGalleryImages(transformedImages)
      }
      
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
      setSaving(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission is handled through individual field saves
  }

  const isFieldDisabled = lockInfo.isLocked || !isEditMode
  const isEditingDraft = initialData?.status === 'published' && hasDraft

  return (
    <div>
      {lockInfo.isLocked && lockInfo.lockedByUser && (
        <LockBanner
          lockedBy={lockInfo.lockedByUser.name}
          onClose={() => navigate('/protected-areas')}
        />
      )}

      {isEditing && !isEditMode && !lockInfo.isLocked && (
        <Card className="mb-6">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">El contenido está en modo de solo lectura</span>
            </div>
            <Button type="button" size="sm" onClick={() => setShowEditConfirm(true)}>
              <Edit3 className="mr-2 h-4 w-4" />
              Editar contenido
            </Button>
          </CardContent>
        </Card>
      )}

      {isEditMode && (
        <Alert className="mb-6">
          <Edit3 className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Estás en modo de edición. Los cambios se guardarán automáticamente.</span>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowExitConfirm(true)}>
              Salir del modo edición
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Toolbar superior */}
        <div className="sticky top-0 z-10 -mx-4 mb-6 border-b bg-background px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <h1 className="text-lg font-semibold sm:text-xl">{isEditing ? 'Editar Área Protegida' : 'Nueva Área Protegida'}</h1>
              <div className="flex items-center gap-2">
                {formData.status === 'draft' && <Badge variant="secondary">Borrador</Badge>}
                {formData.status === 'published' && !hasDraft && <Badge variant="default">Publicado</Badge>}
                {formData.status === 'published' && hasDraft && (
                  <Badge variant="outline" className="border-amber-500 text-amber-700">
                    Publicado con cambios
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Vista previa - siempre visible cuando hay ID */}
              {isEditing && areaId && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    console.log('Opening preview for protected area:', {
                      id: areaId,
                      hasDraft,
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
              {formData.status === 'published' && hasDraft && isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('Discard button clicked:', { 
                      status: formData.status, 
                      hasDraft, 
                      isEditMode,
                      initialHasDraft: initialData?.hasDraft 
                    })
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
                <Button type="button" variant="outline" size="sm" onClick={() => setShowExitConfirm(true)}>
                  <X className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Salir de edición</span>
                </Button>
              )}

              {/* Botón de publicar/publicar cambios */}
              {(!isEditing || formData.status === 'draft' || (formData.status === 'published' && hasDraft)) &&
                isEditMode && (
                  <Button type="button" size="sm" onClick={handlePublish} disabled={saving || isFieldDisabled}>
                    <Send className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {formData.status === 'published' && hasDraft ? 'Publicar cambios' : 'Publicar'}
                    </span>
                  </Button>
                )}
            </div>
          </div>
        </div>

        {isEditingDraft && (
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
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Información básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      Nombre *{updating === 'name' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'name' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value
                        setFormData((prev) => ({
                          ...prev,
                          name,
                          slug: generateSlug(name),
                        }))
                      }}
                      onBlur={() => handleFieldBlur('name', formData.name, true)}
                      required
                      disabled={isFieldDisabled}
                      placeholder="Nombre del área protegida"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL amigable</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                      required
                      disabled={isFieldDisabled}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="flex items-center gap-2">
                      Tipo *{updating === 'type' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'type' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => {
                        handleInputChange('type', value)
                        handleFieldBlur('type', value, true)
                      }}
                      disabled={isFieldDisabled}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROTECTED_AREA_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2">
                      Descripción breve
                      {updating === 'description' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'description' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      onBlur={() => handleFieldBlur('description', formData.description)}
                      placeholder="Una descripción concisa del área protegida..."
                      rows={3}
                      disabled={isFieldDisabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: string) => setFormData((prev) => ({ ...prev, status: value }))}
                      disabled={isFieldDisabled}
                    >
                      <SelectTrigger id="status">
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
            {/* Imagen destacada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Imagen de portada
                  {updating === 'mainImage' && <Loader2 className="h-3 w-3 animate-spin" />}
                  {fieldSuccess === 'mainImage' && <Check className="h-3 w-3 text-green-600" />}
                </CardTitle>
                <CardDescription>
                  Selecciona una imagen de la galería para la portada del área protegida
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formData.mainImage?.url ? (
                  <div className="relative">
                    <img
                      src={formData.mainImage.url}
                      alt="Imagen destacada"
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
                          handleInputChange('mainImage', null)
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
            {isEditing && areaId && (
              <GallerySection
                entityId={areaId}
                entityType="protected_area"
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
                type: 'protected-area',
                data: {
                  name: formData.name,
                  type: formData.type,
                  description: formData.description || '',
                  region: formData.region,
                  keyFeatures: formData.ecosystems || [],
                },
              }}
              disabled={isFieldDisabled}
            />

            {/* Contenido detallado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Contenido detallado *{updating === 'richContent' && <Loader2 className="h-3 w-3 animate-spin" />}
                  {fieldSuccess === 'richContent' && <Check className="h-3 w-3 text-green-600" />}
                </CardTitle>
                <CardDescription>Describe el área protegida con información detallada</CardDescription>
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

                      if (hasContent || !initialData?.richContent?.blocks?.length) {
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

                      // Mark as having local changes
                      if (isEditMode) {
                        setHasLocalChanges(true)
                      }
                    }}
                    placeholder="Escribe el contenido del área protegida..."
                    height="500px"
                    readOnly={isFieldDisabled}
                    showToolbar={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Detalles adicionales */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles adicionales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area" className="flex items-center gap-2">
                      Superficie (hectáreas)
                      {updating === 'area' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'area' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Input
                      id="area"
                      type="number"
                      value={formData.area || ''}
                      onChange={(e) => handleInputChange('area', parseInt(e.target.value) || null)}
                      onBlur={() => handleFieldBlur('area', formData.area)}
                      placeholder="Ej: 181414"
                      disabled={isFieldDisabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creationYear" className="flex items-center gap-2">
                      Año de creación
                      {updating === 'creationYear' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'creationYear' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Input
                      id="creationYear"
                      type="number"
                      value={formData.creationYear || ''}
                      onChange={(e) => handleInputChange('creationYear', parseInt(e.target.value) || null)}
                      onBlur={() => handleFieldBlur('creationYear', formData.creationYear)}
                      placeholder="Ej: 1959"
                      disabled={isFieldDisabled}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ecosystems" className="flex items-center gap-2">
                    Ecosistemas
                    {updating === 'ecosystems' && <Loader2 className="h-3 w-3 animate-spin" />}
                    {fieldSuccess === 'ecosystems' && <Check className="h-3 w-3 text-green-600" />}
                  </Label>
                  <Textarea
                    id="ecosystems"
                    value={formData.ecosystems?.join(', ') || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'ecosystems',
                        e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                    onBlur={() => handleFieldBlur('ecosystems', formData.ecosystems)}
                    placeholder="Bosque templado, Estepa patagónica, Glaciares (separados por comas)"
                    rows={2}
                    disabled={isFieldDisabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Región
                    {updating === 'region' && <Loader2 className="h-3 w-3 animate-spin" />}
                    {fieldSuccess === 'region' && <Check className="h-3 w-3 text-green-600" />}
                  </Label>
                  <Select
                    value={formData.region || undefined}
                    onValueChange={(value) => {
                      handleInputChange('region', value)
                      handleFieldBlur('region', value)
                    }}
                    disabled={isFieldDisabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar región" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHILE_REGIONS.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.romanNumeral} - {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Información para visitantes */}
            <Card>
              <CardHeader>
                <CardTitle>Información para visitantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule" className="flex items-center gap-2">
                    Horario
                    {updating === 'visitorInformation.schedule' && <Loader2 className="h-3 w-3 animate-spin" />}
                    {fieldSuccess === 'visitorInformation.schedule' && <Check className="h-3 w-3 text-green-600" />}
                  </Label>
                  <Input
                    id="schedule"
                    value={formData.visitorInformation?.schedule || ''}
                    onChange={(e) =>
                      handleInputChange('visitorInformation', {
                        ...formData.visitorInformation,
                        schedule: e.target.value,
                      })
                    }
                    onBlur={() => handleFieldBlur('visitorInformation', formData.visitorInformation)}
                    placeholder="Ej: Abierto todo el año, 8:00 - 18:00"
                    disabled={isFieldDisabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact" className="flex items-center gap-2">
                    Contacto
                    {updating === 'visitorInformation.contact' && <Loader2 className="h-3 w-3 animate-spin" />}
                    {fieldSuccess === 'visitorInformation.contact' && <Check className="h-3 w-3 text-green-600" />}
                  </Label>
                  <Input
                    id="contact"
                    value={formData.visitorInformation?.contact || ''}
                    onChange={(e) =>
                      handleInputChange('visitorInformation', {
                        ...formData.visitorInformation,
                        contact: e.target.value,
                      })
                    }
                    onBlur={() => handleFieldBlur('visitorInformation', formData.visitorInformation)}
                    placeholder="Teléfono, email o dirección"
                    disabled={isFieldDisabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entranceFee" className="flex items-center gap-2">
                    Tarifas
                    {updating === 'visitorInformation.entranceFee' && <Loader2 className="h-3 w-3 animate-spin" />}
                    {fieldSuccess === 'visitorInformation.entranceFee' && <Check className="h-3 w-3 text-green-600" />}
                  </Label>
                  <Input
                    id="entranceFee"
                    value={formData.visitorInformation?.entranceFee || ''}
                    onChange={(e) =>
                      handleInputChange('visitorInformation', {
                        ...formData.visitorInformation,
                        entranceFee: e.target.value,
                      })
                    }
                    onBlur={() => handleFieldBlur('visitorInformation', formData.visitorInformation)}
                    placeholder="Ej: Adultos $5.000, Niños $2.500"
                    disabled={isFieldDisabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facilities" className="flex items-center gap-2">
                    Instalaciones
                    {updating === 'visitorInformation.facilities' && <Loader2 className="h-3 w-3 animate-spin" />}
                    {fieldSuccess === 'visitorInformation.facilities' && <Check className="h-3 w-3 text-green-600" />}
                  </Label>
                  <Textarea
                    id="facilities"
                    value={formData.visitorInformation?.facilities?.join(', ') || ''}
                    onChange={(e) =>
                      handleInputChange('visitorInformation', {
                        ...formData.visitorInformation,
                        facilities: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    onBlur={() => handleFieldBlur('visitorInformation', formData.visitorInformation)}
                    placeholder="Centro de visitantes, Senderos, Camping, Baños (separados por comas)"
                    rows={2}
                    disabled={isFieldDisabled}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Diálogo de confirmación para entrar en modo edición */}
      <Dialog open={showEditConfirm} onOpenChange={setShowEditConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Editar contenido?</DialogTitle>
            <DialogDescription>
              {lockError ? (
                <span className="text-destructive">{lockError}</span>
              ) : (
                'Entrarás en modo de edición. Los cambios se guardarán automáticamente mientras editas.'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditConfirm(false)}>
              Cancelar
            </Button>
            {!lockError && <Button onClick={handleEnterEditMode}>Editar contenido</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para salir del modo edición */}
      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Salir del modo edición?</DialogTitle>
            <DialogDescription>
              Los cambios se han guardado automáticamente. Puedes continuar editando más tarde.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExitConfirm(false)}>
              Continuar editando
            </Button>
            <Button onClick={handleExitEditMode}>Salir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de publicación */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData.status === 'published' && hasDraft ? '¿Publicar cambios?' : '¿Publicar área protegida?'}
            </DialogTitle>
            <DialogDescription>
              {formData.status === 'published' && hasDraft
                ? 'Se publicarán todos los cambios del borrador. Los visitantes verán la versión actualizada.'
                : 'El área protegida será visible públicamente en el sitio web.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmPublish} disabled={saving}>
              {saving ? 'Publicando...' : 'Publicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de descartar cambios */}
      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Descartar cambios?</DialogTitle>
            <DialogDescription>
              Se perderán todos los cambios del borrador y se restaurará la versión publicada. Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiscardDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await handleDiscardDraft()
                setShowDiscardDialog(false)
              }}
            >
              Descartar cambios
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
              id: `main-${Date.now()}`,
              url: selectedImage.url,
              galleryId: selectedImage.id,
            }
            handleInputChange('mainImage', mainImageData)
            handleFieldBlur('mainImage', mainImageData)
            setShowMediaPicker(false)
          }
        }}
        multiSelect={false}
      />

      {/* Preview Modal */}
      {showPreview && areaId && (
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          previewUrl={`${import.meta.env.VITE_WEB_URL}/content/protected-areas/preview/${areaId}?t=${Date.now()}`}
          publicUrl={
            formData.status === 'published' && !hasDraft ? `${import.meta.env.VITE_WEB_URL}/content/protected-areas/${formData.slug}` : undefined
          }
          title={`Vista previa: ${formData.name}`}
        />
      )}
    </div>
  )
}
