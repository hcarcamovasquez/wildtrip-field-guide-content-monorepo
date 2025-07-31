import { useState, useEffect } from 'react'
import { getOptimizedImageUrl } from '@/lib/utils/cloudflare-images'
import { apiClient } from '@/lib/api/client'
import {
  X,
  Download,
  Copy,
  Edit3,
  Trash2,
  Image,
  Video,
  Calendar,
  FileText,
  Tag,
  User,
  Link,
  Check,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { MediaWithFolder } from '@/types'

interface GalleryItem {
  id: number
  type: 'folder' | 'image' | 'video'
  name?: string // for folders
  filename?: string // for media
  url?: string // for media
  title?: string | null
  description?: string | null
  fileCount?: number // for folders
  folderCount?: number // for folders
  size?: number // for media
  mimeType?: string // for media
  width?: number | null // for media
  height?: number | null // for media
  createdAt: Date | string
  updatedAt: Date | string
  altText?: string | null
  tags?: string[] | null
  uploadedByName?: string | null
  folder?: any | null
  [key: string]: any
}

interface FileDetailsProps {
  file: MediaWithFolder | GalleryItem | null
  onClose: () => void
  onUpdate: (file: MediaWithFolder | GalleryItem) => void
}

// ImageVariantItem function removed - not currently in use
// Can be re-added when variant functionality is implemented

export default function FileDetails({ file, onClose, onUpdate }: FileDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // Get optimized image for preview
  const previewImageUrl = file && file.type === 'image' && file.url ? getOptimizedImageUrl(file.url, 'small') : file?.url
  const [formData, setFormData] = useState({
    title: file?.title || '',
    description: file?.description || '',
    altText: file?.altText || '',
    tags: file?.tags || [],
  })
  const [newTag, setNewTag] = useState('')
  
  // Update form data when file changes
  useEffect(() => {
    setFormData({
      title: file?.title || '',
      description: file?.description || '',
      altText: file?.altText || '',
      tags: file?.tags || [],
    })
  }, [file])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleSave = async () => {
    if (!file || file.type === 'folder') return
    
    setSaving(true)
    try {
      const updated = await apiClient.gallery.updateMedia(file.id, formData)
      onUpdate(updated)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving file details:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCopyUrl = async () => {
    if (!file || !file.url) return
    
    await navigator.clipboard.writeText(file.url)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleDelete = async () => {
    if (!file || file.type === 'folder') return
    
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) return

    try {
      await apiClient.gallery.deleteMedia(file.id)
      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  // Desktop: Sidebar within layout, Mobile: Sheet drawer
  if (isDesktop) {
    return (
      <div className="w-96 border-l bg-background flex-shrink-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex-shrink-0 border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Detalles del archivo</h2>
              {file && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {!file ? (
            // Empty state
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Selecciona un archivo para ver sus detalles</p>
              </div>
            </div>
          ) : (

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Preview */}
            <div className="space-y-4">
              {file.type === 'image' ? (
                <div className="w-full overflow-hidden rounded-lg bg-muted">
                  <img
                    src={previewImageUrl}
                    alt={file.altText || file.filename}
                    className="h-auto w-full rounded-lg object-cover"
                    style={{ maxHeight: '200px' }}
                    loading="eager"
                  />
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-lg bg-muted">
                  <Video className="h-16 w-16 text-muted-foreground" />
                </div>
              )}

              {/* Quick actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyUrl} className="flex-1">
                  {copySuccess ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar URL
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <a href={file.url} download={file.filename}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </a>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Tabs */}
            <Tabs defaultValue="info">
              <TabsList className="grid w-full">
                <TabsTrigger value="info">Información</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                {/* Editable fields */}
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Título del archivo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="altText">Texto alternativo</Label>
                      <Input
                        id="altText"
                        value={formData.altText}
                        onChange={(e) => setFormData((prev) => ({ ...prev, altText: e.target.value }))}
                        placeholder="Descripción para accesibilidad"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Descripción del archivo"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Etiquetas</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Nueva etiqueta"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        />
                        <Button variant="outline" size="sm" onClick={handleAddTag}>
                          Agregar
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                            <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                        Cancelar
                      </Button>
                      <Button onClick={handleSave} disabled={saving} className="flex-1">
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Información básica</h3>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                      <dl className="mt-2 space-y-2 text-sm">
                        <div>
                          <dt className="text-muted-foreground">Título</dt>
                          <dd className="font-medium">{file.title || file.filename}</dd>
                        </div>
                        {file.altText && (
                          <div>
                            <dt className="text-muted-foreground">Texto alternativo</dt>
                            <dd>{file.altText}</dd>
                          </div>
                        )}
                        {file.description && (
                          <div>
                            <dt className="text-muted-foreground">Descripción</dt>
                            <dd>{file.description}</dd>
                          </div>
                        )}
                        {file.tags && file.tags.length > 0 && (
                          <div>
                            <dt className="mb-1 text-muted-foreground">Etiquetas</dt>
                            <dd className="flex flex-wrap gap-1">
                              {file.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                  <Tag className="mr-1 h-3 w-3" />
                                  {tag}
                                </Badge>
                              ))}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 font-medium">Detalles del archivo</h3>
                      <dl className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <dt className="text-muted-foreground">Nombre:</dt>
                          <dd className="font-mono text-xs">{file.filename}</dd>
                        </div>
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4 text-muted-foreground" />
                          <dt className="text-muted-foreground">Tipo:</dt>
                          <dd>{file.mimeType}</dd>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <dt className="text-muted-foreground">Tamaño:</dt>
                          <dd>{formatFileSize(file.size)}</dd>
                        </div>
                        {file.width && file.height && (
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4 text-muted-foreground" />
                            <dt className="text-muted-foreground">Dimensiones:</dt>
                            <dd>
                              {file.width} × {file.height} px
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 font-medium">Ubicación</h3>
                      <dl className="space-y-2 text-sm">
                        {file.folder && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <dt className="text-muted-foreground">Carpeta:</dt>
                            <dd>{file.folder.name}</dd>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Link className="h-4 w-4 text-muted-foreground" />
                          <dt className="text-muted-foreground">URL:</dt>
                          <dd className="truncate font-mono text-xs">{file.url}</dd>
                        </div>
                      </dl>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-2 font-medium">Historial</h3>
                      <dl className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <dt className="text-muted-foreground">Subido por:</dt>
                          <dd>{file.uploadedByName || 'Desconocido'}</dd>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <dt className="text-muted-foreground">Fecha:</dt>
                          <dd>{formatDate(typeof file.createdAt === 'string' ? file.createdAt : file.createdAt.toISOString())}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Separator />

            {/* Danger zone */}
            <div className="space-y-2">
              <h3 className="font-medium text-destructive">Zona peligrosa</h3>
              <Button
                variant="outline"
                className="hover:text-destructive-foreground w-full text-destructive hover:bg-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar archivo
              </Button>
            </div>
          </div>
        </div>
          )}
        </div>
      </div>
    )
  }

  // Mobile: Sheet drawer (only show when file is selected)
  if (!file) return null
  
  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="flex h-screen w-full flex-col gap-0 p-0 sm:max-w-md [&>button]:top-6 [&>button]:right-6">
        <SheetHeader className="flex-shrink-0 border-b px-6 pt-6 pb-4">
          <SheetTitle>Detalles del archivo</SheetTitle>
          <SheetDescription className="sr-only">Información detallada del archivo seleccionado</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Preview */}
            <div className="mb-6">
              {file.type === 'image' ? (
                <img
                  src={previewImageUrl}
                  alt={file.title || file.filename}
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
                  <Video className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* File info */}
            <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Tamaño</p>
                <p className="font-medium">{formatFileSize(file.size || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tipo</p>
                <p className="font-medium">{file.mimeType}</p>
              </div>
              {file.width && file.height && (
                <>
                  <div>
                    <p className="text-muted-foreground">Dimensiones</p>
                    <p className="font-medium">
                      {file.width} × {file.height}px
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="text-muted-foreground">Subido por</p>
                <p className="font-medium">{file.uploadedByName || 'Desconocido'}</p>
              </div>
            </div>

            <Separator />

            {/* Tabs */}
            <Tabs defaultValue="info">
              <TabsList className="grid w-full">
                <TabsTrigger value="info">Información</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                {/* Editable fields */}
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Título del archivo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="altText">Texto alternativo</Label>
                      <Input
                        id="altText"
                        value={formData.altText}
                        onChange={(e) => setFormData((prev) => ({ ...prev, altText: e.target.value }))}
                        placeholder="Descripción para accesibilidad"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Descripción del archivo"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Etiquetas</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Agregar etiqueta"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const input = e.target as HTMLInputElement
                              if (input.value.trim()) {
                                setFormData((prev) => ({
                                  ...prev,
                                  tags: [...prev.tags, input.value.trim()],
                                }))
                                input.value = ''
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                            <button
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  tags: prev.tags.filter((_, i) => i !== index),
                                }))
                              }}
                              className="ml-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Título</p>
                      <p className="font-medium">{file.title || 'Sin título'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Texto alternativo</p>
                      <p className="font-medium">{file.altText || 'Sin texto alternativo'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Descripción</p>
                      <p className="font-medium">{file.description || 'Sin descripción'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Etiquetas</p>
                      <div className="flex flex-wrap gap-2">
                        {file.tags && file.tags.length > 0 ? (
                          file.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin etiquetas</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* File metadata */}
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Nombre del archivo</span>
                <span className="font-medium text-foreground">{file.filename}</span>
              </div>
              {file.folder && (
                <div className="flex justify-between">
                  <span>Carpeta</span>
                  <span className="font-medium text-foreground">{file.folder.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Creado</span>
                <span className="font-medium text-foreground">
                  {formatDate(file.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Modificado</span>
                <span className="font-medium text-foreground">
                  {formatDate(file.updatedAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar cambios
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        title: file.title || '',
                        description: file.description || '',
                        altText: file.altText || '',
                        tags: file.tags || [],
                      })
                    }}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    <Edit3 className="mr-2 h-4 w-4" />
                    Editar información
                  </Button>
                  <Button
                    onClick={handleCopyUrl}
                    variant="outline"
                    className="w-full"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        URL copiada
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar URL
                      </>
                    )}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <a href={file.url} download={file.filename}>
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
