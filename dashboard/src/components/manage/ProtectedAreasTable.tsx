import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Edit,
  Eye,
  Trash2,
  MoreVertical,
  Lock,
  FileText,
  Mountain,
  Search,
  HardDrive,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react'
import ResponsiveImage from './ResponsiveImage'
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
import CreateProtectedAreaModal from './CreateProtectedAreaModal'
import PreviewModal from './PreviewModal'
import type { ProtectedAreaWithBase } from '@/types'
import type { Role } from '@/lib/utils/permissions'
import { PROTECTED_AREA_TYPES, getRegionLabel } from '@wildtrip/shared/constants'
import { apiClient } from '@/lib/api/client'

interface ProtectedAreasTableProps {
  areas: ProtectedAreaWithBase[]
  currentUserRole: Role
  currentUserId: number
  onDelete: (id: number) => void
  onRefresh: () => void
  onPreview?: (id: number, slug: string, name: string, status?: string, hasDraft?: boolean) => void
  isLoading?: boolean
  error?: any
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

const statusLabels = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
}

export default function ProtectedAreasTable({
  areas,
  currentUserRole,
  currentUserId,
  onDelete,
  onRefresh,
  onPreview,
  isLoading,
  error,
}: ProtectedAreasTableProps) {
  const navigate = useNavigate()
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; areaId: number | null }>({
    open: false,
    areaId: null,
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-'
    const d = new Date(date)
    return d.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDelete = (areaId: number) => {
    setDeleteDialog({ open: true, areaId })
  }

  const confirmDelete = () => {
    if (deleteDialog.areaId) {
      onDelete(deleteDialog.areaId)
      setDeleteDialog({ open: false, areaId: null })
    }
  }

  const isLocked = (area: ProtectedAreaWithBase) => {
    return area.lockedBy && area.lockExpiresAt && new Date(area.lockExpiresAt) > new Date()
  }

  // Filter areas based on search and filters
  const filteredAreas = areas.filter((area) => {
    const matchesSearch =
      search === '' ||
      area.name.toLowerCase().includes(search.toLowerCase()) ||
      area.description?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || area.status === statusFilter
    const matchesType = typeFilter === 'all' || area.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Pagination
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage)
  const paginatedAreas = filteredAreas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
                  <h1 className="text-2xl font-bold">Áreas Protegidas</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HardDrive className="h-4 w-4" />
                    <span>{areas.length} áreas</span>
                  </div>
                </div>
                <CreateProtectedAreaModal
                  onCreate={async (data) => {
                    try {
                      const response = await apiClient.protectedAreas.create(data)
                      if (response && response.id) {
                        navigate(`/protected-areas/${response.id}/edit?new=true`)
                      } else {
                        onRefresh()
                      }
                    } catch (error) {
                      console.error('Error creating area:', error)
                    }
                  }}
                />
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
                      placeholder="Buscar áreas..."
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
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {PROTECTED_AREA_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Tipo</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Estado</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Región</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Modificado</th>
                    <th className="w-10 bg-background px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8">
                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Cargando áreas protegidas...</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-destructive">
                        Error al cargar las áreas protegidas
                      </td>
                    </tr>
                  ) : paginatedAreas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No se encontraron áreas protegidas
                      </td>
                    </tr>
                  ) : (
                    paginatedAreas.map((area) => (
                      <tr 
                        key={area.id} 
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/protected-areas/${area.id}/edit`)}
                      >
                        <td className="px-6 py-3 pr-4">
                          <div className="flex items-center gap-3">
                            {area.mainImage?.url ? (
                              <ResponsiveImage
                                src={area.mainImage?.url}
                                alt={area.name}
                                className="h-10 w-10 rounded object-cover"
                                variant="thumb"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                                <Mountain className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-medium">{area.name}</div>
                                {isLocked(area) && area.lockedBy !== String(currentUserId) && (
                                  <Lock className="h-3 w-3 text-orange-500" />
                                )}
                                {area.hasDraft && (
                                  <Badge variant="outline" className="text-xs">
                                    <FileText className="mr-1 h-3 w-3" />
                                    Borrador
                                  </Badge>
                                )}
                              </div>
                              {area.description && (
                                <div className="line-clamp-1 text-sm text-muted-foreground">{area.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 pr-4">
                          <Badge variant="outline">
                            {PROTECTED_AREA_TYPES.find((t) => t.value === (area.type || 'other'))?.label || 'Otro'}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 pr-4">
                          <Badge variant={getStatusVariant(area.status || 'draft')}>
                            {statusLabels[area.status || 'draft']}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 pr-4 text-muted-foreground">
                          {area.region ? getRegionLabel(area.region) : '—'}
                        </td>
                        <td className="px-6 py-3 pr-4 text-muted-foreground">{formatDate(area.updatedAt)}</td>
                        <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/protected-areas/${area.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              {onPreview && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    onPreview(area.id, area.slug, area.name, area.status || 'draft', area.hasDraft)
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Vista previa
                                </DropdownMenuItem>
                              )}
                              {currentUserRole === 'admin' && (
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(area.id)}>
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
              {totalPages > 1 && (
                <div className="sticky bottom-0 border-t bg-background px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
                      {Math.min(currentPage * itemsPerPage, filteredAreas.length)} de {filteredAreas.length} áreas
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
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

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, areaId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar área protegida?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el área protegida y toda su información
              asociada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="text-destructive-foreground bg-destructive">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
