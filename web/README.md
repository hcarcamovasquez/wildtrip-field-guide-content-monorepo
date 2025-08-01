# Wildtrip Field Guide - Web (Public Site)

Sitio web público de la Guía de Campo de Wildtrip, optimizado para rendimiento y SEO.

## 🚀 Características

- **Framework**: Astro v5 con SSR
- **Estilos**: Tailwind CSS v4
- **Autenticación**: Clerk (UI solamente)
- **Optimización**: Imágenes con Cloudflare CDN
- **SEO**: Meta tags, sitemap automático, structured data
- **Despliegue**: Railway con adaptador Node.js

## 📋 Requisitos

- Node.js 20+
- pnpm 10+
- Acceso a la API backend

## 🛠️ Instalación

```bash
# Desde la raíz del monorepo
pnpm --filter=web install

# O desde el directorio web
cd web
pnpm install
```

## ⚙️ Configuración

Crear archivo `.env` basado en `.env.example`:

```env
# Autenticación (Clerk)
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# URLs de servicios
PUBLIC_API_URL=http://localhost:3000
PUBLIC_ADMIN_URL=http://localhost:5173
PUBLIC_SITE_URL=http://localhost:4321

# CDN para imágenes
PUBLIC_R2_PUBLIC_URL=https://dev.cdn.wildtrip.cl

# Configuración del servidor (producción)
PORT=4321
HOST=0.0.0.0
```

## 🏃‍♂️ Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm dev

# El sitio estará disponible en http://localhost:4321
```

## 🏗️ Estructura del Proyecto

```
web/
├── src/
│   ├── pages/              # Rutas basadas en archivos
│   │   ├── content/        # Páginas de contenido público
│   │   │   ├── species/    # Catálogo de especies
│   │   │   │   ├── index.astro
│   │   │   │   ├── [slug].astro
│   │   │   │   └── preview/[id].astro
│   │   │   ├── protected-areas/ # Áreas protegidas
│   │   │   └── news/       # Noticias
│   │   ├── sign-in/        # Página de login (Clerk)
│   │   ├── sign-up/        # Página de registro (Clerk)
│   │   └── index.astro     # Homepage
│   ├── components/
│   │   ├── icons/          # Componentes de iconos
│   │   ├── news/           # Componentes de noticias
│   │   ├── protected-area/ # Componentes de áreas protegidas
│   │   ├── species/        # Componentes de especies
│   │   └── ui/             # Componentes shadcn/ui
│   ├── layouts/            # Layouts de página
│   └── lib/
│       ├── api/            # Cliente API
│       ├── repositories/   # Repositorios de datos
│       └── utils/          # Utilidades
├── public/                 # Assets estáticos
└── astro.config.mjs       # Configuración de Astro
```

## 🔌 API Client

El cliente API se conecta al backend para obtener datos:

```typescript
import { apiClient } from '@/lib/api/client'

// Obtener especies
const species = await apiClient.species.findAll({
  page: 1,
  limit: 20,
  mainGroup: 'mammal',
})

// Obtener una especie por slug
const species = await apiClient.species.findBySlug('condor-andino')
```

## 🖼️ Optimización de Imágenes

**IMPORTANTE**: Todas las imágenes deben usar el componente `ResponsiveImage`:

```astro
---
import ResponsiveImage from '@/components/ResponsiveImage.astro'
---

<ResponsiveImage
  src={imageUrl}
  alt="Descripción"
  variant="hero"
  sizes="(max-width: 640px) 100vw, 50vw"
  loading="lazy"
/>
```

Variantes disponibles:

- `thumb`: 96x96px
- `small`: 320px ancho
- `medium`: 640px ancho
- `large`: 960px ancho
- `hero`: 1280px ancho
- `full`: 1920px ancho

## 📦 Build

```bash
# Build para producción
pnpm build

# Preview del build
pnpm preview

# Iniciar servidor de producción
pnpm start
```

## 🚀 Despliegue

El proyecto está configurado para Railway con el adaptador de Node.js:

1. El build genera archivos en `dist/`
2. El servidor se inicia con `pnpm start`
3. Configurar variables de entorno en Railway
4. El puerto se toma de `process.env.PORT`

## 🧪 Testing

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Formateo
pnpm format
```

## 📝 Notas Importantes

1. **Sin acceso directo a BD**: Toda la data viene del API backend
2. **Imágenes optimizadas**: Siempre usar ResponsiveImage o funciones de optimización
3. **Autenticación**: Solo UI de Clerk, la validación real está en el backend
4. **SEO**: Todas las páginas de contenido tienen meta tags apropiados
5. **Performance**: Priorizar SSG cuando sea posible
6. **Código limpio**: Todo el código de gestión se ha movido al dashboard

## 🐛 Solución de Problemas

### Las imágenes no se muestran

- Verificar que `PUBLIC_R2_PUBLIC_URL` esté configurado
- Asegurar que se use `ResponsiveImage` y no `<img>` directamente
- Verificar que la API devuelva URLs completas

### Error de importación de @wildtrip/shared

- Ejecutar `pnpm --filter=shared build` desde la raíz
- Verificar que `@wildtrip/shared` esté en dependencies

### Puerto 4321 en uso

- El servidor intentará usar el siguiente puerto disponible
- O especificar otro puerto: `PORT=4322 pnpm dev`

### Error de autenticación

- Verificar las claves de Clerk
- Asegurar que el backend esté corriendo
- Revisar CORS en el backend

## 📊 Estado Actual (Agosto 2025)

### ✅ Completado

- Migración completa del código de gestión al dashboard
- Limpieza de dependencias no utilizadas
- Componente ResponsiveImage para todas las imágenes
- API client completamente funcional
- Páginas públicas optimizadas
- Sistema de preview para drafts
- SEO y structured data

### 🚧 Pendiente

- Tests E2E con Playwright
- Mejoras de accesibilidad
- Internacionalización (i18n)
- Progressive Web App (PWA)

## 📄 Licencia

Proyecto privado de Wildtrip.
