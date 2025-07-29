export interface ChileRegion {
  value: string
  label: string
  romanNumeral: string
  capital: string
}

export const CHILE_REGIONS: ChileRegion[] = [
  {
    value: 'arica_parinacota',
    label: 'Arica y Parinacota',
    romanNumeral: 'XV',
    capital: 'Arica',
  },
  {
    value: 'tarapaca',
    label: 'Tarapacá',
    romanNumeral: 'I',
    capital: 'Iquique',
  },
  {
    value: 'antofagasta',
    label: 'Antofagasta',
    romanNumeral: 'II',
    capital: 'Antofagasta',
  },
  {
    value: 'atacama',
    label: 'Atacama',
    romanNumeral: 'III',
    capital: 'Copiapó',
  },
  {
    value: 'coquimbo',
    label: 'Coquimbo',
    romanNumeral: 'IV',
    capital: 'La Serena',
  },
  {
    value: 'valparaiso',
    label: 'Valparaíso',
    romanNumeral: 'V',
    capital: 'Valparaíso',
  },
  {
    value: 'metropolitana',
    label: 'Metropolitana de Santiago',
    romanNumeral: 'RM',
    capital: 'Santiago',
  },
  {
    value: 'ohiggins',
    label: "Libertador General Bernardo O'Higgins",
    romanNumeral: 'VI',
    capital: 'Rancagua',
  },
  {
    value: 'maule',
    label: 'Maule',
    romanNumeral: 'VII',
    capital: 'Talca',
  },
  {
    value: 'nuble',
    label: 'Ñuble',
    romanNumeral: 'XVI',
    capital: 'Chillán',
  },
  {
    value: 'biobio',
    label: 'Biobío',
    romanNumeral: 'VIII',
    capital: 'Concepción',
  },
  {
    value: 'araucania',
    label: 'La Araucanía',
    romanNumeral: 'IX',
    capital: 'Temuco',
  },
  {
    value: 'los_rios',
    label: 'Los Ríos',
    romanNumeral: 'XIV',
    capital: 'Valdivia',
  },
  {
    value: 'los_lagos',
    label: 'Los Lagos',
    romanNumeral: 'X',
    capital: 'Puerto Montt',
  },
  {
    value: 'aysen',
    label: 'Aysén del General Carlos Ibáñez del Campo',
    romanNumeral: 'XI',
    capital: 'Coyhaique',
  },
  {
    value: 'magallanes',
    label: 'Magallanes y de la Antártica Chilena',
    romanNumeral: 'XII',
    capital: 'Punta Arenas',
  },
]

export const getRegion = (value: string): ChileRegion | undefined => {
  return CHILE_REGIONS.find((region) => region.value === value)
}

export const getRegionLabel = (value: string): string => {
  const region = getRegion(value)
  return region ? region.label : 'Desconocida'
}

export const getRegionWithNumber = (value: string): string => {
  const region = getRegion(value)
  return region ? `${region.romanNumeral} - ${region.label}` : 'Desconocida'
}