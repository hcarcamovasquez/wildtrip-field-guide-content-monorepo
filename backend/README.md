# Wildtrip Field Guide - Backend API

API REST para el sistema de gestión de contenido de la Guía de Campo de Wildtrip.

## 🚀 Características

- **Framework**: NestJS
- **ORM**: Drizzle
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT + Clerk
- **Almacenamiento**: Cloudflare R2
- **IA**: Cloudflare AI para SEO
- **Procesamiento de imágenes**: Sharp (conversión automática a WebP)
- **Sistema de bloqueos**: Para prevenir edición concurrente

## 📋 Requisitos

- Node.js 20+
- pnpm 10+
- PostgreSQL 16+
- Cuenta de Cloudflare (R2 + AI)
- Cuenta de Clerk

## 🛠️ Instalación

```bash
# Desde la raíz del monorepo
pnpm --filter=backend install

# O desde el directorio backend
cd backend
pnpm install
```

## ⚙️ Configuración

Crear archivo `.env` basado en `.env.example`:

```env
# Servidor
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:4321,http://localhost:5173

# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/wildtrip

# Autenticación (Clerk)
CLERK_SECRET_KEY=sk_test_...

# Redis (opcional)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=wildtrip-images
PUBLIC_R2_PUBLIC_URL=https://dev.cdn.wildtrip.cl

# Cloudflare AI
CLOUDFLARE_IA_API_ID=...
CLOUDFLARE_IA_API_TOKEN=...

# Seguridad
JWT_SECRET=your-secret-key-here
```

## 🗄️ Base de Datos

### Migraciones

```bash
# Generar migraciones
pnpm db:generate

# Ejecutar migraciones
pnpm db:migrate

# Push directo (desarrollo)
pnpm db:push

# Abrir Drizzle Studio
pnpm db:studio
```

### Seed inicial

```bash
# Cargar datos de ejemplo (solo desarrollo)
curl -X POST http://localhost:3000/api/dev/seed \
  -H "Cookie: __session=YOUR_ADMIN_SESSION"
```

## 🏃‍♂️ Desarrollo

```bash
# Iniciar en modo desarrollo
pnpm start:dev

# El API estará disponible en http://localhost:3000
```

## 🏗️ Estructura del Proyecto

```
backend/
├── src/
│   ├── species/            # Módulo de especies
│   ├── news/               # Módulo de noticias
│   ├── protected-areas/    # Módulo de áreas protegidas
│   ├── gallery/            # Módulo de galería
│   ├── users/              # Módulo de usuarios
│   ├── ai/                 # Integración con Cloudflare AI
│   ├── auth/               # Guards y estrategias de auth
│   ├── db/                 # Configuración de BD
│   │   └── schema/         # Esquemas de Drizzle
│   ├── storage/            # R2 y procesamiento de imágenes
│   ├── locks/              # Sistema de bloqueos
│   ├── seed/               # Seeds de BD
│   ├── config/             # Configuración
│   └── main.ts             # Bootstrap de NestJS
├── migrations/             # Migraciones de BD
└── drizzle.config.ts      # Config de Drizzle
```

## 🔌 API Endpoints

### Endpoints Públicos (Sin autenticación)

```
GET  /api/species
GET  /api/species/:id
GET  /api/species/slug/:slug
GET  /api/protected-areas
GET  /api/protected-areas/:id
GET  /api/protected-areas/slug/:slug
GET  /api/news
GET  /api/news/:id
GET  /api/news/slug/:slug
```

### Endpoints Protegidos (Requieren autenticación)

#### Especies
```
POST   /api/species                    # Crear especie
PATCH  /api/species/:id                # Actualizar especie
DELETE /api/species/:id                # Eliminar especie (admin)
POST   /api/species/:id/publish        # Publicar borrador
POST   /api/species/:id/draft          # Guardar borrador
POST   /api/species/:id/discard-draft  # Descartar borrador
POST   /api/species/:id/lock           # Bloquear para edición
DELETE /api/species/:id/lock           # Desbloquear
GET    /api/species/:id/lock           # Estado del bloqueo
```

#### Áreas Protegidas
```
POST   /api/protected-areas
PATCH  /api/protected-areas/:id
DELETE /api/protected-areas/:id
POST   /api/protected-areas/:id/publish
POST   /api/protected-areas/:id/draft
POST   /api/protected-areas/:id/discard-draft
POST   /api/protected-areas/:id/lock
DELETE /api/protected-areas/:id/lock
GET    /api/protected-areas/:id/lock
```

#### Noticias
```
POST   /api/news
PATCH  /api/news/:id
DELETE /api/news/:id
POST   /api/news/:id/publish
POST   /api/news/:id/draft
POST   /api/news/:id/discard-draft
POST   /api/news/:id/lock
DELETE /api/news/:id/lock
GET    /api/news/:id/lock
```

