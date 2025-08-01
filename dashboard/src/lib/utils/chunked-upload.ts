import { apiClient } from '@/lib/api/client'

export interface ChunkedUploadOptions {
  file: File
  chunkSize?: number
  folderId?: number | null
  title?: string
  description?: string
  altText?: string
  tags?: string[]
  onProgress?: (progress: number) => void
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void
}

export interface ChunkedUploadResult {
  success: boolean
  media?: any
  error?: string
}

export async function uploadFileInChunks(options: ChunkedUploadOptions): Promise<ChunkedUploadResult> {
  const {
    file,
    chunkSize = 1024 * 1024, // 1MB chunks by default
    folderId = null,
    title,
    description,
    altText,
    tags,
    onProgress,
    onChunkComplete,
  } = options

  // Generate unique upload ID
  const uploadId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const totalChunks = Math.ceil(file.size / chunkSize)

  // If file is small, use regular upload
  if (file.size < chunkSize * 2) {
    try {
      const media = await apiClient.gallery.upload(file, { folderId, title, description, altText, tags })
      return { success: true, media }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' }
    }
  }

  console.log(`Starting chunked upload: ${file.name} (${file.size} bytes, ${totalChunks} chunks)`)

  try {
    // Upload chunks sequentially for reliability
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks} (${chunk.size} bytes)`)

      const chunkData = {
        uploadId,
        chunkIndex,
        totalChunks,
        filename: file.name,
      }

      await apiClient.gallery.uploadChunk(chunk, chunkData)

      // Update progress
      const progress = ((chunkIndex + 1) / totalChunks) * 90 // Reserve 10% for final processing
      onProgress?.(progress)
      onChunkComplete?.(chunkIndex, totalChunks)
    }

    console.log('All chunks uploaded, completing upload...')

    // Complete the upload
    const completeData = {
      uploadId,
      totalChunks,
      filename: file.name,
      folderId,
      title,
      description,
      altText,
      tags: tags ? JSON.stringify(tags) : undefined,
    }

    const media = await apiClient.gallery.completeUpload(completeData)

    // Final progress
    onProgress?.(100)

    console.log('Chunked upload completed successfully')
    return { success: true, media }

  } catch (error) {
    console.error('Chunked upload failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Chunked upload failed' }
  }
}

/**
 * Determine if a file should use chunked upload based on size
 */
export function shouldUseChunkedUpload(file: File, threshold = 5 * 1024 * 1024): boolean {
  return file.size > threshold // Default: 5MB
}

/**
 * Format progress for display
 */
export function formatUploadProgress(progress: number, file: File): string {
  const percentage = Math.round(progress)
  const uploaded = Math.round((file.size * progress) / 100)
  const total = file.size

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return `${percentage}% (${formatBytes(uploaded)} / ${formatBytes(total)})`
}