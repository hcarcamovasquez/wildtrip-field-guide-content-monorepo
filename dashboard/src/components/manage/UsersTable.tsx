import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  User2,
  Shield,
  Edit3,
  UserCog,
  Newspaper,
  Mountain,
  Bird,
  HardDrive,
  MoreVertical,
  Loader2,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { UserWithRole } from '@/types'
import { roleLabels, type Role } from '@/lib/utils/permissions'

interface UsersTableProps {
  users: UserWithRole[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  currentUserId: number
  searchParams: {
    search?: string
    role?: string
    page?: number
  }
  baseUrl: string
  isLoading?: boolean
  error?: string | null
}

const getRoleVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (role) {
    case 'admin':
      return 'destructive'
    case 'content_editor':
      return 'default'
    case 'news_editor':
      return 'secondary'
    case 'areas_editor':
      return 'outline'
    case 'species_editor':
      return 'outline'
    case 'user':
      return 'secondary'
    default:
      return 'outline'
  }
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return <Shield className="mr-1 h-3 w-3" />
    case 'content_editor':
      return <Edit3 className="mr-1 h-3 w-3" />
    case 'news_editor':
      return <Newspaper className="mr-1 h-3 w-3" />
    case 'areas_editor':
      return <Mountain className="mr-1 h-3 w-3" />
    case 'species_editor':
      return <Bird className="mr-1 h-3 w-3" />
    default:
      return <User2 className="mr-1 h-3 w-3" />
  }
}

