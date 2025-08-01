import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useUser } from '@clerk/clerk-react'
import { apiClient } from '@/lib/api/client'
import NewsForm from '@/components/manage/NewsForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'

export function NewsEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useUser()
  
  const isNew = searchParams.get('new') === 'true'
  const currentUserId = Number(user?.publicMetadata?.userId) || 0

  const { data: news, isLoading, error } = useQuery({
    queryKey: ['news', id],
    queryFn: () => apiClient.news.findById(Number(id)),
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

  if (error || !news) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">Error al cargar la noticia</p>
        <Button variant="outline" onClick={() => navigate('/news')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    )
  }

  // Prepare initial data following the Astro pattern
  const initialData = {
    title: news.title,
    slug: news.slug,
    category: news.category,
    author: news.author || '',
    summary: news.summary || '',
    content: { blocks: news.content?.blocks || [], version: news.content?.version || '1.0' },
    status: news.status || 'draft',
    mainImage: news.mainImage || null,
    // Draft and lock fields
    hasDraft: news.hasDraft,
    draftData: news.draftData,
    draftCreatedAt: news.draftCreatedAt,
    lockedBy: news.lockedBy || undefined,
    lockExpiresAt: news.lockExpiresAt,
    currentUserId: currentUserId,
    lockOwner: news.lockOwner
      ? {
          id: news.lockOwner.id,
          name: news.lockOwner.fullName || news.lockOwner.username || news.lockOwner.email,
        }
      : undefined,
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-20">
        <div className="mb-8 border-b pb-6">
          <h1 className="text-3xl font-bold">
            {news?.content?.blocks?.length && news.content.blocks.length > 0 ? 'Editar' : 'Completar'} Noticia
          </h1>
          <p className="mt-2 text-muted-foreground">{news?.title}</p>
        </div>

        <NewsForm 
          initialData={initialData} 
          isEditing={true} 
          newsId={Number(id)}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  )
}