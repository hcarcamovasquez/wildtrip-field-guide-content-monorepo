import type { APIRoute } from 'astro'

import { ManageNewsRepository } from '../../../../lib/private/repositories/ManageNewsRepository'
import { canManageNews, type Role } from '../../../../lib/utils/permissions'

export const GET: APIRoute = async ({ locals, url }) => {
  const user = locals.user
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!canManageNews(user.role as Role)) {
    return new Response(JSON.stringify({ error: 'Acceso denegado' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const search = url.searchParams.get('search') || ''
  const status = url.searchParams.get('status') || ''
  const category = url.searchParams.get('category') || ''

  try {
    const result = await ManageNewsRepository.findAll({
      page,
      limit,
      search,
      status,
      category,
    })

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    return new Response(JSON.stringify({ error: 'Error al obtener noticias' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!canManageNews(user.role as Role)) {
    return new Response(JSON.stringify({ error: 'Acceso denegado' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const data = await request.json()

    const news = await ManageNewsRepository.create({
      title: data.title,
      slug: data.slug,
      category: data.category,
      author: data.author || user.fullName || user.email,
      summary: data.summary,
      content: data.content || { blocks: [], version: '1.0' },
      status: data.status || 'draft',
      tags: data.tags || [],
      mainImage: data.mainImage || null,
    })

    return new Response(JSON.stringify(news), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating news:', error)
    return new Response(JSON.stringify({ error: 'Error al crear noticia' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
