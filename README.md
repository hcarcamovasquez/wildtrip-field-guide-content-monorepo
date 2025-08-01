# Wildtrip Field Guide Content Monorepo

Este es el monorepo para el sistema de gestión de contenido de la Guía de Campo de Wildtrip, una plataforma web dedicada a la biodiversidad de Chile.

## 🏗️ Arquitectura

El proyecto está estructurado como un monorepo con 4 paquetes principales:

```
wildtrip-field-guide-content-monorepo/
├── web/          # Sitio público (Astro)
├── dashboard/    # Panel de administración (React)
├── backend/      # API REST (NestJS)
└── shared/       # Tipos y utilidades compartidas
```

### Servicios

1. **web** - Sitio público con SSG/SSR (Astro v5 + Tailwind CSS v4)
2. **dashboard** - SPA para gestión de contenido (React 19 + Vite + shadcn/ui)
3. **backend** - API REST con autenticación JWT (NestJS + Drizzle ORM)
4. **shared** - Paquete compartido con tipos TypeScript y constantes

## 🚀 Inicio Rápido

### Requisitos

- Node.js 20+
- pnpm 10+
- PostgreSQL 16+

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/wildtrip/field-guide-monorepo.git
cd field-guide-monorepo

# Instalar dependencias
pnpm install

# Construir paquete compartido
pnpm --filter=shared build

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

### Desarrollo

```bash
# Iniciar todos los servicios
pnpm dev

# Iniciar servicios individuales
pnpm --filter=web dev        # Puerto 4321
pnpm --filter=dashboard dev  # Puerto 5173
pnpm --filter=backend dev    # Puerto 3000
```

## 📦 Paquetes

### shared (`@wildtrip/shared`)

Paquete con tipos TypeScript, constantes y utilidades compartidas:

- Tipos de contenido (RichContent, ContentBlock)
- Constantes (regiones, estados de conservación, grupos de especies)
- Utilidades (formatDate, slugify)

### web

Sitio público optimizado para rendimiento:

- **Framework**: Astro v5 con SSR
- **Estilos**: Tailwind CSS v4
- **Autenticación**: Clerk (solo UI)
- **Características**: 
  - Páginas estáticas para contenido
  - Imágenes optimizadas con Cloudflare
  - SEO optimizado
  - Sin acceso directo a BD

### dashboard

Panel de administración para gestión de contenido:

- **Framework**: React 19 + Vite
- **UI**: shadcn/ui + Radix UI
- **Editor**: TipTap
- **Características**:
  - CRUD completo para especies, noticias y áreas protegidas
  - Editor de texto enriquecido
  - Gestión de imágenes
  - Sistema de borradores

### backend

API REST con todas las funcionalidades:

- **Framework**: NestJS
- **ORM**: Drizzle
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT + Clerk
- **Características**:
  - RESTful API
  - Gestión de usuarios
  - Almacenamiento en R2
  - Procesamiento de imágenes
  - Sistema de bloqueos
  - IA para SEO (Cloudflare AI)

## 🔧 Configuración

### Variables de Entorno

Cada servicio requiere su propio archivo `.env`:

#### web/.env
```env
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
PUBLIC_API_URL=http://localhost:3000
PUBLIC_ADMIN_URL=http://localhost:5173
PUBLIC_R2_PUBLIC_URL=https://dev.cdn.wildtrip.cl
PUBLIC_SITE_URL=http://localhost:4321
```

#### dashboard/.env
```env
VITE_API_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_WEB_URL=http://localhost:4321
VITE_R2_PUBLIC_URL=https://dev.cdn.wildtrip.cl
```

#### backend/.env
```env
PORT=3000
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_test_...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
PUBLIC_R2_PUBLIC_URL=https://...
CLOUDFLARE_IA_API_ID=...
CLOUDFLARE_IA_API_TOKEN=...
JWT_SECRET=...
```

## 📊 Estado del Proyecto (Agosto 2025)

### ✅ Completado

- Arquitectura de microservicios
- Autenticación con Clerk
- CRUD completo para todas las entidades
- Sistema de borradores y publicación
- Procesamiento y optimización de imágenes
- Editor de contenido enriquecido (TipTap)
- Sistema de bloqueos para edición concurrente
- Generación de SEO con IA (Cloudflare AI)
- Paquete compartido de tipos
- Migración completa de componentes de gestión al dashboard
- Optimización de imágenes con ResponsiveImage
- Sistema de permisos basado en roles
- Generación automática de usernames
- Preview de drafts
- Gestión de galerías multimedia

### 🚧 Pendiente

- Tests unitarios y de integración
- Documentación de API
- CI/CD pipeline
- Caché con Redis
- Webhooks de Clerk
- Métricas y monitoreo
- Algunos endpoints faltantes en backend (locks, drafts, field updates)

## 🛠️ Scripts Útiles

```bash
# Linting y formateo
pnpm lint
pnpm format

# Type checking
pnpm type-check

# Build para producción
pnpm build

# Base de datos
pnpm --filter=backend db:generate  # Generar migraciones
pnpm --filter=backend db:migrate   # Ejecutar migraciones
pnpm --filter=backend db:studio    # Drizzle Studio
pnpm --filter=backend db:push      # Push schema (desarrollo)

# Seed de datos
pnpm --filter=backend seed         # Ejecutar seed
```

## 🚀 Despliegue

### web
- Optimizado para Vercel/Netlify
- Requiere Node.js para SSR

### dashboard
- Desplegar como SPA estática
- Configurar redirects para React Router

### backend
- Railway/Fly.io recomendado
- Requiere PostgreSQL y Redis
- Configurar variables de entorno

## 📝 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es privado y propiedad de Wildtrip.

## 🤝 Equipo

- Desarrollo: [Tu equipo aquí]
- Diseño: [Tu equipo aquí]
- Contenido: [Tu equipo aquí]

---

Para más información, consulta la documentación específica de cada paquete o el archivo CLAUDE.md para guías de desarrollo con IA.