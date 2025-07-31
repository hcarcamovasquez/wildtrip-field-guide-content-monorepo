import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useUser } from '@clerk/clerk-react'
import { apiClient } from '@/lib/api/client'
import SpeciesForm from '@/components/manage/SpeciesForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'

export function SpeciesEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useUser()
  
  const isNewFromModal = searchParams.get('new') === 'true'
  const currentUserId = Number(user?.publicMetadata?.userId) || 0

  const { data: species, isLoading, error } = useQuery({
    queryKey: ['species', id],
    queryFn: async () => {
      const data = await apiClient.species.findById(Number(id))
      console.log('Species data received from API:', {
        id: data.id,
        hasDraft: data.hasDraft,
        draftData: data.draftData,
        mainImage: data.mainImage,
        draftMainImage: data.draftData?.mainImage
      })
      return data
    },
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !species) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">Error al cargar la especie</p>
        <Button variant="outline" onClick={() => navigate('/species')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    )
  }

  return (
    <SpeciesForm 
      species={species} 
      currentUserId={currentUserId}
      isEditing={!isNewFromModal}
    />
  )
}