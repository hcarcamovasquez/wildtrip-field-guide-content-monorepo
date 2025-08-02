# Roles y Permisos del Sistema

## Usuarios de Prueba

Todos los usuarios de prueba tienen la **misma contraseña** para facilitar las pruebas automatizadas.

| Email | Rol | Descripción |
|-------|-----|-------------|
| admin+clerk_test@example.com | admin | Administrador con acceso completo |
| content_editor+clerk_test@example.com | content_editor | Editor de contenido general |
| news_editor+clerk_test@example.com | news_editor | Editor solo de noticias |
| areas_editor+clerk_test@example.com | areas_editor | Editor solo de áreas protegidas |
| species_editor+clerk_test@example.com | species_editor | Editor solo de especies |
| user+clerk_test@example.com | user | Usuario sin permisos de edición |

## Roles del Sistema

### 1. **admin**
- **Descripción**: Administrador del sistema con acceso completo
- **Permisos**:
  - ✅ Todas las operaciones en todas las entidades
  - ✅ Gestión de usuarios (cambiar roles)
  - ✅ Eliminar cualquier contenido
  - ✅ Acceso a funciones de desarrollo (seed, clear)
  - ✅ Ver estadísticas del sistema

### 2. **content_editor**
- **Descripción**: Editor de contenido con acceso a todas las secciones
- **Permisos**:
  - ✅ Crear, editar y publicar especies
  - ✅ Crear, editar y publicar noticias
  - ✅ Crear, editar y publicar áreas protegidas
  - ✅ Ver estadísticas de todas las secciones (especies, noticias, áreas)
  - ✅ Generar SEO con IA para todo el contenido
  - ❌ No puede gestionar galería de medios
  - ❌ No puede eliminar contenido
  - ❌ No puede gestionar usuarios

### 3. **news_editor**
- **Descripción**: Editor especializado en noticias
- **Permisos**:
  - ✅ Crear, editar y publicar noticias
  - ✅ Ver estadísticas solo de noticias
  - ✅ Generar SEO con IA para noticias
  - ❌ No puede acceder a la galería de medios
  - ❌ No puede editar especies
  - ❌ No puede editar áreas protegidas
  - ❌ No puede eliminar contenido
  - ❌ No puede gestionar usuarios

### 4. **areas_editor**
- **Descripción**: Editor especializado en áreas protegidas
- **Permisos**:
  - ✅ Crear, editar y publicar áreas protegidas
  - ✅ Ver estadísticas solo de áreas protegidas
  - ✅ Generar SEO con IA para áreas protegidas
  - ❌ No puede acceder a la galería de medios
  - ❌ No puede editar especies
  - ❌ No puede editar noticias
  - ❌ No puede eliminar contenido
  - ❌ No puede gestionar usuarios

### 5. **species_editor**
- **Descripción**: Editor especializado en especies
- **Permisos**:
  - ✅ Crear, editar y publicar especies
  - ✅ Ver estadísticas solo de especies
  - ✅ Generar SEO con IA para especies
  - ❌ No puede acceder a la galería de medios
  - ❌ No puede editar noticias
  - ❌ No puede editar áreas protegidas
  - ❌ No puede eliminar contenido
  - ❌ No puede gestionar usuarios

### 6. **user**
- **Descripción**: Usuario básico sin permisos de edición
- **Permisos**:
  - ✅ Ver contenido público
  - ❌ No puede acceder al dashboard administrativo
  - ❌ No puede crear ni editar contenido
  - ❌ No puede acceder a la galería de medios
  - ❌ No puede gestionar usuarios

## Matriz de Permisos por Endpoint

