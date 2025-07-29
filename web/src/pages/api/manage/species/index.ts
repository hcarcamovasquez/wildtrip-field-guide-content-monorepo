import type { APIRoute } from 'astro'

import { ManageSpeciesRepository } from '../../../../lib/private/repositories/ManageSpeciesRepository'
import { canManageSpecies, type Role } from '../../../../lib/utils/permissions'

export const GET: APIRoute = async ({ locals, request }) => {
  const user = locals.user
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!canManageSpecies(user.role as Role)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search') || ''
    const status = url.searchParams.get('status') || ''
    const conservationStatus = url.searchParams.get('conservationStatus') || ''
    const kingdom = url.searchParams.get('kingdom') || ''

    const result = await ManageSpeciesRepository.findAll({
      page,
      limit,
      search,
      status,
      conservationStatus,
      kingdom,
    })

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error fetching species:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!canManageSpecies(user.role as Role)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const data = await request.json()

    if (!data.scientificName || !data.commonName) {
      return new Response('Missing required fields', { status: 400 })
    }

    const species = await ManageSpeciesRepository.create({
      scientificName: data.scientificName,
      commonName: data.commonName,
      userId: user.id,
    })

    return new Response(JSON.stringify(species), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error creating species:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
