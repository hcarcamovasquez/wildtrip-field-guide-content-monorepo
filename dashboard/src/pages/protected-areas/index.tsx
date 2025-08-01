import { Routes, Route } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import ProtectedAreaManagement from '@/components/manage/ProtectedAreaManagement'
import { ProtectedAreaEditPage } from './edit'

function ProtectedAreasListPage() {
  const { user } = useUser()
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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ProtectedAreaManagement 
        initialAreas={areas?.data || areas || []} 
        currentUserRole={currentUserRole as any} 
        currentUserId={currentUserId}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}

export function ProtectedAreasPage() {
  return (
    <Routes>
      <Route index element={<ProtectedAreasListPage />} />
      <Route path=":id/edit" element={<ProtectedAreaEditPage />} />
    </Routes>
  )
}