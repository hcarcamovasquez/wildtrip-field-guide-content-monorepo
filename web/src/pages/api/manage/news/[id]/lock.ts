import type { APIRoute } from 'astro'

import { ManageNewsRepository } from '../../../../../lib/private/repositories/ManageNewsRepository'
import { canManageNews, type Role } from '../../../../../lib/utils/permissions'

export const POST: APIRoute = async ({ params, locals }) => {
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
    const success = await ManageNewsRepository.acquireLock(id, user.id)

    if (!success) {
      return new Response(JSON.stringify({ error: 'No se pudo adquirir el bloqueo' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error acquiring lock:', error)
    return new Response(JSON.stringify({ error: 'Error al adquirir bloqueo' }), {
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

  const id = parseInt(params.id || '')
  if (!id || isNaN(id)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    await ManageNewsRepository.releaseLock(id, user.id)

    return new Response(null, {
      status: 204,
    })
  } catch (error) {
    console.error('Error releasing lock:', error)
    return new Response(JSON.stringify({ error: 'Error al liberar bloqueo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
