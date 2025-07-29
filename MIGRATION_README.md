# Guía de Migración a Arquitectura Monorepo

Esta guía detalla los pasos necesarios para migrar el proyecto actual a una arquitectura de monorepo con servicios separados.

## 🎯 Objetivos de la Migración

1. **Separar el sitio público de la administración** para mejorar el rendimiento
2. **Crear un backend API independiente** que pueda escalar por separado
3. **Mantener el código compartido** en un paquete común
4. **Mejorar la experiencia de desarrollo** con hot reload independiente

## 📋 Checklist Pre-Migración

- [ ] Backup completo del proyecto actual
- [ ] Documentar todas las variables de entorno actuales
- [ ] Listar todas las dependencias por tipo (frontend/backend/compartidas)
- [ ] Identificar rutas API actuales para mapeo
- [ ] Revisar configuración de Clerk para múltiples apps

## 🏗️ Estructura del Nuevo Monorepo

```
wildtrip-field-guide-content-monorepo/
├── apps/
│   ├── wildtrip-web/        # Sitio público Astro
│   ├── wildtrip-admin/      # Panel admin React
│   └── wildtrip-backend/    # API Backend
├── packages/
│   └── wildtrip-shared/     # Código compartido
├── pnpm-workspace.yaml
├── package.json
├── turbo.json              # Configuración Turborepo (opcional)
└── .gitignore
```

## 📦 Paso 1: Configurar el Monorepo

### 1.1 Crear estructura base

```bash
# En la raíz del monorepo
mkdir -p apps/{wildtrip-web,wildtrip-admin,wildtrip-backend}
mkdir -p packages/wildtrip-shared

# Crear pnpm-workspace.yaml
cat > pnpm-workspace.yaml << EOF
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# Crear package.json raíz
cat > package.json << EOF
{
  "name": "wildtrip-monorepo",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "latest"
  },
  "packageManager": "pnpm@8.0.0"
}
EOF
```

### 1.2 Configurar Turborepo (opcional pero recomendado)

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

## 📦 Paso 2: Crear el Paquete Compartido

### 2.1 Inicializar wildtrip-shared

```bash
cd packages/wildtrip-shared

# Crear package.json
cat > package.json << EOF
{
  "name": "@wildtrip/shared",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc -w"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
EOF

# Crear tsconfig.json
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
EOF
```

### 2.2 Migrar tipos y constantes

```bash
mkdir -p src/{types,constants,utils}

# Mover archivos desde el proyecto original
# Tipos de base de datos
cp ../../wildtrip-field-guide-content-web-main/src/lib/db/schema/types.ts src/types/

# Constantes compartidas
cp ../../wildtrip-field-guide-content-web-main/src/lib/utils/conservation-status.ts src/constants/
cp ../../wildtrip-field-guide-content-web-main/src/lib/utils/chile-regions.ts src/constants/
cp ../../wildtrip-field-guide-content-web-main/src/lib/utils/species-groups.ts src/constants/
cp ../../wildtrip-field-guide-content-web-main/src/lib/utils/protected-area-types.ts src/constants/
```

## 🌐 Paso 3: Migrar el Sitio Público (wildtrip-web)

### 3.1 Copiar estructura base de Astro

```bash
cd apps/wildtrip-web

# Copiar archivos de configuración
cp ../../wildtrip-field-guide-content-web-main/{package.json,astro.config.mjs,tsconfig.json} .

# Copiar estructura de carpetas públicas
cp -r ../../wildtrip-field-guide-content-web-main/public .
cp -r ../../wildtrip-field-guide-content-web-main/src/pages/content src/pages/
cp -r ../../wildtrip-field-guide-content-web-main/src/pages/{sign-in,sign-up,index.astro} src/pages/
cp -r ../../wildtrip-field-guide-content-web-main/src/components/public src/components/
cp -r ../../wildtrip-field-guide-content-web-main/src/layouts .
cp -r ../../wildtrip-field-guide-content-web-main/src/styles .
```

### 3.2 Actualizar package.json

```json
{
  "name": "@wildtrip/web",
  "dependencies": {
    "@wildtrip/shared": "workspace:*",
    "@clerk/clerk-js": "^5.0.0",
    "astro": "^4.0.0"
    // Remover dependencias de React y administración
  }
}
```

### 3.3 Crear cliente API

```typescript
// src/lib/api/client.ts
export class APIClient {
  constructor(private baseURL: string) {}

  async fetch(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    
    return response.json()
  }

  species = {
    findAll: (params?: any) => this.fetch('/api/species', { params }),
    findBySlug: (slug: string) => this.fetch(`/api/species/slug/${slug}`),
  }

  protectedAreas = {
    findAll: (params?: any) => this.fetch('/api/protected-areas', { params }),
    findBySlug: (slug: string) => this.fetch(`/api/protected-areas/slug/${slug}`),
  }

  news = {
    findAll: (params?: any) => this.fetch('/api/news', { params }),
    findBySlug: (slug: string) => this.fetch(`/api/news/slug/${slug}`),
  }
}

export const apiClient = new APIClient(import.meta.env.PUBLIC_API_URL)
```

