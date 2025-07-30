import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from '@/hooks/use-toast'
import ProtectedAreasTable from './ProtectedAreasTable'
import PreviewModal from './PreviewModal'
import type { ProtectedAreaWithBase } from '@/types'
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

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (areaId: number) => apiClient.protectedAreas.delete(areaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protected-areas'] })
      toast({
        title: 'Área protegida eliminada',
        description: 'El área protegida ha sido eliminada exitosamente.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el área protegida.',
        variant: 'destructive',
      })
    },
  })

  const handleDelete = async (areaId: number) => {
    deleteMutation.mutate(areaId)
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
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['protected-areas'] })}
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
