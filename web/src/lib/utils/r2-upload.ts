import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Initialize R2 client
const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${import.meta.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: import.meta.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.R2_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = import.meta.env.R2_BUCKET_NAME || ''
const PUBLIC_URL = import.meta.env.PUBLIC_R2_PUBLIC_URL || ''

// Legacy interface - kept for backward compatibility
export interface UploadedImageUrls {
  original: string
  thumb48: string
  thumb96: string
  small320: string
  medium640: string
  hero1280: string
  full1600: string
  [key: string]: string
}

/**
 * Generate a unique directory for storing all image variants
 */
export function generateImageDirectory(entityType: string, entityId: string): string {
  return `images/${entityType}/${entityId}`
}

// Deprecated - variants are now generated on-the-fly by Cloudflare

/**
 * Upload a single file to R2 and return the public URL
 */
export async function uploadToR2(file: File, key: string): Promise<string> {
  const buffer = await file.arrayBuffer()

  // Determine content type based on file extension
  let contentType = 'image/webp'
  if (key.endsWith('.avif')) {
    contentType = 'image/avif'
  } else if (key.endsWith('.jpg') || key.endsWith('.jpeg')) {
    contentType = 'image/jpeg'
  } else if (key.endsWith('.png')) {
    contentType = 'image/png'
  } else if (key.endsWith('.gif')) {
    contentType = 'image/gif'
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: new Uint8Array(buffer),
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000', // 1 year cache
  })

  await R2.send(command)

  return `${PUBLIC_URL}/${key}`
}

// Deprecated - only single images are stored now

/**
 * Delete a single file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await R2.send(command)
}

// Legacy function for backward compatibility
export function generateImageKey(_filename: string, prefix: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  return `${prefix}/${timestamp}-${randomString}.avif`
}