### 3.4 Actualizar páginas para usar API

```astro
---
// src/pages/content/species/[slug].astro
import Layout from '@/layouts/Layout.astro'
import { apiClient } from '@/lib/api/client'

const { slug } = Astro.params
const species = await apiClient.species.findBySlug(slug)

if (!species) {
  return Astro.redirect('/404')
}
---

<Layout title={species.commonName}>
  <!-- Contenido de la especie -->
</Layout>
```

## ⚛️ Paso 4: Crear el Panel Admin (wildtrip-admin)

### 4.1 Inicializar proyecto Vite + React

```bash
cd apps/wildtrip-admin

# Crear proyecto con Vite
pnpm create vite . --template react-ts

# Instalar dependencias adicionales
pnpm add @wildtrip/shared@workspace:* @tanstack/react-query react-router-dom @clerk/clerk-react
pnpm add -D @types/react @types/react-dom
```

### 4.2 Migrar componentes React

```bash
# Copiar todos los componentes de administración
cp -r ../../wildtrip-field-guide-content-web-main/src/components/manage/* src/components/
cp -r ../../wildtrip-field-guide-content-web-main/src/components/ui src/components/

# Crear estructura de páginas
mkdir -p src/pages/{species,protected-areas,news,gallery,users}
```

### 4.3 Configurar React Router

```tsx
// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  
  if (!isLoaded) return <div>Loading...</div>
  
  if (!isSignedIn) {
    window.location.href = import.meta.env.VITE_WEB_URL + '/sign-in'
    return null
  }
  
  return <>{children}</>
}

export function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/species" />} />
            <Route path="/species" element={
              <ProtectedRoute>
                <SpeciesListPage />
              </ProtectedRoute>
            } />
            {/* Más rutas... */}
          </Routes>
        </Router>
      </QueryClientProvider>
    </ClerkProvider>
  )
}
```

### 4.4 Crear hooks para API

```typescript
// src/hooks/useAPI.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

export function useSpecies() {
  return useQuery({
    queryKey: ['species'],
    queryFn: () => apiClient.species.findAll()
  })
}

export function useCreateSpecies() {
  return useMutation({
    mutationFn: (data: any) => apiClient.species.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['species'] })
    }
  })
}
```

## 🚀 Paso 5: Crear el Backend API (wildtrip-backend)

### 5.1 Inicializar proyecto Express/Fastify

```bash
cd apps/wildtrip-backend

# Crear package.json
cat > package.json << EOF
{
  "name": "@wildtrip/backend",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "tsx src/db/migrate.ts",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@wildtrip/shared": "workspace:*",
    "express": "^4.18.0",
    "drizzle-orm": "^0.29.0",
    "postgres": "^3.4.0",
    "@clerk/backend": "^0.38.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0"
  }
}
EOF
```

### 5.2 Migrar esquemas de base de datos

```bash
# Copiar esquemas
cp -r ../../wildtrip-field-guide-content-web-main/src/lib/db src/
cp ../../wildtrip-field-guide-content-web-main/drizzle.config.ts .
```

### 5.3 Crear servidor Express

```typescript
// src/server.ts
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { clerkMiddleware } from './middleware/auth'
import { speciesRouter } from './routes/species'
import { protectedAreasRouter } from './routes/protected-areas'
import { newsRouter } from './routes/news'
import { galleryRouter } from './routes/gallery'
import { usersRouter } from './routes/users'

const app = express()

// Middleware
app.use(helmet())
app.use(cors({
  origin: [
    process.env.WEB_URL!,
    process.env.ADMIN_URL!
  ]
}))
app.use(express.json())
app.use(clerkMiddleware)

// Routes
app.use('/api/species', speciesRouter)
app.use('/api/protected-areas', protectedAreasRouter)
app.use('/api/news', newsRouter)
app.use('/api/gallery', galleryRouter)
app.use('/api/users', usersRouter)

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

### 5.4 Migrar repositorios

```typescript
// src/repositories/species.ts
import { db } from '@/db'
import { species } from '@/db/schema'
import { eq } from 'drizzle-orm'

export class SpeciesRepository {
  async findAll(params: any) {
    return db.select().from(species).limit(params.limit || 20)
  }

  async findById(id: string) {
    const [result] = await db.select().from(species).where(eq(species.id, id))
    return result
  }

  async findBySlug(slug: string) {
    const [result] = await db.select().from(species).where(eq(species.slug, slug))
    return result
  }

  async create(data: any) {
    const [result] = await db.insert(species).values(data).returning()
    return result
  }