| Endpoint | admin | content_editor | news_editor | areas_editor | species_editor | user |
|----------|-------|----------------|-------------|--------------|----------------|------|
| **ESPECIES** |
| GET /api/species | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| GET /api/species/:id | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| GET /api/species/slug/:slug | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| POST /api/species | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| PATCH /api/species/:id | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| DELETE /api/species/:id | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| POST /api/species/:id/publish | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| POST /api/species/:id/draft | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| POST /api/species/:id/discard-draft | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| POST /api/species/:id/lock | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| DELETE /api/species/:id/lock | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| GET /api/species/:id/lock | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **NOTICIAS** |
| GET /api/news | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| GET /api/news/:id | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| GET /api/news/slug/:slug | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| POST /api/news | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| PATCH /api/news/:id | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| DELETE /api/news/:id | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| POST /api/news/:id/publish | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| POST /api/news/:id/draft | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| POST /api/news/:id/discard-draft | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| POST /api/news/:id/lock | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| DELETE /api/news/:id/lock | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET /api/news/:id/lock | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **ÁREAS PROTEGIDAS** |
| GET /api/protected-areas | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| GET /api/protected-areas/:id | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| GET /api/protected-areas/slug/:slug | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| POST /api/protected-areas | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| PATCH /api/protected-areas/:id | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| DELETE /api/protected-areas/:id | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| POST /api/protected-areas/:id/publish | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| POST /api/protected-areas/:id/draft | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| POST /api/protected-areas/:id/discard-draft | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| POST /api/protected-areas/:id/lock | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| DELETE /api/protected-areas/:id/lock | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| GET /api/protected-areas/:id/lock | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **GALERÍA** |
| GET /api/gallery/browse | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GET /api/gallery/images | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GET /api/gallery/by-ids | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GET /api/gallery/media/:id | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| POST /api/gallery/upload | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| POST /api/gallery/upload-chunk | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| POST /api/gallery/upload-complete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| PATCH /api/gallery/media/:id | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| DELETE /api/gallery/media/:id | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| POST /api/gallery/media/batch-delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| POST /api/gallery/media/move | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GET /api/gallery/folders | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GET /api/gallery/folders/:id | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| POST /api/gallery/folders | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| PATCH /api/gallery/folders/:id | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| DELETE /api/gallery/folders/:id | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **USUARIOS** |
| GET /api/users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GET /api/users/me | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /api/users/:id | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GET /api/users/stats | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| PATCH /api/users/:id | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **IA** |
| POST /api/ai/generate-seo/species | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| POST /api/ai/generate-seo/news | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| POST /api/ai/generate-seo/protected-areas | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **DESARROLLO** |
| POST /api/dev/seed | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| DELETE /api/dev/seed | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **WEBHOOKS** |
| POST /api/webhooks/clerk | 🔓 | 🔓 | 🔓 | 🔓 | 🔓 | 🔓 |
| **PREVIEW** |
| GET /api/preview/species/:id | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| GET /api/preview/news/:id | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET /api/preview/protected-areas/:id | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **PÚBLICO (sin autenticación)** |
| GET /api/public/species | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 |
| GET /api/public/species/:id | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 |
| GET /api/public/species/slug/:slug | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 |
| GET /api/public/news | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 |
| GET /api/public/news/:id | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 |
| GET /api/public/news/slug/:slug | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 |
| GET /api/public/protected-areas | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 |
| GET /api/public/protected-areas/:id | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 |
| GET /api/public/protected-areas/slug/:slug | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 |
| **SALUD** |
| GET /health | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 | 🌐 |

## Configuración en Clerk

Para configurar estos roles en Clerk:

1. **En el Dashboard de Clerk**:
   - Ve a **Users** → **Roles**
   - Crea los siguientes roles:
     - `admin`
     - `content_editor`
     - `news_editor`
     - `areas_editor`
     - `species_editor`
     - `user`

2. **Asignar roles a usuarios**:
   - Los roles se almacenan en `publicMetadata.role`
   - Al crear un usuario, asigna el rol correspondiente
   - El webhook sincronizará automáticamente el rol con la base de datos

3. **En el código**:
   ```typescript
   // El rol se extrae así:
   const role = user.publicMetadata?.role || 'user';
   ```

## Usuarios de Prueba con MCP Playwright

Para las pruebas automatizadas con el servidor MCP de Playwright:

1. **Credenciales de prueba**:
   - Todos los usuarios usan la contraseña: `Random12345A`
   - Los emails siguen el formato: `{rol}+clerk_test@example.com`

2. **Verificación de permisos**:
   - Cada rol tiene acceso limitado según la matriz de permisos
   - Solo admin puede acceder a la galería
   - Los permisos de estadísticas varían según el rol

| **ESTADÍSTICAS** |
| **ESTADÍSTICAS** |
| GET /api/species/stats | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| GET /api/news/stats | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET /api/protected-areas/stats | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |

## Leyenda de Símbolos

- ✅ = Acceso permitido con autenticación
- ❌ = Acceso denegado
- 🔓 = Endpoint protegido por webhook (requiere firma Svix)
- 🌐 = Acceso público sin autenticación

## Notas Importantes

- Los roles son jerárquicos: `admin` > `content_editor` > editores específicos > `user`
- El rol por defecto para nuevos usuarios es `user`
- Solo los administradores pueden cambiar roles de otros usuarios
- Solo los administradores tienen acceso a la galería de medios
- Los permisos de estadísticas:
  - `admin` y `content_editor`: pueden ver estadísticas de todas las secciones
  - Editores específicos: solo pueden ver estadísticas de su sección
- Los endpoints públicos (`/api/public/*`) solo muestran contenido publicado
- Los endpoints de preview (`/api/preview/*`) muestran borradores para usuarios autorizados
- Los permisos se verifican tanto en frontend (UI) como en backend (API)