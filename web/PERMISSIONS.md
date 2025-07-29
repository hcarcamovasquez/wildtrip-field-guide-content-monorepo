# Sistema de Permisos - Guía de Campo WildTrip

## Resumen

El sistema de permisos utiliza un modelo de Control de Acceso Basado en Roles (RBAC) simple pero escalable. Cada usuario tiene un único rol que determina a qué secciones del panel de administración puede acceder.

## Roles y Accesos

### 1. **Administrador** (`admin`)

- **Acceso completo** a todas las secciones
- Único rol que puede gestionar usuarios
- Único rol que puede acceder a la galería
- Puede eliminar contenido permanentemente

### 2. **Editor de Contenido** (`content_editor`)

- Acceso a **Noticias**, **Especies** y **Áreas Protegidas**
- Puede crear, editar y publicar en estas tres secciones
- No puede gestionar usuarios ni acceder a la galería

### 3. **Editor de Noticias** (`news_editor`)

- Acceso **solo a Noticias**
- Puede crear, editar y publicar noticias
- Sin acceso a otras secciones

### 4. **Editor de Áreas** (`areas_editor`)

- Acceso **solo a Áreas Protegidas**
- Puede crear, editar y publicar áreas protegidas
- Sin acceso a otras secciones

### 5. **Editor de Especies** (`species_editor`)

- Acceso **solo a Especies**
- Puede crear, editar y publicar especies
- Sin acceso a otras secciones

### 6. **Usuario** (`user`)

- **Sin acceso** al panel de administración
- Solo puede ver contenido público

## Matriz de Permisos

| Sección          | admin | content_editor | news_editor | areas_editor | species_editor | user |
| ---------------- | ----- | -------------- | ----------- | ------------ | -------------- | ---- |
| Dashboard        | ✅    | ✅             | ✅          | ✅           | ✅             | ❌   |
| Noticias         | ✅    | ✅             | ✅          | ❌           | ❌             | ❌   |
| Especies         | ✅    | ✅             | ❌          | ❌           | ✅             | ❌   |
| Áreas Protegidas | ✅    | ✅             | ❌          | ✅           | ❌             | ❌   |
| Galería          | ✅    | ❌             | ❌          | ❌           | ❌             | ❌   |
| Usuarios         | ✅    | ❌             | ❌          | ❌           | ❌             | ❌   |

## Implementación Técnica

### Verificación de Permisos

```typescript
// En páginas Astro - Método recomendado
import { canAccessRoute, type Role } from '../lib/utils/permissions'

const user = Astro.locals.user
if (!user) {
  return Astro.redirect('/sign-in')
}

if (!canAccessRoute(user.role as Role, Astro.url.pathname)) {
  return Astro.redirect('/unauthorized')
}
```

### Permisos Disponibles

El sistema define los siguientes permisos internos:

- `view_dashboard` - Acceso al dashboard
- `manage_users` - Gestión de usuarios
- `manage_news` - Gestión de noticias
- `manage_species` - Gestión de especies
- `manage_areas` - Gestión de áreas protegidas
- `manage_gallery` - Acceso a la galería (actualmente no usado directamente)
- `manage_content` - Permiso general de contenido

### Rutas Protegidas

Todas las rutas bajo `/manage/*` y `/api/manage/*` requieren autenticación y permisos apropiados:

- `/manage` - Dashboard (requiere `view_dashboard`)
- `/manage/news` - Noticias (requiere `manage_news`)
- `/manage/species` - Especies (requiere `manage_species`)
- `/manage/protected-areas` - Áreas Protegidas (requiere `manage_areas`)
- `/manage/gallery` - Galería (requiere `manage_gallery` - solo admin)
- `/manage/users` - Usuarios (requiere `manage_users`)

### Navegación Dinámica

El menú de navegación se genera dinámicamente según los permisos del usuario:

```typescript
import { getManageNavItems } from '@/lib/utils/permissions'

const navItems = getManageNavItems(user.role)
// Retorna solo los elementos a los que el usuario tiene acceso
```

