import axios, {type AxiosInstance, type AxiosRequestConfig } from 'axios'

let authErrorHandler: ((error: boolean) => void) | null = null

export function setAuthErrorHandler(handler: (error: boolean) => void) {
  authErrorHandler = handler
}

export class APIClient {
  private instance: AxiosInstance

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Send cookies
    })

    // Request interceptor to add auth token
    this.instance.interceptors.request.use(async (config) => {
      // The auth token will be sent via cookies, so no need to add it manually
      return config
    })

    // Response interceptor to handle errors
    this.instance.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        if (error.response?.status === 401 && authErrorHandler) {
          // Use the auth error handler if available
          authErrorHandler(true)
        }
        
        return Promise.reject(error)
      }
    )
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.request<T>(config)
    return response.data
  }

  // Species endpoints
  species = {
    findAll: (params?: any) => 
      this.request<any>({ method: 'GET', url: '/api/species', params }),
    findById: (id: number) => 
      this.request<any>({ method: 'GET', url: `/api/species/${id}` }),
    create: (data: any) => 
      this.request<any>({ method: 'POST', url: '/api/species', data }),
    update: (id: number, data: any) => 
      this.request<any>({ method: 'PATCH', url: `/api/species/${id}`, data }),
    delete: (id: number) => 
      this.request<void>({ method: 'DELETE', url: `/api/species/${id}` }),
    lock: (id: number) => 
      this.request<any>({ method: 'POST', url: `/api/species/${id}/lock` }),
    unlock: (id: number) => 
      this.request<void>({ method: 'DELETE', url: `/api/species/${id}/lock` }),
    checkLock: (id: number) => 
      this.request<any>({ method: 'GET', url: `/api/species/${id}/lock` }),
  }

  // Protected Areas endpoints
  protectedAreas = {
    findAll: (params?: any) => 
      this.request<any>({ method: 'GET', url: '/api/protected-areas', params }),
    findById: (id: number) => 
      this.request<any>({ method: 'GET', url: `/api/protected-areas/${id}` }),
    create: (data: any) => 
      this.request<any>({ method: 'POST', url: '/api/protected-areas', data }),
    update: (id: number, data: any) => 
      this.request<any>({ method: 'PATCH', url: `/api/protected-areas/${id}`, data }),
    delete: (id: number) => 
      this.request<void>({ method: 'DELETE', url: `/api/protected-areas/${id}` }),
    publish: (id: number) => 
      this.request<any>({ method: 'POST', url: `/api/protected-areas/${id}/publish` }),
    draft: (id: number) => 
      this.request<any>({ method: 'POST', url: `/api/protected-areas/${id}/draft` }),
    discardDraft: (id: number) => 
      this.request<any>({ method: 'POST', url: `/api/protected-areas/${id}/discard-draft` }),
    lock: (id: number) => 
      this.request<any>({ method: 'POST', url: `/api/protected-areas/${id}/lock` }),
    unlock: (id: number) => 
      this.request<void>({ method: 'DELETE', url: `/api/protected-areas/${id}/lock` }),
    checkLock: (id: number) => 
      this.request<any>({ method: 'GET', url: `/api/protected-areas/${id}/lock` }),
  }

  // News endpoints
  news = {
    findAll: (params?: any) => 
      this.request<any>({ method: 'GET', url: '/api/news', params }),
    findById: (id: number) => 
      this.request<any>({ method: 'GET', url: `/api/news/${id}` }),
    create: (data: any) => 
      this.request<any>({ method: 'POST', url: '/api/news', data }),
    update: (id: number, data: any) => 
      this.request<any>({ method: 'PATCH', url: `/api/news/${id}`, data }),
    delete: (id: number) => 
      this.request<void>({ method: 'DELETE', url: `/api/news/${id}` }),
    publish: (id: number) => 
      this.request<any>({ method: 'POST', url: `/api/news/${id}/publish` }),
    draft: (id: number) => 
      this.request<any>({ method: 'POST', url: `/api/news/${id}/draft` }),
    discardDraft: (id: number) => 
      this.request<any>({ method: 'POST', url: `/api/news/${id}/discard-draft` }),
    lock: (id: number) => 
      this.request<any>({ method: 'POST', url: `/api/news/${id}/lock` }),
    unlock: (id: number) => 
      this.request<void>({ method: 'DELETE', url: `/api/news/${id}/lock` }),
    checkLock: (id: number) => 
      this.request<any>({ method: 'GET', url: `/api/news/${id}/lock` }),
  }

  // Gallery endpoints
  gallery = {
    browse: (params?: any) => 
      this.request<any>({ method: 'GET', url: '/api/gallery/browse', params }),
    getByIds: (ids: number[]) => 
      this.request<any>({ method: 'GET', url: '/api/gallery/by-ids', params: { ids: ids.join(',') } }),
    getMedia: (id: number) => 
      this.request<any>({ method: 'GET', url: `/api/gallery/media/${id}` }),
    upload: (file: File, data: any) => {
      const formData = new FormData()
      formData.append('file', file)
      Object.keys(data).forEach(key => {
        formData.append(key, data[key])
      })
      return this.request<any>({ 
        method: 'POST', 
        url: '/api/gallery/upload', 
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    updateMedia: (id: number, data: any) => 
      this.request<any>({ method: 'PATCH', url: `/api/gallery/media/${id}`, data }),
    deleteMedia: (id: number) => 
      this.request<void>({ method: 'DELETE', url: `/api/gallery/media/${id}` }),
    deleteMediaBatch: (ids: number[]) => 
      this.request<void>({ method: 'POST', url: '/api/gallery/media/batch-delete', data: { ids } }),
    moveMedia: (mediaIds: number[], folderId: number | null) => 
      this.request<any>({ method: 'POST', url: '/api/gallery/media/move', data: { mediaIds, folderId } }),
    getFolders: () => 
      this.request<any>({ method: 'GET', url: '/api/gallery/folders' }),
    getFolder: (id: number) => 
      this.request<any>({ method: 'GET', url: `/api/gallery/folders/${id}` }),
    createFolder: (data: any) => 
      this.request<any>({ method: 'POST', url: '/api/gallery/folders', data }),
    updateFolder: (id: number, data: any) => 
      this.request<any>({ method: 'PATCH', url: `/api/gallery/folders/${id}`, data }),
    deleteFolder: (id: number) => 
      this.request<void>({ method: 'DELETE', url: `/api/gallery/folders/${id}` }),
  }

  // Users endpoints
  users = {
    findAll: (params?: any) => 
      this.request<any>({ method: 'GET', url: '/api/users', params }),
    findById: (id: string) => 
      this.request<any>({ method: 'GET', url: `/api/users/${id}` }),
    getMe: () => 
      this.request<any>({ method: 'GET', url: '/api/users/me' }),
    getStats: () => 
      this.request<any>({ method: 'GET', url: '/api/users/stats' }),
    update: (id: string, data: any) => 
      this.request<any>({ method: 'PATCH', url: `/api/users/${id}`, data }),
  }

  // AI endpoints
  ai = {
    generateNewsSEO: (data: { title: string; summary: string; content: string }) =>
      this.request<{ title: string; description: string; keywords: string }>({
        method: 'POST',
        url: '/api/ai/generate-seo/news',
        data,
      }),
    generateSpeciesSEO: (data: {
      commonName: string;
      scientificName: string;
      description: string;
      habitat?: string;
      conservationStatus?: string;
    }) =>
      this.request<{ title: string; description: string; keywords: string }>({
        method: 'POST',
        url: '/api/ai/generate-seo/species',
        data,
      }),
    generateProtectedAreaSEO: (data: {
      name: string;
      type: string;
      description: string;
      region?: string;
      keyFeatures?: string[];
    }) =>
      this.request<{ title: string; description: string; keywords: string }>({
        method: 'POST',
        url: '/api/ai/generate-seo/protected-areas',
        data,
      }),
  }
}

// Create singleton instance
// Always use the full API URL from environment variable
export const apiClient = new APIClient(
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
)

// Hook to use API client with auth
export function useAPIClient() {
  // const { getToken } = useAuth()
  
  // You can add token to requests here if needed
  // But since we're using cookies, it's not necessary
  
  return apiClient
}