# Wildtrip Field Guide - Backend API

API REST para el sistema de gestión de contenido de la Guía de Campo de Wildtrip.

## 🚀 Características

- **Framework**: NestJS
- **ORM**: Drizzle
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT + Clerk
- **Almacenamiento**: Cloudflare R2
- **IA**: Cloudflare AI para SEO
- **Caché**: Redis (opcional)

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
# Cargar datos de ejemplo
pnpm db:seed
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
├── drizzle/                # Migraciones
└── drizzle.config.ts      # Config de Drizzle
```

## 🔌 API Endpoints

### Autenticación
```
POST   /api/auth/validate     # Validar token de Clerk
GET    /api/auth/me          # Usuario actual
```

### Especies
```
GET    /api/species          # Listar especies
GET    /api/species/:id      # Obtener especie
GET    /api/species/slug/:slug # Obtener por slug
POST   /api/species          # Crear especie
PUT    /api/species/:id      # Actualizar especie
DELETE /api/species/:id      # Eliminar especie
POST   /api/species/:id/draft # Guardar borrador
POST   /api/species/:id/publish # Publicar
POST   /api/species/:id/lock # Bloquear para edición
DELETE /api/species/:id/lock # Desbloquear
```

### Áreas Protegidas
```
GET    /api/protected-areas
GET    /api/protected-areas/:id
GET    /api/protected-areas/slug/:slug
POST   /api/protected-areas
PUT    /api/protected-areas/:id
DELETE /api/protected-areas/:id
POST   /api/protected-areas/:id/draft
POST   /api/protected-areas/:id/publish
```

### Noticias
```
GET    /api/news
GET    /api/news/:id
GET    /api/news/slug/:slug
POST   /api/news
PUT    /api/news/:id
DELETE /api/news/:id
POST   /api/news/:id/draft
POST   /api/news/:id/publish
```

### Galería
```
POST   /api/gallery/upload   # Subir imágenes
GET    /api/gallery          # Listar imágenes
DELETE /api/gallery/:id      # Eliminar imagen
```

### Usuarios
```
GET    /api/users           # Listar usuarios
GET    /api/users/:id       # Obtener usuario
PUT    /api/users/:id       # Actualizar usuario
```

### IA
```
POST   /api/ai/generate-seo # Generar meta tags SEO
```

## 🖼️ Procesamiento de Imágenes

El backend procesa automáticamente las imágenes:

1. **Conversión a WebP**: Todas las imágenes se convierten
2. **Optimización**: Compresión automática
3. **Metadatos**: Se eliminan por seguridad
4. **Almacenamiento**: En Cloudflare R2

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
- Roles: admin, editor, viewer
- Permisos por recurso

### Sistema de Bloqueos

Previene edición concurrente:
- Bloqueo automático al editar
- Timeout de 30 minutos
- Liberación manual disponible

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

### Métricas (próximamente)
- Prometheus metrics
- OpenTelemetry traces

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
- Verificar CORS

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

## 🔗 Enlaces Útiles

- [NestJS Docs](https://docs.nestjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Clerk Backend](https://clerk.com/docs/backend-requests)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Cloudflare AI](https://developers.cloudflare.com/ai/)

## 📄 Licencia

Proyecto privado de Wildtrip.