export default function UsersTable({ users, pagination, currentUserId, searchParams, baseUrl, isLoading, error }: UsersTableProps) {
  const navigate = useNavigate()
  const [roleChangeModal, setRoleChangeModal] = useState<{ open: boolean; user: UserWithRole | null }>({
    open: false,
    user: null,
  })
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [search, setSearch] = useState(searchParams.search || '')
  const [roleFilter, setRoleFilter] = useState(searchParams.role || 'all')

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Nunca'
    return new Date(date).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const buildUrl = (params: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.set(key, String(value))
      }
    })
    return baseUrl + (searchParams.toString() ? `?${searchParams.toString()}` : '')
  }

  const handleSearch = () => {
    const params: Record<string, string | undefined> = { page: '1' }
    if (search) params.search = search
    if (roleFilter !== 'all') params.role = roleFilter
    navigate(buildUrl(params))
  }

  const openRoleModal = (user: UserWithRole) => {
    setRoleChangeModal({ open: true, user })
    setSelectedRole(user.role)
  }

  const closeRoleModal = () => {
    setRoleChangeModal({ open: false, user: null })
    setSelectedRole('')
    setIsUpdating(false)
  }

  const handleRoleChange = async () => {
    if (!roleChangeModal.user || !selectedRole) return

    setIsUpdating(true)
    try {
      await apiClient.users.update(roleChangeModal.user.id, { role: selectedRole })
      // Refresh the current page to show changes
      navigate(0)
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Error al actualizar el rol del usuario. Por favor, intenta nuevamente.')
      setIsUpdating(false)
    }
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
                  <h1 className="text-2xl font-bold">Usuarios</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HardDrive className="h-4 w-4" />
                    <span>{pagination.total} usuarios</span>
                  </div>
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
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Buscar usuarios..."
                      className="pl-9"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="content_editor">Editor de Contenido</SelectItem>
                      <SelectItem value="news_editor">Editor de Noticias</SelectItem>
                      <SelectItem value="areas_editor">Editor de Áreas</SelectItem>
                      <SelectItem value="species_editor">Editor de Especies</SelectItem>
                      <SelectItem value="user">Usuario</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSearch} size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                  {(searchParams.search || searchParams.role) && (
                    <Button variant="outline" onClick={() => navigate(baseUrl)}>
                      Limpiar
                    </Button>
                  )}
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
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Usuario</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Email</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Rol</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Estado</th>
                    <th className="bg-background px-6 py-3 pr-4 font-medium">Última actividad</th>
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
                            <p className="text-muted-foreground">Cargando usuarios...</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-destructive">
                        {error}
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="px-6 py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.fullName || user.email}
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <User2 className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{user.fullName || user.username || 'Sin nombre'}</div>
                              {user.username && <div className="text-sm text-muted-foreground">@{user.username}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 pr-4 text-muted-foreground">{user.email}</td>
                        <td className="px-6 py-3 pr-4">
                          <Badge variant={getRoleVariant(user.role)}>
                            {getRoleIcon(user.role)}
                            {roleLabels[user.role as Role]}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 pr-4">
                          <Badge variant={user.isActive ? 'outline' : 'secondary'}>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 pr-4 text-muted-foreground">{formatDate(user.lastSeenAt)}</td>
                        <td className="px-6 py-3">
                          {user.id !== String(currentUserId) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openRoleModal(user)}>
                                  <UserCog className="mr-2 h-4 w-4" />
                                  Cambiar rol
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
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
                      {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuarios
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        disabled={pagination.page === 1}
                        onClick={() => navigate(buildUrl({ ...searchParams, page: 1 }))}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        disabled={pagination.page === 1}
                        onClick={() => navigate(buildUrl({ ...searchParams, page: pagination.page - 1 }))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Página {pagination.page} de {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => navigate(buildUrl({ ...searchParams, page: pagination.page + 1 }))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => navigate(buildUrl({ ...searchParams, page: pagination.totalPages }))}
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

      <Dialog open={roleChangeModal.open} onOpenChange={(open) => !open && closeRoleModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
            <DialogDescription>
              Cambiando el rol de <strong>{roleChangeModal.user?.fullName || roleChangeModal.user?.email}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <RadioGroup value={selectedRole} onValueChange={setSelectedRole}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="flex flex-1 cursor-pointer items-center">
                    <Shield className="mr-2 h-4 w-4 text-destructive" />
                    <div>
                      <div className="font-medium">Administrador</div>
                      <div className="text-sm text-muted-foreground">Acceso completo al sistema</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent">
                  <RadioGroupItem value="content_editor" id="content_editor" />
                  <Label htmlFor="content_editor" className="flex flex-1 cursor-pointer items-center">
                    <Edit3 className="mr-2 h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">Editor de Contenido</div>
                      <div className="text-sm text-muted-foreground">Puede gestionar noticias, especies y áreas</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent">
                  <RadioGroupItem value="news_editor" id="news_editor" />
                  <Label htmlFor="news_editor" className="flex flex-1 cursor-pointer items-center">
                    <Newspaper className="mr-2 h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">Editor de Noticias</div>
                      <div className="text-sm text-muted-foreground">Solo puede gestionar noticias</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent">
                  <RadioGroupItem value="areas_editor" id="areas_editor" />
                  <Label htmlFor="areas_editor" className="flex flex-1 cursor-pointer items-center">
                    <Mountain className="mr-2 h-4 w-4 text-orange-600" />
                    <div>
                      <div className="font-medium">Editor de Áreas</div>
                      <div className="text-sm text-muted-foreground">Solo puede gestionar áreas protegidas</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent">
                  <RadioGroupItem value="species_editor" id="species_editor" />
                  <Label htmlFor="species_editor" className="flex flex-1 cursor-pointer items-center">
                    <Bird className="mr-2 h-4 w-4 text-purple-600" />
                    <div>
                      <div className="font-medium">Editor de Especies</div>
                      <div className="text-sm text-muted-foreground">Solo puede gestionar especies</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user" className="flex flex-1 cursor-pointer items-center">
                    <User2 className="mr-2 h-4 w-4 text-gray-600" />
                    <div>
                      <div className="font-medium">Usuario</div>
                      <div className="text-sm text-muted-foreground">Sin permisos de administración</div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeRoleModal} disabled={isUpdating}>
              Cancelar
            </Button>
            <Button onClick={handleRoleChange} disabled={isUpdating || selectedRole === roleChangeModal.user?.role}>
              {isUpdating ? 'Actualizando...' : 'Cambiar Rol'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
