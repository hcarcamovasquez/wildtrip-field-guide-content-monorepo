import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useUser } from '@clerk/clerk-react'
import { apiClient } from '@/lib/api/client'
import ProtectedAreaForm from '@/components/manage/ProtectedAreaForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'

export function ProtectedAreaEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useUser()
  
  const isNew = searchParams.get('new') === 'true'
  const currentUserId = user?.publicMetadata?.userId?.toString() || ''

  const { data: area, isLoading, error, refetch } = useQuery({
    queryKey: ['protected-area', id],
    queryFn: async () => {
      const result = await apiClient.protectedAreas.findById(Number(id))
      return result
    },
    enabled: !!id,
    retry: isNew ? 3 : 1,
    retryDelay: isNew ? 2000 : 1000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !area) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">Error al cargar el área protegida</p>
        <Button variant="outline" onClick={() => navigate('/protected-areas')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    )
  }

  // Prepare initial data following the Astro pattern
  const initialData = {
    name: area.name,
    slug: area.slug,
    type: area.type || 'other',
    status: area.status || 'draft',
    area: area.area,
    creationYear: area.creationYear,
    description: area.description,
    ecosystems: area.ecosystems,
    region: area.region,
    visitorInformation: area.visitorInformation,
    richContent: area.richContent,
    mainImage: area.mainImage,
    galleryImages: area.galleryImages,
    // Draft and lock fields
    hasDraft: area.hasDraft,
    draftData: area.draftData || {},
    draftCreatedAt: area.draftCreatedAt,
    lockedBy: area.lockedBy?.toString() || undefined,
    lockExpiresAt: area.lockExpiresAt,
    currentUserId: currentUserId,
    lockOwner: area.lockOwner
      ? {
          id: area.lockOwner.id.toString(),
          name: area.lockOwner.fullName || area.lockOwner.username || area.lockOwner.email,
        }
      : undefined,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold">
          {area?.richContent?.blocks?.length && area.richContent.blocks.length > 0 ? 'Editar' : 'Completar'} Área Protegida
        </h1>
        <p className="mt-2 text-muted-foreground">{area?.name}</p>
      </div>

      <ProtectedAreaForm
        initialData={initialData}
        isEditing={true}
        areaId={Number(id)}
        currentUserId={currentUserId}
      />
    </div>
  )
}