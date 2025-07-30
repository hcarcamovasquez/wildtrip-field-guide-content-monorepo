import { Routes, Route } from 'react-router-dom'
import SpeciesTable from '@/components/manage/SpeciesTable'
import { SpeciesEditPage } from './edit'
import { useUser } from '@clerk/clerk-react'

export function SpeciesPage() {
  const { user } = useUser()
  const canDelete = user?.publicMetadata?.role === 'admin'

  return (
    <Routes>
      <Route index element={<SpeciesTable canDelete={canDelete} />} />
      <Route path=":id/edit" element={<SpeciesEditPage />} />
    </Routes>
  )
}