  async update(id: string, data: any) {
    const [result] = await db.update(species).set(data).where(eq(species.id, id)).returning()
    return result
  }

  async delete(id: string) {
    await db.delete(species).where(eq(species.id, id))
  }
}

export const speciesRepository = new SpeciesRepository()
```

### 5.5 Crear rutas API

```typescript
// src/routes/species.ts
import { Router } from 'express'
import { speciesRepository } from '@/repositories/species'
import { requireAuth, requireRole } from '@/middleware/auth'

export const speciesRouter = Router()

// Public routes
speciesRouter.get('/', async (req, res) => {
  const species = await speciesRepository.findAll(req.query)
  res.json(species)
})

speciesRouter.get('/slug/:slug', async (req, res) => {
  const species = await speciesRepository.findBySlug(req.params.slug)
  if (!species) return res.status(404).json({ error: 'Not found' })
  res.json(species)
})

// Protected routes
speciesRouter.post('/', requireAuth, requireRole('species_editor'), async (req, res) => {
  const species = await speciesRepository.create(req.body)
  res.status(201).json(species)
})

speciesRouter.put('/:id', requireAuth, requireRole('species_editor'), async (req, res) => {
  const species = await speciesRepository.update(req.params.id, req.body)
  res.json(species)
})

speciesRouter.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  await speciesRepository.delete(req.params.id)
  res.status(204).send()
})
```

## 🔧 Paso 6: Configuración de Desarrollo

### 6.1 Scripts del monorepo

```json
// package.json raíz
{
  "scripts": {
    "dev": "turbo dev",
    "dev:web": "pnpm --filter=@wildtrip/web dev",
    "dev:admin": "pnpm --filter=@wildtrip/admin dev",
    "dev:backend": "pnpm --filter=@wildtrip/backend dev",
    "build": "turbo build",
    "clean": "turbo clean",
    "db:generate": "pnpm --filter=@wildtrip/backend db:generate",
    "db:migrate": "pnpm --filter=@wildtrip/backend db:migrate",
    "db:studio": "pnpm --filter=@wildtrip/backend db:studio"
  }
}
```

### 6.2 Variables de entorno

```bash
# .env.example en la raíz
# Backend
DATABASE_URL=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
PUBLIC_R2_PUBLIC_URL=
JWT_SECRET=

# Frontend URLs
WEB_URL=http://localhost:4321
ADMIN_URL=http://localhost:5173
API_URL=http://localhost:3000
```

## 🚢 Paso 7: Migración de Datos

### 7.1 Exportar datos existentes

```bash
# Desde el proyecto original
pg_dump $DATABASE_URL > backup.sql
```

### 7.2 Importar en nueva base de datos

```bash
# En el nuevo backend
psql $DATABASE_URL < backup.sql
```

## ✅ Paso 8: Verificación Post-Migración

### Checklist de verificación:

- [ ] Sitio público carga correctamente
- [ ] Autenticación funciona (sign-in/sign-up)
- [ ] Redirección a admin después del login
- [ ] Panel admin carga con autenticación
- [ ] CRUD de especies funciona
- [ ] CRUD de áreas protegidas funciona
- [ ] CRUD de noticias funciona
- [ ] Galería de imágenes funciona
- [ ] Carga de archivos a R2 funciona
- [ ] Búsquedas y filtros funcionan
- [ ] Permisos por rol funcionan correctamente

## 🔄 Paso 9: CI/CD y Deployment

### 9.1 GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Build shared
        run: pnpm --filter=@wildtrip/shared build
      - name: Build web
        run: pnpm --filter=@wildtrip/web build
      - name: Deploy to Vercel
        run: vercel deploy --prod

  deploy-admin:
    runs-on: ubuntu-latest
    steps:
      # Similar para admin

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      # Deploy a Railway/Fly.io
```

## 📝 Notas Importantes

1. **Orden de migración**: Shared → Backend → Web → Admin
2. **Testing**: Probar cada servicio individualmente antes de integrar
3. **Rollback**: Mantener el proyecto original hasta confirmar estabilidad
4. **Monitoreo**: Configurar logs y métricas en cada servicio
5. **Documentación**: Actualizar README de cada proyecto

## 🆘 Troubleshooting

### Problemas comunes:

1. **CORS errors**: Verificar configuración de CORS en backend
2. **Auth loops**: Revisar URLs de redirección en Clerk
3. **Type errors**: Ejecutar `pnpm --filter=@wildtrip/shared build`
4. **DB connection**: Verificar DATABASE_URL en cada ambiente

## 🎉 Conclusión

Con esta migración tendrás:

- ✅ Sitio público ultra rápido
- ✅ Panel admin independiente y escalable
- ✅ API backend robusta
- ✅ Código compartido tipado
- ✅ Desarrollo más ágil con hot reload independiente

¡Éxito con la migración!