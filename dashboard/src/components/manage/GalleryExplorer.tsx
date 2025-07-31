import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Folder,
  FolderOpen,
  Upload,
  Search,
  Grid3x3,
  List,
  MoreVertical,
  Download,
  Trash2,
  Edit3,
  Move,
  Eye,
  Copy,
  Image,
  Video,
  Home,
  ChevronRight,
  FolderPlus,
  HardDrive,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { convertToWebP } from '@/lib/utils/image-upload'
import FileDetails from './FileDetails'
import type { MediaFolder } from '@/types'
import { apiClient } from '@/lib/api/client'
import { useQueryClient } from '@tanstack/react-query'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { getOptimizedImageUrl } from '@/lib/utils/cloudflare-images'

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
  [key: string]: any
}

interface GalleryExplorerProps {
  initialData: {
    currentFolder: MediaFolder | null
    breadcrumb: MediaFolder[]
    items: GalleryItem[]
    stats: {
      totalFiles: number
      totalFolders: number
    }
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    currentUser: {
      id: string
      name: string
      role: string
    }
  }
}

export default function GalleryExplorer({ initialData }: GalleryExplorerProps) {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectedFile, setSelectedFile] = useState<GalleryItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState(initialData.items)
  const [currentFolder, setCurrentFolder] = useState(initialData.currentFolder)
  const [breadcrumb, setBreadcrumb] = useState(initialData.breadcrumb)
  const [uploading, setUploading] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [targetFolderId, setTargetFolderId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Infinite scroll state
  const [page, setPage] = useState(initialData.pagination.page)
  const [hasMore, setHasMore] = useState(initialData.pagination.page < initialData.pagination.totalPages)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const itemsPerPage = 20
  
  // Update state when initialData changes (URL navigation)
  useEffect(() => {
    // Only reset items when folder changes or on initial load
    setCurrentFolder(initialData.currentFolder)
    setBreadcrumb(initialData.breadcrumb)
    
    // Only reset items on initial page load or folder change
    if (initialData.pagination.page === 1) {
      setItems(initialData.items)
      setPage(1)
      setSelectedItems(new Set())
    }
    
    setHasMore(initialData.pagination.page < initialData.pagination.totalPages)
  }, [initialData.currentFolder?.id, initialData.pagination.page])

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleFolderClick = async (folder: GalleryItem) => {
    // Update URL params
    const newParams = new URLSearchParams(searchParams)
    newParams.set('folder', folder.id.toString())
    newParams.delete('page') // Reset to page 1 when changing folders
    setSearchParams(newParams)
    
    // The rest of the navigation will be handled by the page component
    // when it detects the URL change
  }

  const handleBreadcrumbClick = async (index: number) => {
    const newParams = new URLSearchParams(searchParams)
    
    if (index === -1) {
      // Go to root
      newParams.delete('folder')
      newParams.delete('page')
    } else {
      // Navigate to breadcrumb folder
      const folder = breadcrumb[index]
      newParams.set('folder', folder.id.toString())
      newParams.delete('page')
    }
    
    setSearchParams(newParams)
  }
  
  const loadMoreItems = async () => {
    if (isLoadingMore || !hasMore) return
    
    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const browseData = await apiClient.gallery.browse({ 
        folderId: currentFolder?.id || null,
        page: nextPage,
        limit: itemsPerPage
      })
      
      if (browseData.data && browseData.data.length > 0) {
        setItems(prev => [...prev, ...browseData.data])
        setPage(nextPage)
        setHasMore(browseData.pagination.page < browseData.pagination.totalPages)
        
        // Update URL with new page
        const newParams = new URLSearchParams(searchParams)
        newParams.set('page', nextPage.toString())
        setSearchParams(newParams, { replace: true })
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more items:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }
  
  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    onLoadMore: loadMoreItems,
    isLoading: isLoadingMore,
    threshold: 200
  })

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
    } else {
      const allIds = new Set<string>()
      items.forEach((item) => {
        const prefix = item.type === 'folder' ? 'folder-' : 'media-'
        allIds.add(`${prefix}${item.id}`)
      })
      setSelectedItems(allIds)
    }
  }

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          continue
        }

        let uploadFile = file
        // Convert images to WebP
        if (file.type.startsWith('image/')) {
          uploadFile = await convertToWebP(file)
        }

        const uploadData: any = {}
        if (currentFolder) {
          uploadData.folderId = currentFolder.id
        }

        const newMedia = await apiClient.gallery.upload(uploadFile, uploadData)
        if (newMedia) {
          setItems((prev) => [{
            ...newMedia,
            type: 'image' as const
          }, ...prev])
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const newFolder = await apiClient.gallery.createFolder({
        name: newFolderName,
        parentId: currentFolder?.id || null,
      })
      
      // Add the new folder to items
      setItems((prev) => [{
        ...newFolder,
        type: 'folder' as const,
        fileCount: 0,
        folderCount: 0
      }, ...prev])
      
      setNewFolderName('')
      setShowNewFolderDialog(false)
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['gallery', 'browse'] })
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return

    if (!confirm(`¿Eliminar ${selectedItems.size} elementos seleccionados?`)) return

    try {
      const mediaIds: number[] = []
      const folderIds: number[] = []

      selectedItems.forEach((id) => {
        if (id.startsWith('media-')) {
          mediaIds.push(parseInt(id.replace('media-', '')))
        } else if (id.startsWith('folder-')) {
          folderIds.push(parseInt(id.replace('folder-', '')))
        }
      })

      // Delete media files
      if (mediaIds.length > 0) {
        await apiClient.gallery.deleteMediaBatch(mediaIds)
        setItems((prev) => prev.filter((item) => {
          if (item.type !== 'folder' && mediaIds.includes(item.id)) {
            return false
          }
          return true
        }))
      }

      // Delete folders
      for (const folderId of folderIds) {
        await apiClient.gallery.deleteFolder(folderId)
        setItems((prev) => prev.filter((item) => {
          if (item.type === 'folder' && item.id === folderId) {
            return false
          }
          return true
        }))
      }

      setSelectedItems(new Set())
    } catch (error) {
      console.error('Error deleting items:', error)
    }
  }

  const handleMoveSelected = async () => {
    if (selectedItems.size === 0) return

    try {
      const mediaIds: number[] = []
      selectedItems.forEach((id) => {
        if (id.startsWith('media-')) {
          mediaIds.push(parseInt(id.replace('media-', '')))
        }
      })

      if (mediaIds.length > 0) {
        await apiClient.gallery.moveMedia(mediaIds, targetFolderId)

        // Remove moved items from current view
        setItems((prev) => prev.filter((item) => {
          if (item.type !== 'folder' && mediaIds.includes(item.id)) {
            return false
          }
          return true
        }))
        setSelectedItems(new Set())
        setShowMoveDialog(false)
      }
    } catch (error) {
      console.error('Error moving items:', error)
    }
  }

  const getItemIcon = (item: GalleryItem) => {
    if (item.type === 'folder') {
      return (item.fileCount && item.fileCount > 0) || (item.folderCount && item.folderCount > 0) ? FolderOpen : Folder
    }
    return item.type === 'video' ? Video : Image
  }

  const filteredItems = items.filter((item) => {
    if (searchQuery === '') return true
    
    const searchLower = searchQuery.toLowerCase()
    
    if (item.type === 'folder') {
      return item.name?.toLowerCase().includes(searchLower)
    } else {
      return (
        item.filename?.toLowerCase().includes(searchLower) ||
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      )
    }
  })

  return (
    <div className="flex h-full">
      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Fixed Header Container */}
        <div className="flex-shrink-0 border-b bg-background">
          {/* Header */}
          <div className="px-6 py-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Galería de Medios</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HardDrive className="h-4 w-4" />
                  <span>{initialData.stats.totalFiles} archivos</span>
                  <span>•</span>
                  <span>{initialData.stats.totalFolders} carpetas</span>
                </div>
              </div>
            </div>
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <button
                onClick={() => handleBreadcrumbClick(-1)}
                className="hover:text-foreground transition-colors"
              >
                <Home className="h-4 w-4" />
              </button>
              {breadcrumb.map((folder, index) => (
                <div key={folder.id} className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  {index === breadcrumb.length - 1 ? (
                    <span className="text-foreground font-medium">{folder.name}</span>
                  ) : (
                    <button
                      onClick={() => handleBreadcrumbClick(index)}
                      className="hover:text-foreground transition-colors"
                    >
                      {folder.name}
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div></div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowNewFolderDialog(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Nueva Carpeta
                </Button>
                <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Subiendo...' : 'Subir Archivos'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="border-t px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar archivos..."
                    className="pl-9"
                  />
                </div>
                {selectedItems.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{selectedItems.size} seleccionados</span>
                    <Button variant="outline" size="sm" onClick={() => setShowMoveDialog(true)}>
                      <Move className="mr-2 h-4 w-4" />
                      Mover
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDeleteSelected} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* File list/grid */}
        <div className="relative flex-1 overflow-auto">
          {viewMode === 'list' ? (
            <div className="h-full">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-background shadow-sm">
                  <tr className="border-b text-left">
                    <th className="w-10 bg-background px-6 py-3 pr-4">
                      <Checkbox
                        checked={
                          selectedItems.size === filteredItems.length && selectedItems.size > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Nombre</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Tamaño</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Tipo</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Modificado</th>
                    <th className="w-10 bg-background px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Render items (folders and media) */}
                  {filteredItems.map((item) => {
                    const Icon = getItemIcon(item)
                    const itemId = `${item.type === 'folder' ? 'folder' : 'media'}-${item.id}`
                    
                    if (item.type === 'folder') {
                      return (
                        <tr key={itemId} className="border-b hover:bg-muted/50">
                          <td className="px-6 py-3 pr-4">
                            <Checkbox
                              checked={selectedItems.has(itemId)}
                              onCheckedChange={() => handleSelectItem(itemId)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-6 py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                              <button
                                onClick={() => handleFolderClick(item)}
                                className="text-left hover:underline"
                              >
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Contiene: {item.fileCount || 0} {(item.fileCount || 0) === 1 ? 'archivo' : 'archivos'}, {item.folderCount || 0} {(item.folderCount || 0) === 1 ? 'carpeta' : 'carpetas'}
                                </div>
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-3 pr-4 text-muted-foreground">—</td>
                          <td className="px-6 py-3 pr-4">
                            <Badge variant="secondary">Carpeta</Badge>
                          </td>
                          <td className="px-6 py-3 pr-4 text-muted-foreground">
                            {formatDate(typeof item.updatedAt === 'string' ? item.updatedAt : item.updatedAt.toISOString())}
                          </td>
                          <td className="px-6 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleFolderClick(item)}
                                >
                                  <FolderOpen className="mr-2 h-4 w-4" />
                                  Abrir
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit3 className="mr-2 h-4 w-4" />
                                  Renombrar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )
                    } else {
                      // Media item
                      return (
                        <tr
                          key={itemId}
                          className="cursor-pointer border-b hover:bg-muted/50"
                          onClick={() => setSelectedFile(item)}
                        >
                          <td className="px-6 py-3 pr-4">
                            <Checkbox
                              checked={selectedItems.has(itemId)}
                              onCheckedChange={() => handleSelectItem(itemId)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-6 py-3 pr-4">
                            <div className="flex items-center gap-3">
                              {item.type === 'image' && item.url ? (
                                <img
                                  src={getOptimizedImageUrl(item.url, 'thumb')}
                                  alt={item.title || item.filename}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ) : (
                                <Icon className="h-5 w-5 text-muted-foreground" />
                              )}
                              <div>
                                <div className="font-medium">{item.title || item.filename}</div>
                                {item.description && (
                                  <div className="line-clamp-1 text-sm text-muted-foreground">{item.description}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 pr-4 text-muted-foreground">{formatFileSize(item.size || 0)}</td>
                          <td className="px-6 py-3 pr-4">
                            <Badge variant="outline">{item.type === 'image' ? 'Imagen' : 'Video'}</Badge>
                          </td>
                          <td className="px-6 py-3 pr-4 text-muted-foreground">
                            {formatDate(typeof item.updatedAt === 'string' ? item.updatedAt : item.updatedAt.toISOString())}
                          </td>
                          <td className="px-6 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                              </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedFile(item)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit3 className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.url || '')}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copiar URL
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={item.url} download={item.filename}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )
                    }
                  })}
                </tbody>
              </table>
              
              {/* Infinite scroll sentinel and loading indicator for list view */}
              <div ref={sentinelRef} className="h-10" />
              {isLoadingMore && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {/* Render items (folders and media) */}
              {filteredItems.map((item) => {
                const itemId = `${item.type === 'folder' ? 'folder' : 'media'}-${item.id}`
                
                if (item.type === 'folder') {
                  return (
                    <Card
                      key={itemId}
                      className="cursor-pointer transition-shadow hover:shadow-md"
                      onClick={() => handleFolderClick(item)}
                    >
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <Folder className="h-8 w-8 text-muted-foreground" />
                          <Checkbox
                            checked={selectedItems.has(itemId)}
                            onCheckedChange={() => handleSelectItem(itemId)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="line-clamp-2 text-sm font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">Contiene: {item.fileCount || 0} {(item.fileCount || 0) === 1 ? 'archivo' : 'archivos'}</div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                } else {
                  // Media item
                  return (
                    <Card
                      key={itemId}
                      className="cursor-pointer transition-shadow hover:shadow-md"
                      onClick={() => setSelectedFile(item)}
                    >
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-start justify-between">
                          {item.type === 'image' && item.url ? (
                            <img
                              src={getOptimizedImageUrl(item.url, 'thumb')}
                              alt={item.title || item.filename}
                              className="h-24 w-full rounded object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Video className="h-8 w-8 text-muted-foreground" />
                          )}
                          <Checkbox
                            checked={selectedItems.has(itemId)}
                            onCheckedChange={() => handleSelectItem(itemId)}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-2 right-2 rounded bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="line-clamp-2 text-sm font-medium">{item.title || item.filename}</div>
                          <div className="text-xs text-muted-foreground">{formatFileSize(item.size || 0)}</div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }
              })}
              
              {/* Infinite scroll sentinel and loading indicator */}
              {viewMode === 'grid' && (
                <>
                  <div ref={sentinelRef} className="col-span-full h-10" />
                  {isLoadingMore && (
                    <div className="col-span-full flex justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* File details sidebar */}
      {selectedFile && (
        <FileDetails
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onUpdate={(updatedFile) => {
            setItems((prev) => prev.map((item) => (item.id === updatedFile.id && item.type !== 'folder' ? {...updatedFile, type: item.type} as GalleryItem : item)))
            setSelectedFile(updatedFile as GalleryItem)
          }}
        />
      )}

      {/* New folder dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Carpeta</DialogTitle>
            <DialogDescription>Crea una nueva carpeta para organizar tus archivos</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Nombre de la carpeta</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Mi carpeta"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateFolder}>Crear Carpeta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover Archivos</DialogTitle>
            <DialogDescription>
              Selecciona la carpeta de destino para mover los archivos seleccionados
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              <Button
                variant={targetFolderId === null ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setTargetFolderId(null)}
              >
                <Home className="mr-2 h-4 w-4" />
                Raíz
              </Button>
              {/* Nota: La carga recursiva de carpetas se implementará cuando sea necesario para mejorar la navegación */}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleMoveSelected}>Mover Aquí</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
