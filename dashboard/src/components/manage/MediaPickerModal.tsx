import { useState, useEffect, useCallback, useRef } from 'react'
import { Check, Upload, Search, Grid, List, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { validateImageFile, convertToWebP } from '@/lib/utils/image-upload'
import { getOptimizedImageUrl } from '@/lib/utils/cloudflare-images'
import { apiClient } from '@/lib/api/client'

interface MediaItem {
  id: number
  url: string
  filename: string
  title?: string
  altText?: string
  width?: number
  height?: number
  size: number
  uploadedAt: string
}

interface MediaPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (items: MediaItem[]) => void
  multiSelect?: boolean
}

export default function MediaPickerModal({ open, onOpenChange, onSelect, multiSelect = true }: MediaPickerModalProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState('browse')
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      // Reset state when opening modal
      setMediaItems([])
      setCurrentPage(1)
      setHasMore(true)
      fetchMediaItems(1, false)
    }
  }, [open])

  // Reset and refetch when search changes
  useEffect(() => {
    if (open) {
      const timeoutId = setTimeout(() => {
        setMediaItems([])
        setCurrentPage(1)
        setHasMore(true)
        fetchMediaItems(1, false)
      }, 300) // Debounce search
      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery, open])

  const fetchMediaItems = async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    
    try {
      const params = {
        page,
        limit: 50,
        ...(searchQuery && { search: searchQuery })
      }

      const data = await apiClient.gallery.images(params)
      const newItems = data.items || []
      
      if (append) {
        setMediaItems(prev => [...prev, ...newItems])
      } else {
        setMediaItems(newItems)
      }
      
      if (data.pagination) {
        setCurrentPage(data.pagination.page)
        setHasMore(data.pagination.page < data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadedItems: MediaItem[] = []

    try {
      for (const file of Array.from(files)) {
        const validation = validateImageFile(file)
        if (!validation.valid) {
          alert(validation.error)
          continue
        }

        const fileToUpload = await convertToWebP(file)
        const formData = new FormData()
        formData.append('file', fileToUpload)
        formData.append('folderId', '') // Root folder

        // Source info no longer needed - relationships stored in JSON columns

        const media = await apiClient.gallery.upload(fileToUpload, { folderId: null })
        if (media) {
          uploadedItems.push(media)
        }
      }

      if (uploadedItems.length > 0) {
        // Filter out any undefined items
        const validItems = uploadedItems.filter(item => item && item.id && item.url)
        if (validItems.length > 0) {
          // Add new items to the beginning of the list
          setMediaItems((prev) => [...validItems, ...prev])
          if (!multiSelect) {
            handleSelect(validItems[0])
          } else {
            setSelectedItems((prev) => [...prev, ...validItems.map((item) => item.id)])
          }
          // Switch to browse tab to show uploaded images
          setActiveTab('browse')
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSelect = (item: MediaItem) => {
    if (multiSelect) {
      setSelectedItems((prev) => (prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]))
    } else {
      onSelect([item])
      onOpenChange(false)
    }
  }

  const handleConfirmSelection = () => {
    const selected = mediaItems.filter((item) => selectedItems.includes(item.id))
    onSelect(selected)
    onOpenChange(false)
  }

  // Infinite scroll handler
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget

    // Load more when user scrolls near the bottom (within 200px)
    if (scrollHeight - scrollTop - clientHeight < 200 && hasMore && !loadingMore && !loading) {
      fetchMediaItems(currentPage + 1, true)
    }
  }, [hasMore, loadingMore, loading, currentPage])

  // Load more function for button fallback
  const loadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      fetchMediaItems(currentPage + 1, true)
    }
  }

  // Server handles all filtering now - ensure no undefined items
  const filteredItems = mediaItems.filter(item => item && item.id)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-h-[900px] max-w-5xl flex-col p-0">
        <DialogHeader className="flex-shrink-0 border-b px-6 py-4">
          <DialogTitle>Seleccionar imágenes</DialogTitle>
          <DialogDescription>
            {multiSelect ? 'Selecciona una o más imágenes de la galería' : 'Selecciona una imagen de la galería'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <TabsList className="mx-6 flex-shrink-0">
            <TabsTrigger value="browse">Explorar galería</TabsTrigger>
            <TabsTrigger value="upload">Subir nuevas</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex-shrink-0 space-y-3 border-b px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar imágenes..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setSelectedItems([]) // Clear selection when searching
                    }}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {multiSelect && selectedItems.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedItems.length} imagen{selectedItems.length !== 1 ? 'es' : ''} seleccionada
                    {selectedItems.length !== 1 ? 's' : ''}
                  </span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedItems([])}>
                    Limpiar selección
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="min-h-0 flex-1" onScrollCapture={handleScroll}>
              <div className="px-6">
                {uploading ? (
                  <div className="flex h-64 flex-col items-center justify-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
                    <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
                  </div>
                ) : loading ? (
                  <div className="flex h-64 items-center justify-center">
                    <p className="text-muted-foreground">Cargando imágenes...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center">
                    <ImageIcon className="mb-3 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No se encontraron imágenes</p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-4 gap-4 py-4">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          'group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all',
                          selectedItems.includes(item.id)
                            ? 'border-primary ring-2 ring-primary ring-offset-2'
                            : 'border-transparent hover:border-muted-foreground/50',
                        )}
                        onClick={() => handleSelect(item)}
                      >
                        <div className="aspect-square bg-muted">
                          <img
                            src={getOptimizedImageUrl(item.url, 'small')}
                            alt={item.altText || item.filename}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        {selectedItems.includes(item.id) && (
                          <div className="absolute top-2 right-2 rounded-full bg-primary p-1 text-primary-foreground">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="truncate text-xs text-white">{item.title || item.filename}</p>
                          <p className="text-xs text-white/80">{formatFileSize(item.size)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors',
                          selectedItems.includes(item.id) ? 'border border-primary bg-primary/10' : 'hover:bg-muted',
                        )}
                        onClick={() => handleSelect(item)}
                      >
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          <img
                            src={getOptimizedImageUrl(item.url, 'thumb')}
                            alt={item.altText || item.filename}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{item.title || item.filename}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.width && item.height && `${item.width} × ${item.height} • `}
                            {formatFileSize(item.size)}
                          </p>
                        </div>
                        {selectedItems.includes(item.id) && <Check className="h-5 w-5 flex-shrink-0 text-primary" />}
                      </div>
                    ))}
                  </div>
                )}

                {/* Infinite scroll loading indicator */}
                {loadingMore && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
                      <p className="text-sm text-muted-foreground">Cargando más imágenes...</p>
                    </div>
                  </div>
                )}

                {/* Load more button fallback */}
                {!loadingMore && hasMore && filteredItems.length > 0 && (
                  <div className="flex items-center justify-center py-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={loadMore}
                      disabled={loading}
                    >
                      Cargar más imágenes
                    </Button>
                  </div>
                )}

                {/* End of results indicator */}
                {!hasMore && filteredItems.length > 0 && (
                  <div className="flex items-center justify-center py-6">
                    <p className="text-sm text-muted-foreground">No hay más imágenes</p>
                  </div>
                )}
              </div>
            </ScrollArea>

          </TabsContent>

          <TabsContent value="upload" className="m-0 flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto w-full max-w-sm">
                <label className="relative block">
                  <div className={cn(
                    "rounded-lg border-2 border-dashed p-12 transition-colors",
                    uploading 
                      ? "border-muted-foreground/10 cursor-not-allowed opacity-50" 
                      : "border-muted-foreground/25 cursor-pointer hover:border-muted-foreground/50"
                  )}>
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">Arrastra imágenes aquí</p>
                    <p className="mt-1 text-xs text-muted-foreground">o haz clic para seleccionar</p>
                    <p className="mt-2 text-xs text-muted-foreground">PNG, JPG, WebP, AVIF hasta 15MB</p>
                    <p className="mt-1 text-xs text-muted-foreground">Las imágenes se convertirán a formato WebP</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple={multiSelect}
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </label>
                {uploading && (
                  <div className="mt-4 flex flex-col items-center">
                    <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
                    <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {multiSelect && (
          <DialogFooter className="flex-shrink-0 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleConfirmSelection} disabled={selectedItems.length === 0}>
              Seleccionar {selectedItems.length > 0 && `(${selectedItems.length})`}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
