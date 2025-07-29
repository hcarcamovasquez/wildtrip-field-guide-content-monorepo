export interface ConservationStatus {
  value: string
  label: string
  emoji: string
  color: string
  bgClass: string
  textClass: string
  darkBgClass: string
  darkTextClass: string
}

export const CONSERVATION_STATUSES: ConservationStatus[] = [
  {
    value: 'extinct',
    label: 'Extinto',
    emoji: '⚫',
    color: 'black',
    bgClass: 'bg-gray-900',
    textClass: 'text-white',
    darkBgClass: 'dark:bg-gray-800',
    darkTextClass: 'dark:text-gray-100',
  },
  {
    value: 'extinct_in_wild',
    label: 'Extinto en estado silvestre',
    emoji: '🟣',
    color: 'purple',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-800',
    darkBgClass: 'dark:bg-purple-600',
    darkTextClass: 'dark:text-purple-100',
  },
  {
    value: 'critically_endangered',
    label: 'En peligro crítico',
    emoji: '🔴',
    color: 'red',
    bgClass: 'bg-red-100',
    textClass: 'text-red-800',
    darkBgClass: 'dark:bg-red-600',
    darkTextClass: 'dark:text-red-100',
  },
  {
    value: 'endangered',
    label: 'En peligro',
    emoji: '🟠',
    color: 'orange',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-800',
    darkBgClass: 'dark:bg-orange-600',
    darkTextClass: 'dark:text-orange-100',
  },
  {
    value: 'vulnerable',
    label: 'Vulnerable',
    emoji: '🟡',
    color: 'yellow',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-800',
    darkBgClass: 'dark:bg-yellow-600',
    darkTextClass: 'dark:text-yellow-100',
  },
  {
    value: 'near_threatened',
    label: 'Casi amenazado',
    emoji: '🟢',
    color: 'green',
    bgClass: 'bg-green-100',
    textClass: 'text-green-800',
    darkBgClass: 'dark:bg-green-600',
    darkTextClass: 'dark:text-green-100',
  },
  {
    value: 'least_concern',
    label: 'Preocupación menor',
    emoji: '🔵',
    color: 'blue',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-800',
    darkBgClass: 'dark:bg-blue-600',
    darkTextClass: 'dark:text-blue-100',
  },
  {
    value: 'data_deficient',
    label: 'Datos insuficientes',
    emoji: '⚪',
    color: 'gray',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-800',
    darkBgClass: 'dark:bg-gray-600',
    darkTextClass: 'dark:text-gray-100',
  },
  {
    value: 'not_evaluated',
    label: 'No evaluado',
    emoji: '⚪',
    color: 'gray',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-800',
    darkBgClass: 'dark:bg-gray-600',
    darkTextClass: 'dark:text-gray-100',
  },
]

export const getConservationStatus = (value: string): ConservationStatus | undefined => {
  return CONSERVATION_STATUSES.find((status) => status.value === value)
}

export const getConservationStatusLabel = (value: string): string => {
  const status = getConservationStatus(value)
  return status ? `${status.emoji} ${status.label}` : 'Desconocido'
}
