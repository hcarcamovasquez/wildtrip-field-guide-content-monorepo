import type { APIRoute } from 'astro'

import { ManageProtectedAreaRepository } from '../../../../../lib/private/repositories/ManageProtectedAreaRepository'
import { canDelete, canManageAreas, type Role } from '../../../../../lib/utils/permissions'

export const GET: APIRoute = async ({ params, locals }) => {
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

  const { id } = params
  if (!id || isNaN(parseInt(id))) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const area = await ManageProtectedAreaRepository.findById(parseInt(id))

    if (!area) {
      return new Response(JSON.stringify({ error: 'Área protegida no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(area), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching protected area:', error)
    return new Response(JSON.stringify({ error: 'Error al obtener área protegida' }), {
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

  if (!canManageAreas(user.role as Role)) {
    return new Response(JSON.stringify({ error: 'Sin permisos' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { id } = params
  if (!id || isNaN(parseInt(id))) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const data = await request.json()

    // Check if this is a draft update
    const isDraft = data.hasDraft !== undefined || data.draftData !== undefined

    if (isDraft) {
      // Update draft
      await ManageProtectedAreaRepository.updateDraft(parseInt(id), data, user.id)

      // Return updated area with draft info
      const updatedArea = await ManageProtectedAreaRepository.findById(parseInt(id))
      return new Response(JSON.stringify(updatedArea), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } else {
      // Regular update
      const updatedArea = await ManageProtectedAreaRepository.update(parseInt(id), {
        ...data,
        userId: user.id,
      })

      return new Response(JSON.stringify(updatedArea), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Error updating protected area:', error)
    return new Response(JSON.stringify({ error: 'Error al actualizar área protegida' }), {
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

  // Only admin can delete
  if (!canDelete(user.role as Role)) {
    return new Response(JSON.stringify({ error: 'Solo administradores pueden eliminar' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { id } = params
  if (!id || isNaN(parseInt(id))) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    await ManageProtectedAreaRepository.delete(parseInt(id))

    return new Response(null, {
      status: 204,
    })
  } catch (error) {
    console.error('Error deleting protected area:', error)
    return new Response(JSON.stringify({ error: 'Error al eliminar área protegida' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
