import { Routes, Route } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import NewsManagement from '@/components/manage/NewsManagement'
import { NewsEditPage } from './edit'

function NewsListPage() {
  const { user } = useUser()
  const canDelete = user?.publicMetadata?.role === 'admin'
  const currentUserId = Number(user?.publicMetadata?.userId) || 0

  return (
    <div>
      <NewsManagement canDelete={canDelete} currentUserId={currentUserId} />
    </div>
  )
}

export function NewsPage() {
  return (
    <Routes>
      <Route index element={<NewsListPage />} />
      <Route path=":id/edit" element={<NewsEditPage />} />
    </Routes>
  )
}