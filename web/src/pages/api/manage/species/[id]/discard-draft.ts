import type { APIRoute } from 'astro'

import { ManageSpeciesRepository } from '../../../../../lib/private/repositories/ManageSpeciesRepository'
import { canManageSpecies, type Role } from '../../../../../lib/utils/permissions'

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

  const { id } = params
  if (!id || isNaN(parseInt(id))) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    await ManageSpeciesRepository.discardDraft(parseInt(id))

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error discarding draft:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error al descartar borrador' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
