// API client for public endpoints
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000'

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

class APIClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options
    
    let url = `${this.baseURL}${endpoint}`
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value))
      })
      url += `?${searchParams.toString()}`
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Species endpoints
  species = {
    findAll: (params?: any) => 
      this.request<any>('/api/species', { params }),
    findBySlug: (slug: string) => 
      this.request<any>(`/api/species/slug/${slug}`),
    findById: (id: number) => 
      this.request<any>(`/api/species/${id}`),
  }

  // Protected Areas endpoints
  protectedAreas = {
    findAll: (params?: any) => 
      this.request<any>('/api/protected-areas', { params }),
    findBySlug: (slug: string) => 
      this.request<any>(`/api/protected-areas/slug/${slug}`),
    findById: (id: number) => 
      this.request<any>(`/api/protected-areas/${id}`),
  }

  // News endpoints
  news = {
    findAll: (params?: any) => 
      this.request<any>('/api/news', { params }),
    findBySlug: (slug: string) => 
      this.request<any>(`/api/news/slug/${slug}`),
    findById: (id: number) => 
      this.request<any>(`/api/news/${id}`),
  }
}

export const apiClient = new APIClient(API_URL)