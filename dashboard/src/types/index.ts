// Type definitions for dashboard components
// These extend the base types from @wildtrip/shared

import type { RichContent } from '@wildtrip/shared/types'

// Base interfaces
export interface BaseContent {
  id: number
  status: 'draft' | 'published' | 'archived'
  slug: string
  createdAt: Date | string
  updatedAt: Date | string
  publishedAt?: Date | string | null
  createdBy?: number | null
  updatedBy?: number | null
}

// Species interfaces
export interface SpeciesWithBase {
  id: number
  status: string
  slug: string
  scientificName: string
  commonName: string
  family?: string | null
  order?: string | null
  class?: string | null
  phylum?: string | null
  kingdom?: string | null
  mainGroup?: string | null
  specificCategory?: string | null
  description?: string | null
  habitat?: string | null
  distribution?: any
  conservationStatus?: string | null
  hasDetailedContent?: boolean | null
  detailedDescription?: RichContent | null
  ecology?: RichContent | null
  reproduction?: RichContent | null
  behavior?: RichContent | null
  conservation?: RichContent | null
  additionalInfo?: RichContent | null
  similarSpecies?: any[] | null
  endemicToChile?: boolean | null
  isNative?: boolean | null
  featuredImage?: string | null
  featuredImageAlt?: string | null
  gallery?: any[] | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  publishedAt?: Date | string | null
  localChanges?: boolean | null
  featuredImageUrl?: string | null
}

// News interfaces
export interface NewsWithBase extends BaseContent {
  title: string
  summary: string
  content?: RichContent | null
  featuredImage?: string | null
  featuredImageAlt?: string | null
  featuredImageUrl?: string | null
  author?: string | null
  tags?: string[] | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  isDraft?: boolean
  isPublished?: boolean
  hasLocalChanges?: boolean
  draftTitle?: string | null
  draftSummary?: string | null
  draftContent?: RichContent | null
  draftFeaturedImage?: string | null
  draftFeaturedImageAlt?: string | null
  draftAuthor?: string | null
  draftTags?: string[] | null
  draftSeoTitle?: string | null
  draftSeoDescription?: string | null
  draftSeoKeywords?: string | null
}

// Protected Area interfaces
export interface ProtectedAreaWithBase extends BaseContent {
  name: string
  description: string
  content?: RichContent | null
  featuredImage?: string | null
  featuredImageAlt?: string | null
  featuredImageUrl?: string | null
  type: string
  location?: string | null
  region?: string | null
  surface?: string | null
  creationYear?: number | null
  adminEntity?: string | null
  visitorInfo?: RichContent | null
  howToGet?: RichContent | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  isDraft?: boolean
  isPublished?: boolean
  hasLocalChanges?: boolean
  draftName?: string | null
  draftDescription?: string | null
  draftContent?: RichContent | null
  draftFeaturedImage?: string | null
  draftFeaturedImageAlt?: string | null
  draftType?: string | null
  draftLocation?: string | null
  draftRegion?: string | null
  draftSurface?: string | null
  draftCreationYear?: number | null
  draftAdminEntity?: string | null
  draftVisitorInfo?: RichContent | null
  draftHowToGet?: RichContent | null
  draftSeoTitle?: string | null
  draftSeoDescription?: string | null
  draftSeoKeywords?: string | null
}

// User interfaces
export interface User {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  username?: string | null
  imageUrl?: string | null
  role: string
  clerkId: string
  createdAt: Date | string
  updatedAt: Date | string
  fullName?: string
}

export interface UserWithRole extends User {
  role: 'admin' | 'content_editor' | 'news_editor' | 'areas_editor' | 'species_editor' | 'user'
}

export interface SpeciesWithDetails extends SpeciesWithBase {
  // Add any additional detail fields if needed
}

// Media interfaces
export interface MediaFile {
  id: number
  filename: string
  originalName: string
  mimeType: string
  size: number
  width?: number | null
  height?: number | null
  url: string
  thumbnailUrl?: string | null
  folderId?: number | null
  tags?: string[] | null
  metadata?: any
  source?: string | null
  sourceId?: number | null
  uploadedBy?: number | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface MediaFolder {
  id: number
  name: string
  parentId?: number | null
  path: string
  createdBy?: number | null
  createdAt: Date | string
  updatedAt: Date | string
}

// Lock interfaces
export interface Lock {
  entityType: string
  entityId: number
  userId: string
  userName?: string | null
  userEmail?: string | null
  expiresAt: Date | string
  createdAt: Date | string
}

// Pagination interfaces
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  orderBy?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}