#### Galería
```
GET    /api/gallery/browse             # Explorar galería
GET    /api/gallery/by-ids             # Obtener por IDs
GET    /api/gallery/media/:id          # Obtener archivo
POST   /api/gallery/upload             # Subir archivos
PATCH  /api/gallery/media/:id          # Actualizar archivo
DELETE /api/gallery/media/:id          # Eliminar archivo
POST   /api/gallery/media/batch-delete # Eliminar múltiples
POST   /api/gallery/media/move         # Mover archivos
```

#### Carpetas
```
GET    /api/gallery/folders            # Listar carpetas
GET    /api/gallery/folders/:id        # Obtener carpeta
POST   /api/gallery/folders            # Crear carpeta
PATCH  /api/gallery/folders/:id        # Actualizar carpeta
DELETE /api/gallery/folders/:id        # Eliminar carpeta
```

#### Usuarios
```
GET    /api/users                      # Listar usuarios
GET    /api/users/me                   # Usuario actual
GET    /api/users/stats                # Estadísticas
GET    /api/users/:id                  # Obtener usuario
PATCH  /api/users/:id                  # Actualizar usuario (admin)
```

#### IA
```
POST   /api/ai/generate-seo/news       # SEO para noticias
POST   /api/ai/generate-seo/species    # SEO para especies
POST   /api/ai/generate-seo/protected-areas # SEO para áreas
```

## 🖼️ Procesamiento de Imágenes

El backend procesa automáticamente las imágenes:

1. **Conversión a WebP**: Todas las imágenes se convierten automáticamente
2. **Optimización**: Compresión automática manteniendo calidad
3. **Metadatos**: Se eliminan por seguridad
4. **Almacenamiento**: En Cloudflare R2
5. **URLs completas**: Siempre se devuelven URLs completas del CDN

```typescript
// Ejemplo de respuesta de upload
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "url": "https://cdn.wildtrip.cl/image.webp",
  "size": 245680,
  "mimeType": "image/webp"
}
```

## 🔒 Seguridad

### Autenticación

- Tokens JWT validados con Clerk
- Cookies HTTP-only para sesiones
- CORS configurado para dominios permitidos

### Autorización

- Guards de NestJS para proteger rutas
- Roles: admin, content_editor, species_editor, areas_editor, news_editor
- Permisos granulares por recurso

### Sistema de Bloqueos

Previene edición concurrente:
- Bloqueo automático al editar
- Timeout de 30 minutos
- Liberación manual disponible
- Información del usuario que tiene el bloqueo

## 📦 Build

```bash
# Build para producción
pnpm build

# Iniciar en producción
pnpm start:prod
```

## 🚀 Despliegue

### Railway/Fly.io

1. Configurar variables de entorno
2. Configurar PostgreSQL
3. Ejecutar migraciones
4. Deploy con `pnpm start:prod`

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
```

## 🧪 Testing

```bash
# Tests unitarios
pnpm test

# Tests e2e
pnpm test:e2e

# Coverage
pnpm test:cov
```

## 📊 Monitoreo

### Health Check
```
GET /health
```

### Formato de Respuesta

Todas las respuestas siguen este formato:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 🐛 Solución de Problemas

### Error de conexión a BD
- Verificar `DATABASE_URL`
- Comprobar que PostgreSQL esté corriendo
- Verificar permisos del usuario

### Error de R2
- Verificar credenciales de Cloudflare
- Comprobar permisos del bucket
- Verificar `PUBLIC_R2_PUBLIC_URL`

### Error de autenticación
- Verificar `CLERK_SECRET_KEY`
- Comprobar que el token sea válido
- Verificar CORS en `ALLOWED_ORIGINS`

### Imágenes no se procesan
- Verificar Sharp instalado correctamente
- Comprobar límites de memoria
- Ver logs de errores

## 📝 Notas de Desarrollo

1. **Transacciones**: Usar transacciones para operaciones múltiples
2. **Validación**: DTOs con class-validator
3. **Errores**: Usar excepciones de NestJS
4. **Logs**: Logger integrado de NestJS
5. **Performance**: Índices en campos de búsqueda
6. **Imágenes**: Siempre devolver URLs completas del CDN

## 📊 Estado Actual (Agosto 2025)

### ✅ Completado
- API REST completa con NestJS
- Autenticación con Clerk y cookies
- CRUD para todas las entidades
- Sistema de borradores y publicación
- Procesamiento de imágenes con Sharp
- Almacenamiento en Cloudflare R2
- Sistema de bloqueos para edición concurrente
- Generación de SEO con IA
- Gestión de usuarios con roles
- Organización de galería por carpetas
- Generación automática de usernames
- Seed de datos para desarrollo

### 🚧 Pendiente
- Caché con Redis (opcional)
- Webhooks de Clerk (opcional)
- Tests unitarios completos
- Documentación OpenAPI/Swagger
- Métricas con Prometheus
- Logs estructurados

## 🔗 Enlaces Útiles

- [NestJS Docs](https://docs.nestjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Clerk Backend](https://clerk.com/docs/backend-requests)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Cloudflare AI](https://developers.cloudflare.com/ai/)

## 📄 Licencia

Proyecto privado de Wildtrip.