import { useAuth } from '@clerk/clerk-react'
import GalleryExplorer from '@/components/manage/GalleryExplorer'

export function GalleryPage() {
  const { user } = useAuth()
  const currentUserId = Number(user?.publicMetadata?.userId) || 0

  return (
    <div className="h-full">
      <GalleryExplorer 
        currentUserId={currentUserId}
        onFileSelect={() => {}} 
      />
    </div>
  )
}