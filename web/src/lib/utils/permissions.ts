// Role-based permissions system

export type Role = 'admin' | 'content_editor' | 'news_editor' | 'areas_editor' | 'species_editor' | 'user'

export type Permission =
  | 'view_dashboard'
  | 'manage_users'
  | 'manage_news'
  | 'manage_species'
  | 'manage_areas'
  | 'manage_gallery'
  | 'manage_content'

// Define permissions for each role
const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    'view_dashboard',
    'manage_users',
    'manage_news',
    'manage_species',
    'manage_areas',
    'manage_gallery',
    'manage_content',
  ],
  content_editor: ['view_dashboard', 'manage_news', 'manage_species', 'manage_areas', 'manage_content'],
  news_editor: ['view_dashboard', 'manage_news'],
  areas_editor: ['view_dashboard', 'manage_areas'],
  species_editor: ['view_dashboard', 'manage_species'],
  user: [], // No permissions - can only access public content
}

// Check if a role has a specific permission
function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

// Check if user can access a specific route
export function canAccessRoute(role: Role, path: string): boolean {
  // Dashboard is accessible to all roles with permission
  if (path === '/manage') {
    return hasPermission(role, 'view_dashboard')
  }

  // Gallery is accessible to all editors
  if (path.startsWith('/manage/gallery')) {
    return hasPermission(role, 'manage_gallery')
  }

  // Check specific manage routes
  if (path.startsWith('/manage/users')) {
    return hasPermission(role, 'manage_users')
  }

  if (path.startsWith('/manage/news')) {
    return hasPermission(role, 'manage_news')
  }

  if (path.startsWith('/manage/species')) {
    return hasPermission(role, 'manage_species')
  }

  if (path.startsWith('/manage/protected-areas')) {
    return hasPermission(role, 'manage_areas')
  }

  // Default deny
  return false
}

// Role labels in Spanish
export const roleLabels: Record<Role, string> = {
  admin: 'Administrador',
  content_editor: 'Editor de Contenido',
  news_editor: 'Editor de Noticias',
  areas_editor: 'Editor de Áreas',
  species_editor: 'Editor de Especies',
  user: 'Usuario',
}

// Check if user can delete content
export function canDelete(role: Role): boolean {
  return role === 'admin'
}

// Check if user can manage content (for management UI access)
export function canManageContent(role: Role): boolean {
  return hasPermission(role, 'manage_content')
}

// Specific permission checks (for consistency across the app)
export function canViewDashboard(role: Role): boolean {
  return hasPermission(role, 'view_dashboard')
}

export function canManageUsers(role: Role): boolean {
  return hasPermission(role, 'manage_users')
}

export function canManageNews(role: Role): boolean {
  return hasPermission(role, 'manage_news')
}

export function canManageSpecies(role: Role): boolean {
  return hasPermission(role, 'manage_species')
}

export function canManageAreas(role: Role): boolean {
  return hasPermission(role, 'manage_areas')
}

export function canManageGallery(role: Role): boolean {
  return hasPermission(role, 'manage_gallery')
}
