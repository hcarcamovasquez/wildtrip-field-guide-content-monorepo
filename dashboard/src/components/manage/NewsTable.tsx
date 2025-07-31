import {
  Eye,
  Edit,
  Lock,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Trash2,
  MoreVertical,
  Newspaper,
  HardDrive,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { CreateNewsModal } from './CreateNewsModal'
import ResponsiveImage from './ResponsiveImage'
// import PreviewModal from './PreviewModal' - Not currently used
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { apiClient } from '@/lib/api/client'
import { useNavigate } from 'react-router-dom'

interface NewsItem {
  id: number
  title: string
  slug: string
  category: string
  author?: string
  summary?: string
  mainImage?: {
    id: string
    url: string
    galleryId: number
  }
  mainImageMetadata?: Record<string, unknown>
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  lockedBy?: number
  hasDraft?: boolean
}

interface NewsTableProps {
  onEdit?: (id: number) => void
  onPreview?: (id: number, slug: string, status?: string, hasDraft?: boolean) => void
  currentUserId: number
  canDelete?: boolean
}

const categoryLabels: Record<string, string> = {
  conservation: 'Conservación',
  research: 'Investigación',
  education: 'Educación',
  current_events: 'Actualidad',
}

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
}

const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch (status) {
    case 'published':
      return 'default'
    case 'draft':
      return 'secondary'
    case 'archived':
      return 'outline'
    default:
      return 'secondary'
  }
}

const getCategoryVariant = (category: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch (category) {
    case 'conservation':
      return 'default'
    case 'research':
      return 'secondary'
    case 'education':
      return 'outline'
    case 'current_events':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export default function NewsTable({ currentUserId, canDelete = false, onEdit, onPreview }: NewsTableProps) {
  const navigate = useNavigate()
  const [news, setNews] = useState<NewsItem[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  // const [previewData, setPreviewData] = useState<{ url: string; publicUrl?: string; title: string } | null>(null) - Not currently used

  useEffect(() => {
    fetchNews()
  }, [pagination.page, statusFilter, categoryFilter])

  const fetchNews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)

      const data = await apiClient.news.findAll(Object.fromEntries(params))

      setNews(data.data || data.items || [])
      setPagination({
        page: data.page || pagination.page,
        limit: data.limit || pagination.limit,
        total: data.total || 0,
        totalPages: data.totalPages || 0,
      })
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchNews()
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await apiClient.news.delete(deleteId)
      fetchNews()
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting news:', error)
    }
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

  return (
    <>
      <div className="flex h-full overflow-hidden">
        <div className="flex flex-1 flex-col h-full overflow-hidden">
          {/* Fixed Header Container */}
          <div className="flex-shrink-0 border-b bg-background">
            {/* Header */}
            <div className="px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">Noticias</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HardDrive className="h-4 w-4" />
                    <span>{pagination.total} artículos</span>
                  </div>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Noticia
                </Button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="border-t px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-64">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Buscar noticias..."
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="archived">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="conservation">Conservación</SelectItem>
                      <SelectItem value="research">Investigación</SelectItem>
                      <SelectItem value="education">Educación</SelectItem>
                      <SelectItem value="current_events">Actualidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <div>
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-background shadow-sm">
                  <tr className="border-b text-left">
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Título</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Categoría</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Estado</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Autor</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Modificado</th>
                    <th className="w-10 bg-background px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        Cargando noticias...
                      </td>
                    </tr>
                  ) : news.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No se encontraron noticias
                      </td>
                    </tr>
                  ) : (
                    news.map((item) => (
                      <tr 
                        key={item.id} 
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => window.location.href = `/news/${item.id}/edit`}
                      >
                        <td className="px-6 py-3 pr-4">
                          <div className="flex items-center gap-3">
                            {item.mainImage?.url ? (
                              <ResponsiveImage
                                src={item.mainImage.url}
                                alt={item.title}
                                className="h-10 w-10 rounded object-cover"
                                variant="thumb"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                                <Newspaper className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-medium">{item.title}</div>
                                {item.lockedBy && item.lockedBy !== currentUserId && (
                                  <Lock className="h-3 w-3 text-orange-500" />
                                )}
                                {item.hasDraft && (
                                  <Badge variant="outline" className="text-xs">
                                    <FileText className="mr-1 h-3 w-3" />
                                    Borrador
                                  </Badge>
                                )}
                              </div>
                              {item.summary && (
                                <div className="line-clamp-1 text-sm text-muted-foreground">{item.summary}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 pr-4">
                          <Badge variant={getCategoryVariant(item.category)}>
                            {categoryLabels[item.category] || item.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 pr-4">
                          <Badge variant={getStatusVariant(item.status)}>{statusLabels[item.status]}</Badge>
                        </td>
                        <td className="px-6 py-3 pr-4 text-muted-foreground">{item.author || '—'}</td>
                        <td className="px-6 py-3 pr-4 text-muted-foreground">{formatDate(item.updatedAt)}</td>
                        <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onEdit && (
                                <DropdownMenuItem onClick={() => navigate(`/news/${item.id}/edit`)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              {onPreview && (
                                <DropdownMenuItem
                                  onClick={() => window.open(`${import.meta.env.VITE_WEB_URL}/content/news/preview/${item.id}`, '_blank')}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Vista previa
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(item.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="sticky bottom-0 border-t bg-background px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} noticias
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
                        disabled={pagination.page === 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Página {pagination.page} de {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPagination((prev) => ({ ...prev, page: pagination.totalPages }))}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateNewsModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchNews()
          }}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la noticia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
