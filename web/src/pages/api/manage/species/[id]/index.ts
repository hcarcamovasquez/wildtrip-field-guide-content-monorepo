import type { APIRoute } from 'astro'

import { ManageSpeciesRepository } from '../../../../../lib/private/repositories/ManageSpeciesRepository.ts'
import { canManageSpecies, canDelete, type Role } from '../../../../../lib/utils/permissions.ts'

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!canManageSpecies(user.role as Role)) {
    return new Response(JSON.stringify({ error: 'Sin permisos' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const id = parseInt(params.id as string)
  const data = await request.json()

  try {
    const updated = await ManageSpeciesRepository.update(id, data, user.id)

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error updating species:', error)
    return new Response(JSON.stringify({ error: 'Error al actualizar la especie' }), {
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

  if (!canDelete(user.role as Role)) {
    return new Response(JSON.stringify({ error: 'Solo administradores pueden eliminar especies' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const id = parseInt(params.id as string)

  try {
    await ManageSpeciesRepository.delete(id)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error deleting species:', error)
    return new Response(JSON.stringify({ error: 'Error al eliminar la especie' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
