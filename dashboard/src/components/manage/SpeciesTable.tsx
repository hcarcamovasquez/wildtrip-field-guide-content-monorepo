import { useState, useEffect, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { debounce } from '@/lib/utils'
import {
  Edit,
  Eye,
  Trash2,
  MoreVertical,
  Bird,
  Search,
  Plus,
  HardDrive,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import ResponsiveImage from './ResponsiveImage'
import PreviewModal from './PreviewModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
import { CreateSpeciesModal } from './CreateSpeciesModal'
import { CONSERVATION_STATUSES, getConservationStatus, getMainGroupLabel } from '@wildtrip/shared/constants'
import type { SpeciesWithBase } from '@/types'
import { apiClient } from '@/lib/api/client'

interface SpeciesTableProps {
  canDelete?: boolean
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

const getConservationVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
  const conservationStatus = getConservationStatus(status)
  if (!conservationStatus) return 'outline'

  // Use the color property from the centralized status
  switch (conservationStatus.color) {
    case 'black':
    case 'purple':
    case 'red':
      return 'destructive'
    case 'orange':
    case 'yellow':
      return 'default'
    case 'green':
      return 'secondary'
    default:
      return 'outline'
  }
}

function SpeciesTableComponent({ canDelete = false }: SpeciesTableProps) {
  const navigate = useNavigate()
  const [species, setSpecies] = useState<SpeciesWithBase[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [conservationFilter, setConservationFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [previewData, setPreviewData] = useState<{ url: string; publicUrl?: string; title: string } | null>(null)

  const fetchSpecies = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (conservationFilter !== 'all') params.set('conservationStatus', conservationFilter)

      const data = await apiClient.species.findAll(Object.fromEntries(params))

      setSpecies(data.data || data.items || [])
      setPagination({
        page: data.page || pagination.page,
        limit: data.limit || pagination.limit,
        total: data.total || 0,
        totalPages: data.totalPages || 0,
      })
    } catch (error) {
      console.error('Error fetching species:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, statusFilter, conservationFilter])

  useEffect(() => {
    fetchSpecies()
  }, [fetchSpecies])

  // Refetch data when window gains focus
  useEffect(() => {
    const handleFocus = async () => {
      if (!loading && document.visibilityState === 'visible') {
        setIsRefetching(true)
        await fetchSpecies()
        setIsRefetching(false)
      }
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchSpecies, loading])

  const handleSearch = useCallback(
    debounce(() => {
      setPagination((prev) => ({ ...prev, page: 1 }))
    }, 300),
    []
  )

  const handleDelete = useCallback(async () => {
    if (!deleteId) return

    try {
      await apiClient.species.delete(deleteId)
      fetchSpecies()
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting species:', error)
    }
  }, [deleteId, fetchSpecies])

  const formatDate = (date: string | Date) => {
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
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed Header Container */}
          <div className="flex-shrink-0 border-b bg-background">
            {/* Header */}
            <div className="px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">Especies</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HardDrive className="h-4 w-4" />
                    <span>{pagination.total} especies</span>
                  </div>
                  {isRefetching && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Actualizando...</span>
                    </div>
                  )}
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Especie
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
                      placeholder="Buscar especies..."
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
                  <Select value={conservationFilter} onValueChange={setConservationFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Estado de conservación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {CONSERVATION_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.emoji} {status.label}
                        </SelectItem>
                      ))}
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
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Nombre</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Grupo</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Categoría</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Familia</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Estado</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Conservación</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Modificado</th>
                    <th className="w-10 bg-background px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8">
                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Cargando especies...</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : species.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                        No se encontraron especies
                      </td>
                    </tr>
                  ) : (
                    species.map((item) => (
                      <tr 
                        key={item.id} 
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/species/${item.id}/edit`)}
                      >
                        <td className="px-6 py-3 pr-4">
                          <div className="flex items-center gap-3">
                            {item.mainImage?.url ? (
                              <ResponsiveImage
                                src={item.mainImage.url}
                                alt={item.scientificName}
                                className="h-10 w-10 rounded object-cover"
                                variant="thumb"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                                <Bird className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-medium italic">{item.scientificName}</div>
                              </div>
                              <div className="text-sm text-muted-foreground">{item.commonName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 pr-4 text-muted-foreground">
                          {item.mainGroup ? getMainGroupLabel(item.mainGroup) : '—'}
                        </td>
                        <td className="px-6 py-3 pr-4 text-muted-foreground">{item.specificCategory || '—'}</td>
                        <td className="px-6 py-3 pr-4 text-muted-foreground">{item.family || '—'}</td>
                        <td className="px-6 py-3 pr-4">
                          <Badge variant={getStatusVariant(item.status || 'draft')}>
                            {statusLabels[item.status || 'draft']}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 pr-4">
                          {item.conservationStatus ? (
                            <Badge
                              variant={getConservationVariant(item.conservationStatus)}
                              className="flex items-center gap-1"
                            >
                              {getConservationStatus(item.conservationStatus) &&
                                ['black', 'purple', 'red', 'orange'].includes(
                                  getConservationStatus(item.conservationStatus)!.color,
                                ) && <AlertTriangle className="h-3 w-3" />}
                              {getConservationStatus(item.conservationStatus)?.label || 'No evaluada'}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3 pr-4 text-muted-foreground">
                          {item.updatedAt ? formatDate(item.updatedAt) : '—'}
                        </td>
                        <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <a href={`/species/${item.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setPreviewData({
                                    url: `${import.meta.env.VITE_WEB_URL}/content/species/preview/${item.id}?t=${Date.now()}`,
                                    publicUrl:
                                      item.status === 'published' && !item.hasDraft
                                        ? `${import.meta.env.VITE_WEB_URL}/content/species/${item.slug}`
                                        : undefined,
                                    title: `Vista previa: ${item.commonName || item.scientificName}`,
                                  })
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Vista previa
                              </DropdownMenuItem>
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
                      {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} especies
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
        <CreateSpeciesModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(speciesId) => {
            setShowCreateModal(false)
            navigate(`/species/${speciesId}/edit?new=true`)
          }}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar especie?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la especie y toda su información asociada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="text-destructive-foreground bg-destructive">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewData && (
        <PreviewModal
          isOpen={!!previewData}
          onClose={() => setPreviewData(null)}
          previewUrl={previewData.url}
          publicUrl={previewData.publicUrl}
          title={previewData.title}
        />
      )}
    </>
  )
}

const SpeciesTable = memo(SpeciesTableComponent)
export default SpeciesTable
