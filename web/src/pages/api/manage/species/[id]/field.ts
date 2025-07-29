import type { APIRoute } from 'astro'

import { ManageSpeciesRepository } from '../../../../../lib/private/repositories/ManageSpeciesRepository'
import { canManageSpecies, type Role } from '../../../../../lib/utils/permissions'

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
  const { field, value } = await request.json()

  try {
    // Check if field exists in species schema
    const validFields = [
      'scientificName',
      'commonName',
      'family',
      'order',
      'class',
      'phylum',
      'kingdom',
      'mainGroup',
      'specificCategory',
      'description',
      'habitat',
      'distribution',
      'conservationStatus',
      'mainImage',
      'galleryImages',
      'distinctiveFeatures',
      'references',
      'richContent',
      'status',
      'seoTitle',
      'seoDescription',
      'seoKeywords',
    ]

    if (!validFields.includes(field)) {
      return new Response(JSON.stringify({ error: 'Campo no válido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const updateData = { [field]: value }
    await ManageSpeciesRepository.update(id, updateData, user.id)

    // Get the updated species with draft data to return the current state
    const updatedSpecies = await ManageSpeciesRepository.findById(id)
    if (!updatedSpecies) {
      throw new Error('Species not found after update')
    }

    // If the species is published and has draft data, merge it for the response
    const responseData = {
      success: true,
      field,
      value,
      hasDraft: updatedSpecies.hasDraft,
      draftData: updatedSpecies.draftData,
    }

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error updating field:', error)
    return new Response(JSON.stringify({ error: 'Error al actualizar el campo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
