import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useState } from 'react'
import SpeciesTable from '@/components/manage/SpeciesTable'
import { useAuth } from '@clerk/clerk-react'

export function SpeciesPage() {
  const { user } = useAuth()
  const canDelete = user?.publicMetadata?.role === 'admin'

  return (
    <div>
      <SpeciesTable canDelete={canDelete} />
    </div>
  )
}

