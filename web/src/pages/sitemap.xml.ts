import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ redirect }) => {
  const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000'
  
  // Redirect to the backend sitemap
  return redirect(`${apiUrl}/sitemap.xml`, 301)
}