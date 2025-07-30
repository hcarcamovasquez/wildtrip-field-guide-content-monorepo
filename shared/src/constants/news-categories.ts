export interface NewsCategory {
  value: string
  label: string
  emoji: string
  bgClass: string
  textClass: string
  darkBgClass: string
  darkTextClass: string
}

export const NEWS_CATEGORIES: NewsCategory[] = [
  {
    value: 'conservation',
    label: 'Conservación',
    emoji: '🌿',
    bgClass: 'bg-green-100',
    textClass: 'text-green-800',
    darkBgClass: 'dark:bg-green-600',
    darkTextClass: 'dark:text-green-100',
  },
  {
    value: 'research',
    label: 'Investigación',
    emoji: '🔬',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-800',
    darkBgClass: 'dark:bg-blue-600',
    darkTextClass: 'dark:text-blue-100',
  },
  {
    value: 'education',
    label: 'Educación',
    emoji: '📚',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-800',
    darkBgClass: 'dark:bg-purple-600',
    darkTextClass: 'dark:text-purple-100',
  },
  {
    value: 'current_events',
    label: 'Actualidad',
    emoji: '📰',
    bgClass: 'bg-red-100',
    textClass: 'text-red-800',
    darkBgClass: 'dark:bg-red-600',
    darkTextClass: 'dark:text-red-100',
  },
]

export function getNewsCategory(value: string): NewsCategory | undefined {
  return NEWS_CATEGORIES.find((category) => category.value === value)
}

export function getNewsCategoryLabel(value: string): string {
  const category = getNewsCategory(value)
  return category ? `${category.emoji} ${category.label}` : 'Desconocida'
}