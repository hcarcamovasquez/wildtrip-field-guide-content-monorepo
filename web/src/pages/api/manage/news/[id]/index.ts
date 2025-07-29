import type { APIRoute } from 'astro'

import { ManageNewsRepository } from '../../../../../lib/private/repositories/ManageNewsRepository.ts'
import { canDelete, canManageNews, type Role } from '../../../../../lib/utils/permissions.ts'

export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const id = parseInt(params.id || '')
  if (!id || isNaN(id)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const news = await ManageNewsRepository.findById(id)
    if (!news) {
      return new Response(JSON.stringify({ error: 'Noticia no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(news), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    return new Response(JSON.stringify({ error: 'Error al obtener noticia' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const PATCH: APIRoute = async ({ params, request, locals }) => {
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

  const id = parseInt(params.id || '')
  if (!id || isNaN(id)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const data = await request.json()

    // Convert publishedAt string to Date if present
    if (data.publishedAt && typeof data.publishedAt === 'string') {
      data.publishedAt = new Date(data.publishedAt)
    }

    const updatedNews = await ManageNewsRepository.update(id, data)

    return new Response(JSON.stringify(updatedNews), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error updating news:', error)
    return new Response(JSON.stringify({ error: 'Error al actualizar noticia' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = locals.user
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Solo usuarios admin pueden eliminar noticias
  if (!canDelete(user.role as Role)) {
    return new Response(JSON.stringify({ error: 'Solo los administradores pueden eliminar noticias' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const id = parseInt(params.id || '')
  if (!id || isNaN(id)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    await ManageNewsRepository.delete(id)

    return new Response(null, {
      status: 204,
    })
  } catch (error) {
    console.error('Error deleting news:', error)
    return new Response(JSON.stringify({ error: 'Error al eliminar noticia' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
