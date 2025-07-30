import { useUser } from '@clerk/clerk-react'
import GalleryExplorer from '@/components/manage/GalleryExplorer'

export function GalleryPage() {
  const { user } = useUser()
  const currentUserId = Number(user?.publicMetadata?.userId) || 0

  // TODO: Fetch initial data from API
  const initialData = {
    currentFolder: null,
    breadcrumb: [],
    folders: [],
    media: [],
    stats: {
      totalSize: 0,
      totalFiles: 0,
      totalFolders: 0,
      byType: []
    },
    currentUser: {
      id: String(currentUserId),
      name: user?.fullName || user?.username || 'Unknown',
      role: user?.publicMetadata?.role as string || 'user'
    }
  }

  return (
    <div className="h-full">
      <GalleryExplorer initialData={initialData} />
    </div>
  )
}