## Casos de Uso

### Ejemplo 1: Editor de Noticias

Un usuario con rol `news_editor`:

- ✅ Puede acceder a `/manage` (dashboard)
- ✅ Puede acceder a `/manage/news` y todas sus subrutas
- ❌ NO puede acceder a `/manage/gallery` (solo admin)
- ❌ Al intentar acceder a `/manage/species` será redirigido a `/unauthorized`
- ❌ No verá los enlaces de "Especies", "Galería" ni "Usuarios" en el menú de navegación

### Ejemplo 2: Editor de Contenido

Un usuario con rol `content_editor`:

- ✅ Puede acceder a todas las secciones de contenido (Noticias, Especies, Áreas Protegidas)
- ✅ Ve los enlaces de contenido en el menú pero NO "Galería" ni "Usuarios"
- ❌ No puede acceder a la galería ni a la gestión de usuarios

## Escalabilidad Futura

El sistema está diseñado para ser escalable. En el futuro se pueden agregar:

### 1. Permisos Granulares

```typescript
// Ejemplo futuro
type Permission = 'news.view' | 'news.create' | 'news.edit' | 'news.delete' | 'news.publish'
```

### 2. Permisos por Recurso

```typescript
// Ejemplo futuro
canUserEditNews(userId, newsId) {
  // Verificar si el usuario puede editar esta noticia específica
}
```

### 3. Grupos de Permisos

```typescript
// Ejemplo futuro
const permissionGroups = {
  news_management: ['news.view', 'news.create', 'news.edit'],
  news_moderation: ['news.publish', 'news.delete'],
}
```

### 4. Permisos Contextuales

```typescript
// Ejemplo futuro
if (user.role === 'news_editor' && news.authorId === user.id) {
  // Permitir editar solo sus propias noticias
}
```

## Middleware de Autorización

El sistema utiliza un middleware en cadena:

1. **Clerk Middleware** - Verifica autenticación
2. **User Middleware** - Carga datos del usuario desde la base de datos
3. **Verificación de página** - Cada página verifica permisos específicos

## Mejores Prácticas

1. **Verificar siempre en el servidor** - Nunca confiar solo en verificaciones del cliente
2. **Fail-safe** - Por defecto denegar acceso si no hay permisos explícitos
3. **Redirecciones consistentes** - Usar `/unauthorized` para accesos denegados
4. **Mensajes claros** - Informar al usuario por qué no tiene acceso

## API de Permisos

### Función Principal (Recomendada)

```typescript
canAccessRoute(role: Role, path: string): boolean
```

**Esta es la función recomendada para verificar permisos en páginas y APIs.** Maneja automáticamente tanto rutas de páginas como de API.

### Funciones de Verificación Específicas

Estas funciones están disponibles para casos especiales donde se necesita verificar un permiso específico:

```typescript
canViewDashboard(role: Role): boolean     // Verifica acceso al dashboard
canManageUsers(role: Role): boolean        // Verifica gestión de usuarios
canManageNews(role: Role): boolean         // Verifica gestión de noticias
canManageSpecies(role: Role): boolean      // Verifica gestión de especies
canManageAreas(role: Role): boolean        // Verifica gestión de áreas
canManageGallery(role: Role): boolean      // Verifica acceso a galería
canManageContent(role: Role): boolean      // Verifica gestión de contenido
```

### Funciones Utilitarias

```typescript
getManageNavItems(role: Role): NavItem[]    // Navegación dinámica
getRoleLabel(role: Role): string             // Etiquetas en español
```

### Función Base (Uso Interno)

```typescript
hasPermission(role: Role, permission: Permission): boolean
```

_Esta función es de uso interno del sistema de permisos._

## Configuración en la Base de Datos

Los roles se almacenan en la tabla `users` como un campo enum:

```sql
role: 'admin' | 'content_editor' | 'news_editor' | 'areas_editor' | 'species_editor' | 'user'
```

El rol por defecto para nuevos usuarios es `user`.
