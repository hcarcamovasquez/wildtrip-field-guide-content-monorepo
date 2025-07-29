import type { APIRoute } from 'astro'

import { ManageSpeciesRepository } from '../../../../../lib/private/repositories/ManageSpeciesRepository'
import { canManageSpecies, type Role } from '../../../../../lib/utils/permissions'

export const GET: APIRoute = async ({ params, locals }) => {
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
  const lockStatus = await ManageSpeciesRepository.checkLock(id)

  if (lockStatus.isLocked && lockStatus.lockedBy !== user.id) {
    const species = await ManageSpeciesRepository.findByIdWithDetails(id)
    return new Response(
      JSON.stringify({
        isLocked: true,
        lockedBy: lockStatus.lockedBy,
        lockOwner: species?.lock
          ? {
              id: species.lock.userId,
              name: species.lock.userName,
            }
          : null,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  return new Response(JSON.stringify({ isLocked: false }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const POST: APIRoute = async ({ params, locals }) => {
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
  const acquired = await ManageSpeciesRepository.acquireLock(id, user.id)

  if (!acquired) {
    const species = await ManageSpeciesRepository.findByIdWithDetails(id)
    return new Response(
      JSON.stringify({
        error: 'El contenido está siendo editado por otro usuario',
        lockOwner: species?.lock
          ? {
              id: species.lock.userId,
              name: species.lock.userName,
            }
          : null,
      }),
      {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const DELETE: APIRoute = async ({ params, locals }) => {
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
  await ManageSpeciesRepository.releaseLock(id, user.id)

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
