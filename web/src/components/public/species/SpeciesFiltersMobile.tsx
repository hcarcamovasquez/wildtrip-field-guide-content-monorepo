import { useState } from 'react'
import { Filter, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { CONSERVATION_STATUSES, getConservationStatusLabel } from '@wildtrip/shared/constants'
import { MAIN_GROUPS, getMainGroupLabel } from '@wildtrip/shared/constants'

interface SpeciesFiltersMobileProps {
  initialSearch?: string
  initialStatus?: string
  initialGroup?: string
}

export function SpeciesFiltersMobile({
  initialSearch = '',
  initialStatus = 'all',
  initialGroup = 'all',
}: SpeciesFiltersMobileProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(initialSearch)
  const [status, setStatus] = useState(initialStatus)
  const [group, setGroup] = useState(initialGroup)

  const hasActiveFilters = search || (status && status !== 'all') || (group && group !== 'all')
  const activeFilterCount = (search ? 1 : 0) + (status && status !== 'all' ? 1 : 0) + (group && group !== 'all' ? 1 : 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    form.submit()
    setOpen(false)
  }

  const handleClear = () => {
    setSearch('')
    setStatus('all')
    setGroup('all')
  }

  const getStatusLabel = (value: string) => {
    return value === 'all' ? 'Todos los estados' : getConservationStatusLabel(value)
  }

  const getGroupLabel = (value: string) => {
    return value === 'all' ? 'Todos los grupos' : getMainGroupLabel(value)
  }

  return (
    <>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-4 rounded-lg bg-gray-50 p-4 lg:hidden dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtros activos:</span>
            <a href="/content/species" className="text-sm font-medium text-gray-600 underline dark:text-gray-400">
              Limpiar
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            {search && (
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
              >
                Búsqueda: "{search}"
              </Badge>
            )}
            {status && status !== 'all' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {getStatusLabel(status)}
              </Badge>
            )}
            {group && group !== 'all' && (
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
              >
                {getGroupLabel(group)}
              </Badge>
            )}
          </div>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="fixed right-4 bottom-20 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-xl transition-all duration-200 hover:from-emerald-600 hover:to-cyan-600 hover:shadow-2xl active:scale-95 lg:hidden"
            style={{
              boxShadow: '0 4px 24px -2px rgba(16, 185, 129, 0.4), 0 8px 40px -4px rgba(6, 182, 212, 0.3)',
            }}
          >
            <Filter className="h-5 w-5" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-red-500 text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
            {/* Ripple effect for mobile feel */}
            <span className="absolute inset-0 rounded-full bg-white opacity-0 transition-opacity duration-300 active:opacity-20" />
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-[28px] px-0">
          {/* Handle bar */}
          <div className="mx-auto mb-6 h-1.5 w-16 rounded-full bg-gray-300 dark:bg-gray-600" />

          <div className="px-6">
            <SheetHeader className="text-left">
              <SheetTitle className="text-2xl font-bold">Filtros</SheetTitle>
              <SheetDescription className="text-base text-gray-600 dark:text-gray-400">
                Encuentra las especies que buscas
              </SheetDescription>
            </SheetHeader>
          </div>

          <form method="get" onSubmit={handleSubmit} className="mt-8">
            <div className="space-y-6 px-6 pb-6">
              {/* Search Input */}
              <div className="space-y-3">
                <Label
                  htmlFor="mobile-search"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  <Search className="h-4 w-4" />
                  Buscar especies
                </Label>
                <div className="relative">
                  <Input
                    id="mobile-search"
                    type="text"
                    name="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nombre, nombre científico..."
                    className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 pr-12 text-base placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:placeholder:text-gray-500 dark:focus:border-emerald-400 dark:focus:bg-gray-800"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute top-1/2 right-4 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Conservation Status */}
              <div className="space-y-3">
                <Label htmlFor="mobile-status" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  🛡️ Estado de conservación
                </Label>
                <Select name="status" value={status} onValueChange={setStatus}>
                  <SelectTrigger
                    id="mobile-status"
                    className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 text-base focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:focus:border-emerald-400 dark:focus:bg-gray-800"
                  >
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all" className="text-base">
                      Todos los estados
                    </SelectItem>
                    {CONSERVATION_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value} className="text-base">
                        {status.emoji} {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Main Group */}
              <div className="space-y-3">
                <Label htmlFor="mobile-group" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  🌿 Grupo principal
                </Label>
                <Select name="group" value={group} onValueChange={setGroup}>
                  <SelectTrigger
                    id="mobile-group"
                    className="h-14 w-full rounded-2xl border-gray-200 bg-gray-50/50 text-base focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:focus:border-emerald-400 dark:focus:bg-gray-800"
                  >
                    <SelectValue placeholder="Seleccionar grupo" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all" className="text-base">
                      Todos los grupos
                    </SelectItem>
                    {MAIN_GROUPS.map((group) => (
                      <SelectItem key={group.value} value={group.value} className="text-base">
                        {group.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-950">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleClear()
                    setOpen(false)
                  }}
                  className="h-14 flex-1 rounded-2xl border-2 text-base font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="h-14 flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-base font-semibold text-white shadow-lg hover:from-emerald-600 hover:to-cyan-600 hover:shadow-xl"
                >
                  Aplicar filtros
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
