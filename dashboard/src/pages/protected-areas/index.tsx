import { useAuth } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import ProtectedAreaManagement from '@/components/manage/ProtectedAreaManagement'
import { Loader2 } from 'lucide-react'

export function ProtectedAreasPage() {
  const { user } = useAuth()
  const currentUserRole = user?.publicMetadata?.role || 'user'
  const currentUserId = Number(user?.publicMetadata?.userId) || 0

  const { data: areas, isLoading, error } = useQuery({
    queryKey: ['protected-areas'],
    queryFn: async () => {
      console.log('Fetching protected areas...')
      const result = await apiClient.protectedAreas.findAll()
      console.log('Protected areas result:', result)
      return result
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">Error al cargar las áreas protegidas</p>
      </div>
    )
  }

  return (
    <div>
      <ProtectedAreaManagement 
        initialAreas={areas?.data || areas || []} 
        currentUserRole={currentUserRole as any} 
        currentUserId={currentUserId} 
      />
    </div>
  )
}