import TiptapEditor from './TiptapEditor'
import { richContentToHtml, htmlToRichContent } from '@/lib/utils/tiptap-converter'
import MediaPickerModal from './MediaPickerModal'
import PreviewModal from './PreviewModal'
import SEOFieldsSection from './SEOFieldsSection'
import {
  AlertCircle,
  X,
  Image as ImageIcon,
  Check,
  Loader2,
  Eye,
  Trash2,
  Send,
  AlertTriangle,
  Edit3,
  Lock,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import type { ContentBlock, ImageBlock } from '@wildtrip/shared/types'
import LockBanner from './LockBanner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { NEWS_CATEGORIES } from '@wildtrip/shared/constants'
import { apiClient } from '@/lib/api/client'

interface NewsFormData {
  title: string
  slug: string
  category: string
  author: string
  summary: string
  content: { blocks: ContentBlock[]; version?: string }
  status: 'draft' | 'published' | 'archived'
  mainImage?: {
    id: string
    url: string
    galleryId: number
  } | null
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
}

interface NewsFormProps {
  initialData?: NewsFormData & {
    hasDraft?: boolean
    draftData?: Partial<NewsFormData>
    draftCreatedAt?: string
    draftMainImage?: {
      id: string
      url: string
      galleryId: number
    } | null
    lockedBy?: number
    lockExpiresAt?: string
    currentUserId?: number
    lockOwner?: {
      id: number
      name: string
    }
  }
  isEditing?: boolean
  newsId?: number
  currentUserId?: number
}

export default function NewsForm({ initialData, isEditing = false, newsId, currentUserId }: NewsFormProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [lockError, setLockError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [fieldSuccess, setFieldSuccess] = useState<string | null>(null)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [hasLocalChanges, setHasLocalChanges] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [hasDraft, setHasDraft] = useState(initialData?.hasDraft || false)
  const [showPreview, setShowPreview] = useState(false)

  // Determine if we're editing a draft of published content
  const isEditingDraft = initialData?.status === 'published' && hasDraft
  const effectiveData =
    isEditingDraft && initialData?.draftData ? { ...initialData, ...initialData.draftData } : initialData

  const [formData, setFormData] = useState<NewsFormData>(
    effectiveData || {
      title: '',
      slug: '',
      category: 'education',
      author: '',
      summary: '',
      content: { blocks: [], version: '1.0' },
      status: 'draft',
      mainImage: null,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    },
  )

  const [editorContent, setEditorContent] = useState(() => {
    const data = effectiveData || formData
    return data?.content?.blocks ? richContentToHtml(data.content) : ''
  })

  // Check lock status
  const [lockInfo, setLockInfo] = useState({
    isLocked: false,
    lockedByUser: initialData?.lockOwner || null,
  })

  const checkLockStatus = () => {
    const locked = !!(initialData?.lockedBy && initialData.lockedBy !== currentUserId)
    setLockInfo({
      isLocked: locked,
      lockedByUser: initialData?.lockOwner || null,
    })
    // If user already has the lock, enable edit mode
    if (initialData?.lockedBy === currentUserId) {
      setIsEditMode(true)
    }
  }

  useEffect(() => {
    checkLockStatus()
  }, [])

  // Release lock on unmount if in edit mode
  useEffect(() => {
    return () => {
      if (isEditMode && newsId) {
        releaseLock()
      }
    }
  }, [isEditMode, newsId])

  const handleEnterEditMode = async () => {
    if (!newsId) return

    try {
      await apiClient.news.lock(newsId)

      if (response.ok) {
        setIsEditMode(true)
        setShowEditConfirm(false)
        setLockError(null)
      } else if (response.status === 423) {
        const data = await response.json()
        setLockError(`Este contenido está siendo editado por ${data.lockedBy?.name || 'otro usuario'}`)
      }
    } catch (error) {
      console.error('Error acquiring lock:', error)
      setLockError('Error al intentar editar el contenido')
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
    if (!newsId) return

    try {
      await apiClient.news.unlock(newsId)
    } catch (error) {
      console.error('Error releasing lock:', error)
    }
  }

  // Guardado automático por campo
  const handleFieldBlur = async (field: string, value: unknown, required = false) => {
    // For new articles, we don't auto-save, just update local state
    if (!isEditing) {
      return
    }
    
    if (!newsId || !isEditMode) {
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
        data = await apiClient.news.createDraft(newsId, { [field]: value })
      } else {
        // If it's already a draft, just update it
        data = await apiClient.news.update(newsId, { [field]: value })
      }

      setFieldSuccess(field)
      setTimeout(() => setFieldSuccess(null), 3000)

      // Update hasDraft based on server response
      if (formData.status === 'published') {
        if (data.hasDraft !== undefined) {
          setHasDraft(data.hasDraft)
          setHasLocalChanges(false)
        }
        // The form state already has the updated value from local changes
        // We don't need to update it again from the server response
      }
    } catch (error) {
      console.error(`Error saving ${field}:`, error)
    } finally {
      setUpdating(null)
    }
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
      if (!isEditing) {
        // Create and publish new article
        await apiClient.news.create({ ...formData, status: 'published' })
        navigate('/news')
      } else if (formData.status === 'draft') {
        // First time publish
        await apiClient.news.update(newsId, { 
          status: 'published', 
          publishedAt: new Date().toISOString() 
        })
        navigate('/news')
      } else if (formData.status === 'published' && hasDraft) {
        // Publish draft changes
        await apiClient.news.publish(newsId)
        navigate('/news')
      }

      // Release lock after publishing
      if (isEditMode) {
        await releaseLock()
      }
    } catch (error) {
      console.error('Error publishing:', error)
      alert('Error al publicar')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscardDraft = async () => {
    setShowDiscardDialog(false)
    setSaving(true)

    try {
      const updatedNews = await apiClient.news.discardDraft(newsId)
      
      // Update the form with published data (no draft)
      setFormData({
        ...updatedNews,
        mainImage: updatedNews.mainImage,
      })
      setHasDraft(false)
      setHasLocalChanges(false)
      
      // Update editor content with published version
      const publishedContent = updatedNews?.content?.blocks ? richContentToHtml(updatedNews.content) : ''
      setEditorContent(publishedContent)
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission is now handled by auto-save
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      const result = await apiClient.news.create({ ...formData, status: 'draft' })
      // Redirect to edit the newly created article
      navigate(`/news/${result.id}/edit`)
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('Error al guardar el borrador')
    } finally {
      setSaving(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const isFieldDisabled = isEditing ? (lockInfo.isLocked || !isEditMode) : false

  return (
    <div>
      {lockInfo.isLocked && lockInfo.lockedByUser && (
        <LockBanner
          lockedBy={lockInfo.lockedByUser.name || 'Otro usuario'}
          onClose={() => navigate('/news')}
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
              <h1 className="text-lg font-semibold sm:text-xl">{isEditing ? 'Editar Noticia' : 'Nueva Noticia'}</h1>
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
              {isEditing && newsId && (
                <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} type="button">
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
                  onClick={() => setShowDiscardDialog(true)}
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

              {/* Botón de guardar borrador para artículos nuevos */}
              {!isEditing && (
                <Button type="button" size="sm" variant="outline" onClick={handleSaveDraft} disabled={saving}>
                  <Check className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Guardar borrador</span>
                </Button>
              )}

              {/* Botón de publicar/publicar cambios */}
              {(!isEditing || formData.status === 'draft' || (formData.status === 'published' && hasDraft)) &&
                (!isEditing || isEditMode) && (
                  <Button type="button" size="sm" onClick={handlePublish} disabled={saving}>
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

        {/* Alerta para cambios locales sin borrador */}
        {formData.status === 'published' && !hasDraft && hasLocalChanges && isEditMode && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Tienes cambios sin guardar. Los cambios se guardan automáticamente como borrador cuando sales de un campo.
              Para publicar estos cambios, primero deben guardarse en la base de datos.
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
                    <Label htmlFor="title" className="flex items-center gap-2">
                      Título *{updating === 'title' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'title' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => {
                        const title = e.target.value
                        setFormData((prev) => ({
                          ...prev,
                          title,
                          slug: generateSlug(title),
                        }))
                      }}
                      onBlur={() => handleFieldBlur('title', formData.title, true)}
                      required
                      disabled={isFieldDisabled}
                      placeholder="Título de la noticia"
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
                    <Label htmlFor="category" className="flex items-center gap-2">
                      Categoría *{updating === 'category' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'category' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => {
                        setFormData((prev) => ({ ...prev, category: value }))
                        handleFieldBlur('category', value, true)
                      }}
                      disabled={isFieldDisabled}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {NEWS_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author" className="flex items-center gap-2">
                      Autor
                      {updating === 'author' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {fieldSuccess === 'author' && <Check className="h-3 w-3 text-green-600" />}
                    </Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                      onBlur={() => handleFieldBlur('author', formData.author)}
                      disabled={isFieldDisabled}
                      placeholder="Nombre del autor"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: string) =>
                        setFormData((prev) => ({ ...prev, status: value as 'draft' | 'published' | 'archived' }))
                      }
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

          {/* Columna derecha - Contenido */}
          <div className="space-y-6 lg:col-span-8">
            {/* Imagen destacada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Imagen de portada
                  {updating === 'mainImage' && <Loader2 className="h-3 w-3 animate-spin" />}
                  {fieldSuccess === 'mainImage' && <Check className="h-3 w-3 text-green-600" />}
                </CardTitle>
                <CardDescription>Arrastra o selecciona una imagen para la portada de la noticia</CardDescription>
              </CardHeader>
              <CardContent>
                {formData.mainImage ? (
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
                          setFormData((prev) => ({ ...prev, mainImage: null }))
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
                    Seleccionar imagen de portada
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Resumen */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Resumen *{updating === 'summary' && <Loader2 className="h-3 w-3 animate-spin" />}
                  {fieldSuccess === 'summary' && <Check className="h-3 w-3 text-green-600" />}
                </CardTitle>
                <CardDescription>Breve descripción que aparecerá en las listas y vista previa</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                  onBlur={() => handleFieldBlur('summary', formData.summary, true)}
                  rows={4}
                  disabled={isFieldDisabled}
                  placeholder="Escribe un resumen atractivo de la noticia..."
                  className="resize-none"
                />
              </CardContent>
            </Card>

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
                type: 'news',
                data: {
                  title: formData.title,
                  summary: formData.summary,
                  content: editorContent,
                },
              }}
              disabled={isFieldDisabled}
            />

            {/* Contenido */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Contenido del artículo *{updating === 'content' && <Loader2 className="h-3 w-3 animate-spin" />}
                  {fieldSuccess === 'content' && <Check className="h-3 w-3 text-green-600" />}
                </CardTitle>
                <CardDescription>Utiliza el editor para escribir el contenido completo de la noticia</CardDescription>
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

                      if (hasContent || !initialData?.content?.blocks?.length) {
                        handleFieldBlur('content', richContent, true)
                      }
                    }
                  }}
                >
                  <TiptapEditor
                    content={editorContent}
                    onChange={(value) => {
                      setEditorContent(value)

                      // Convert HTML to content blocks
                      const richContent = htmlToRichContent(value)

                      // Update form data
                      setFormData((prev) => ({
                        ...prev,
                        content: richContent,
                      }))

                      // Mark as having local changes
                      if (isEditMode) {
                        setHasLocalChanges(true)
                      }
                    }}
                    placeholder="Escribe el contenido de la noticia..."
                    height="500px"
                    readOnly={isFieldDisabled}
                    showToolbar={true}
                    enableImages={true}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog de publicación */}
        <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {formData.status === 'published' && hasDraft ? '¿Publicar cambios?' : '¿Publicar noticia?'}
              </DialogTitle>
              <DialogDescription>
                {formData.status === 'published' && hasDraft
                  ? 'Los cambios del borrador se aplicarán a la versión publicada.'
                  : 'La noticia será visible públicamente una vez publicada.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmPublish}>
                <Send className="mr-2 h-4 w-4" />
                Publicar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de descartar borrador */}
        <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Descartar cambios?</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. Se perderán todos los cambios no publicados y se restaurará la versión
                publicada actual.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDiscardDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDiscardDraft}>
                Descartar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit mode confirmation dialog */}
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

        {/* Exit edit mode confirmation dialog */}
        <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Salir del modo edición?</DialogTitle>
              <DialogDescription>
                Los cambios se han guardado automáticamente. Al salir del modo edición, se liberará el bloqueo para que
                otros usuarios puedan editar esta noticia.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExitConfirm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleExitEditMode}>Salir del modo edición</Button>
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
              const imageData = {
                id: crypto.randomUUID(),
                url: selectedImage.url,
                galleryId: selectedImage.id,
              }
              setFormData((prev) => ({ ...prev, mainImage: imageData }))
              handleFieldBlur('mainImage', imageData)
              setShowMediaPicker(false)
            }
          }}
          multiSelect={false}
        />

        {showPreview && newsId && (
          <PreviewModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            previewUrl={`${import.meta.env.VITE_WEB_URL}/content/news/preview/${newsId}`}
            publicUrl={formData.status === 'published' && !hasDraft ? `${import.meta.env.VITE_WEB_URL}/content/news/${formData.slug}` : undefined}
            title="Vista previa de noticia"
          />
        )}
      </form>
    </div>
  )
}
