export interface ProtectedAreaType {
  value: string
  label: string
  emoji: string
  description?: string
  color?: string
}

export const PROTECTED_AREA_TYPES: ProtectedAreaType[] = [
  {
    value: 'national_park',
    label: 'Parque Nacional',
    emoji: '🏔️',
    description: 'Área de preservación de ecosistemas de importancia nacional',
    color: 'bg-green-500 text-white',
  },
  {
    value: 'national_reserve',
    label: 'Reserva Nacional',
    emoji: '🌲',
    description: 'Área de conservación y protección del recurso forestal',
    color: 'bg-blue-500 text-white',
  },
  {
    value: 'natural_monument',
    label: 'Monumento Natural',
    emoji: '🗿',
    description: 'Área destinada a preservar sitios naturales de valor único',
    color: 'bg-amber-500 text-white',
  },
  {
    value: 'nature_sanctuary',
    label: 'Santuario de la Naturaleza',
    emoji: '🦋',
    description: 'Sitios terrestres o marinos de especial relevancia para la biodiversidad',
    color: 'bg-purple-500 text-white',
  },
]

export const getProtectedAreaType = (value: string): ProtectedAreaType | undefined => {
  return PROTECTED_AREA_TYPES.find((type) => type.value === value)
}

export const getProtectedAreaTypeLabel = (value: string): string => {
  const type = getProtectedAreaType(value)
  return type ? `${type.emoji} ${type.label}` : 'Desconocido'
}
