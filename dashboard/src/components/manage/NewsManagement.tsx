import { useState } from 'react'
import NewsTable from './NewsTable'
import PreviewModal from './PreviewModal'

interface NewsManagementProps {
  currentUserId: number
  canDelete?: boolean
}

export default function NewsManagement({ currentUserId, canDelete }: NewsManagementProps) {
  const [previewData, setPreviewData] = useState<{ url: string; publicUrl?: string; title: string } | null>(null)

  const handleEdit = (id: number) => {
    window.location.href = `/manage/news/${id}/edit`
  }

  const handlePreview = (id: number, slug: string, status?: string, hasDraft?: boolean) => {
    setPreviewData({
      url: `/content/news/preview/${id}`,
      publicUrl: status === 'published' && !hasDraft ? `/content/news/${slug}` : undefined,
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
