import type { APIRoute } from 'astro'

import { ManageProtectedAreaRepository } from '../../../../lib/private/repositories/ManageProtectedAreaRepository'
import { canManageAreas, type Role } from '../../../../lib/utils/permissions'

export const GET: APIRoute = async ({ url, locals }) => {
  const user = locals.user
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!canManageAreas(user.role as Role)) {
    return new Response(JSON.stringify({ error: 'Sin permisos' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '10')
  const search = url.searchParams.get('search') || undefined
  const type = url.searchParams.get('type') || undefined
  const status = url.searchParams.get('status') || undefined
  const region = url.searchParams.get('region') || undefined

  try {
    const result = await ManageProtectedAreaRepository.findAll({
      page,
      limit,
      search,
      type,
      status,
      region,
    })

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching protected areas:', error)
    return new Response(JSON.stringify({ error: 'Error al obtener áreas protegidas' }), {
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

  if (!canManageAreas(user.role as Role)) {
    return new Response(JSON.stringify({ error: 'Sin permisos' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const data = await request.json()

    if (!data.name || !data.slug || !data.type) {
      return new Response(JSON.stringify({ error: 'Datos incompletos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const newArea = await ManageProtectedAreaRepository.create({
      name: data.name,
      slug: data.slug,
      type: data.type,
      description: data.description,
      userId: user.id,
    })

    return new Response(JSON.stringify(newArea), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating protected area:', error)
    return new Response(JSON.stringify({ error: 'Error al crear área protegida' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
