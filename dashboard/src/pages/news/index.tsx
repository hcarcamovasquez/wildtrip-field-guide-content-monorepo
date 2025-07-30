import { useUser } from '@clerk/clerk-react'
import NewsTable from '@/components/manage/NewsTable'

export function NewsPage() {
  const { user } = useUser()
  const canDelete = user?.publicMetadata?.role === 'admin'
  const currentUserId = Number(user?.publicMetadata?.userId) || 0

  return (
    <div>
      <NewsTable canDelete={canDelete} currentUserId={currentUserId} />
    </div>
  )
}