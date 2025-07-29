import type { APIRoute } from 'astro'
import { cloudflareAI } from '../../../../lib/services/cloudflare-ai'

export const POST: APIRoute = async ({ request, locals }) => {
  // Check authentication
  const user = locals.user
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return new Response(JSON.stringify({ error: 'Type and data are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let seoContent

    switch (type) {
      case 'news':
        if (!data.title || !data.content) {
          return new Response(JSON.stringify({ error: 'Title and content are required for news' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        seoContent = await cloudflareAI.generateNewsSEO(
          data.title,
          data.summary || '',
          data.content
        )
        break

      case 'species':
        if (!data.commonName || !data.scientificName) {
          return new Response(JSON.stringify({ error: 'Common name and scientific name are required for species' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        seoContent = await cloudflareAI.generateSpeciesSEO(
          data.commonName,
          data.scientificName,
          data.description || '',
          data.habitat,
          data.conservationStatus
        )
        break

      case 'protected-area':
        if (!data.name || !data.type) {
          return new Response(JSON.stringify({ error: 'Name and type are required for protected areas' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        seoContent = await cloudflareAI.generateProtectedAreaSEO(
          data.name,
          data.type,
          data.description || '',
          data.region,
          data.keyFeatures
        )
        break

      default:
        return new Response(JSON.stringify({ error: 'Invalid type. Must be news, species, or protected-area' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
    }

    return new Response(JSON.stringify({ success: true, seo: seoContent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error generating SEO:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate SEO content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}