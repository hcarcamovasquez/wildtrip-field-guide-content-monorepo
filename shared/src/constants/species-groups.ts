export interface MainGroup {
  value: string
  label: string
}

export const MAIN_GROUPS: MainGroup[] = [
  { value: 'mammal', label: 'Mamífero' },
  { value: 'bird', label: 'Ave' },
  { value: 'reptile', label: 'Reptil' },
  { value: 'amphibian', label: 'Anfibio' },
  { value: 'fish', label: 'Pez' },
  { value: 'insect', label: 'Insecto' },
  { value: 'arachnid', label: 'Arácnido' },
  { value: 'crustacean', label: 'Crustáceo' },
  { value: 'mollusk', label: 'Molusco' },
  { value: 'plant', label: 'Planta' },
  { value: 'fungus', label: 'Hongo' },
  { value: 'algae', label: 'Alga' },
  { value: 'other', label: 'Otro' },
]

export function getMainGroup(value: string): MainGroup | undefined {
  return MAIN_GROUPS.find((group) => group.value === value)
}

export function getMainGroupLabel(value: string): string {
  return getMainGroup(value)?.label || value
}