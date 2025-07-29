import { useState } from 'react'
import ProtectedAreasTable from './ProtectedAreasTable'
import PreviewModal from './PreviewModal'
import type { ProtectedAreaWithBase } from '@/lib/private/repositories/ManageProtectedAreaRepository'
import type { Role } from '@/lib/utils/permissions'

interface ProtectedAreaManagementProps {
  initialAreas: ProtectedAreaWithBase[]
  currentUserRole: Role
  currentUserId: number
}

export default function ProtectedAreaManagement({
  initialAreas,
  currentUserRole,
  currentUserId,
}: ProtectedAreaManagementProps) {
  const [previewData, setPreviewData] = useState<{ url: string; publicUrl?: string; title: string } | null>(null)

  const handleDelete = async (areaId: number) => {
    try {
      const response = await fetch(`/api/manage/protected-areas/${areaId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error deleting area:', error)
    }
  }

  const handlePreview = (id: number, slug: string, name: string, status?: string, hasDraft?: boolean) => {
    setPreviewData({
      url: `/content/protected-areas/preview/${id}`,
      publicUrl: status === 'published' && !hasDraft ? `/content/protected-areas/${slug}` : undefined,
      title: `Vista previa: ${name}`,
    })
  }

  return (
    <>
      <ProtectedAreasTable
        areas={initialAreas}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
        onDelete={handleDelete}
        onRefresh={() => window.location.reload()}
        onPreview={handlePreview}
      />
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
