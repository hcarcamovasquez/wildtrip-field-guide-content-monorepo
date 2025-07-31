import { useUser } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import GalleryExplorer from '@/components/manage/GalleryExplorer'
import { apiClient } from '@/lib/api/client'

export function GalleryPage() {
  const { user } = useUser()
  const [searchParams] = useSearchParams()
  const currentUserId = Number(user?.publicMetadata?.userId) || 0
  
  // Get folder ID from URL params
  const folderId = searchParams.get('folder') ? parseInt(searchParams.get('folder')!, 10) : null
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1

  // Fetch directory contents based on URL params
  const { data: browseData, isLoading } = useQuery({
    queryKey: ['gallery', 'browse', { folderId, page }],
    queryFn: () => apiClient.gallery.browse({ folderId, page, limit: 20 }),
  })

  // Fetch breadcrumb if we're in a folder
  const { data: breadcrumbData } = useQuery({
    queryKey: ['gallery', 'breadcrumb', folderId],
    queryFn: async () => {
      if (!folderId) return []
      
      const breadcrumb = []
      let currentId = folderId
      
      while (currentId) {
        const folder = await apiClient.gallery.getFolder(currentId)
        breadcrumb.unshift(folder)
        currentId = folder.parentId
      }
      
      return breadcrumb
    },
    enabled: !!folderId,
  })

  const currentFolder = folderId && breadcrumbData ? breadcrumbData[breadcrumbData.length - 1] : null

  const initialData = {
    currentFolder,
    breadcrumb: breadcrumbData || [],
    items: browseData?.data || [],
    stats: browseData?.stats || {
      totalFiles: 0,
      totalFolders: 0,
    },
    pagination: browseData?.pagination || {
      page,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    currentUser: {
      id: String(currentUserId),
      name: user?.fullName || user?.username || 'Unknown',
      role: user?.publicMetadata?.role as string || 'user'
    },
    isLoading
  }

  return (
    <GalleryExplorer initialData={initialData} />
  )
}