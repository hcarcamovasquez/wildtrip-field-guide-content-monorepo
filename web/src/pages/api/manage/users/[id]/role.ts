import { clerkClient } from '@clerk/astro/server'
import type { APIRoute } from 'astro'

import { ManageUserRepository } from '@/lib/private/repositories/ManageUserRepository.ts'
import { canManageUsers, type Role } from '@/lib/utils/permissions.ts'

const validRoles: Role[] = ['admin', 'content_editor', 'news_editor', 'areas_editor', 'species_editor', 'user']

export const PATCH: APIRoute = async (context) => {
  const { params, request, locals } = context
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

  const userId = parseInt(params.id || '')
  if (!userId || isNaN(userId)) {
    return new Response(JSON.stringify({ error: 'ID de usuario inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (userId === user.id) {
    return new Response(JSON.stringify({ error: 'No puedes cambiar tu propio rol' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json()
    const { role } = body

    if (!role || !validRoles.includes(role)) {
      return new Response(JSON.stringify({ error: 'Rol inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const targetUser = await ManageUserRepository.findById(userId)
    if (!targetUser) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Update role in Clerk's publicMetadata (preserve userId)
    const client = clerkClient(context)
    const clerkUser = await client.users.getUser(targetUser.clerkId)
    const currentMetadata = clerkUser.publicMetadata || {}

    await client.users.updateUserMetadata(targetUser.clerkId, {
      publicMetadata: {
        ...currentMetadata,
        role: role,
        userId: targetUser.id, // Ensure userId is set
      },
    })

    // Update role in database
    const updatedUser = await ManageUserRepository.updateRole(userId, role)

    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return new Response(JSON.stringify({ error: 'Error al actualizar el rol' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
