import { useState } from 'react'
import { getOptimizedImageUrl } from '@/lib/utils/cloudflare-images'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { MediaGallery, MediaFolder } from '@/lib/db/schema'

interface MediaWithFolder extends MediaGallery {
  folder?: MediaFolder | null
}

interface FileDetailsProps {
  file: MediaWithFolder
  onClose: () => void
  onUpdate: (file: MediaWithFolder) => void
}

// ImageVariantItem function removed - not currently in use
// Can be re-added when variant functionality is implemented

export default function FileDetails({ file, onClose, onUpdate }: FileDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Get optimized image for preview
  const previewImageUrl = file.type === 'image' ? getOptimizedImageUrl(file.url, 'small') : file.url
  const [formData, setFormData] = useState({
    title: file.title || '',
    description: file.description || '',
    altText: file.altText || '',
    tags: file.tags || [],
  })
  const [newTag, setNewTag] = useState('')

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
    setSaving(true)
    try {
      const response = await fetch(`/api/manage/gallery/media/${file.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updated = await response.json()
        onUpdate(updated)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving file details:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCopyUrl = async () => {
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
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) return

    try {
      const response = await fetch(`/api/manage/gallery/media/${file.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onClose()
        window.location.reload()
      }
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="flex h-screen w-full flex-col gap-0 p-0 sm:max-w-md [&>button]:top-6 [&>button]:right-6">
        <SheetHeader className="flex-shrink-0 border-b px-6 pt-6 pb-4">
          <SheetTitle>Detalles del archivo</SheetTitle>
          <SheetDescription className="sr-only">Información detallada del archivo seleccionado</SheetDescription>
        </SheetHeader>

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
                          <dd>{formatDate(file.createdAt.toISOString())}</dd>
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
      </SheetContent>
    </Sheet>
  )
}
