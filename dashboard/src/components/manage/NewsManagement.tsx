import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NewsTable from './NewsTable'
import PreviewModal from './PreviewModal'

interface NewsManagementProps {
  currentUserId: number
  canDelete?: boolean
}

export default function NewsManagement({ currentUserId, canDelete }: NewsManagementProps) {
  const navigate = useNavigate()
  const [previewData, setPreviewData] = useState<{ url: string; publicUrl?: string; title: string } | null>(null)

  const handleEdit = (id: number) => {
    navigate(`/news/${id}/edit`)
  }

  const handlePreview = (id: number, slug: string, status?: string, hasDraft?: boolean) => {
    setPreviewData({
      url: `${import.meta.env.VITE_WEB_URL}/content/news/preview/${id}`,
      publicUrl: status === 'published' && !hasDraft ? `${import.meta.env.VITE_WEB_URL}/content/news/${slug}` : undefined,
      title: 'Vista previa de noticia',
    })
  }

  return (
    <>
      <NewsTable onEdit={handleEdit} onPreview={handlePreview} currentUserId={currentUserId} canDelete={canDelete} />
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
