import type { APIRoute } from 'astro'

import { ManageUserRepository } from '../../../../lib/private/repositories/ManageUserRepository'
import { canManageUsers, type Role } from '../../../../lib/utils/permissions'

export const GET: APIRoute = async ({ locals, url }) => {
  const user = locals.user
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!canManageUsers(user.role as Role)) {
    return new Response(JSON.stringify({ error: 'Acceso denegado' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '10')
  const search = url.searchParams.get('search') || ''
  const role = url.searchParams.get('role') || ''

  try {
    const result = await ManageUserRepository.findAll({
      page,
      limit,
      search,
      role: role || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })

    return new Response(
      JSON.stringify({
        data: result.users,
        pagination: result.pagination,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error fetching users:', error)
    return new Response(JSON.stringify({ error: 'Error al obtener usuarios' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
