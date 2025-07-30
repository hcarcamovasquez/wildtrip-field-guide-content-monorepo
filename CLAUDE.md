# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the Wildtrip Field Guide Content Monorepo with a microservices architecture:

1. **web** - Public-facing Astro site (SSG/SSR hybrid for performance)
2. **dashboard** - React SPA for content management (Vite + React + shadcn/ui)
3. **backend** - Node.js API backend (NestJS with Drizzle ORM)
4. **shared** - Shared types, utilities, and constants ✅

## Architecture Goals

- **Separation of Concerns**: Public site, admin panel, and API are independent services
- **Performance**: Public Astro site optimized for static content with minimal JavaScript
- **Scalability**: Each service can be deployed and scaled independently
- **Type Safety**: Shared types package ensures consistency across services

## Project Structure

```
wildtrip-field-guide-content-monorepo/
├── web/                     # Public Astro site
├── dashboard/               # React admin dashboard  
├── backend/                 # API backend
├── shared/                  # Shared code (types, constants, utils)
├── pnpm-workspace.yaml      # Monorepo configuration
├── package.json             # Root package.json
└── MIGRATION_README.md      # Migration guide
```

## Monorepo Commands

### Setup

```bash
# Install dependencies for all projects
pnpm install

# Build shared packages
pnpm --filter=shared build

# Start all services in development
pnpm run dev

# Run specific service
pnpm --filter=web dev
pnpm --filter=dashboard dev
pnpm --filter=backend dev
pnpm --filter=shared dev    # Watch mode for shared
```

### Individual Project Commands

#### web (Public Astro Site)

```bash
cd web

# Development (port 4321)
pnpm run dev

# Build static pages + SSR endpoints
pnpm run build

# Preview production build
pnpm run preview
```

#### dashboard (React Admin Panel)

```bash
cd dashboard

# Development (port 5173)
pnpm run dev

# Build SPA
pnpm run build

# Preview build
pnpm run preview
```

#### backend (API Backend)

```bash
cd backend

# Development (port 3000)
pnpm run start:dev

# Database operations
pnpm run db:generate   # Generate migrations
pnpm run db:migrate    # Run migrations
pnpm run db:push       # Push schema (dev)
pnpm run db:studio     # Drizzle Studio

# Build and start
pnpm run build
pnpm run start:prod
```

#### shared (Shared Package)

```bash
cd shared

# Build the package
pnpm run build

# Watch mode (auto-rebuild on changes)
pnpm run dev

# Type check
pnpm run type-check

# Clean build artifacts
pnpm run clean
```

## Service Architecture

### web (Public Site)

```
web/
├── src/
│   ├── pages/              # File-based routing
│   │   ├── content/        # Public content pages
│   │   │   ├── species/
│   │   │   ├── protected-areas/
│   │   │   └── news/
│   │   ├── sign-in/        # Auth pages (Clerk)
│   │   └── sign-up/
│   ├── components/         # Astro components only
│   │   └── public/         # UI components
│   ├── layouts/            # Page layouts
│   └── lib/
│       └── api/            # API client for backend
```

**Key Points:**
- SSG for content pages, SSR for dynamic data
- Minimal JavaScript (only auth)
- Clerk for authentication UI
- Redirects to admin panel after login

### dashboard (React Admin)

```
dashboard/
├── src/
│   ├── pages/              # React Router pages
│   │   ├── species/
│   │   ├── protected-areas/
│   │   ├── news/
│   │   ├── gallery/
│   │   └── users/
│   ├── components/         # All React management components
│   │   ├── forms/          # Form components
│   │   ├── tables/         # Data tables
│   │   └── ui/             # shadcn/ui
│   ├── hooks/              # Custom React hooks
│   ├── lib/
│   │   ├── api/            # API client
│   │   └── auth/           # Auth utilities
│   └── App.tsx             # Main app with routing
```

**Key Points:**
- SPA with React Router
- All management UI from current Astro project
- Authentication check on mount
- Redirects to Astro login if not authenticated

### backend (API)

```
backend/
├── src/
│   ├── species/            # Species module
│   ├── news/               # News module
│   ├── protected-areas/    # Protected areas module
│   ├── auth/               # Authentication guards
│   ├── db/                 # Database configuration
│   │   └── schema/         # Drizzle schemas
│   ├── config/             # App configuration
│   └── main.ts             # NestJS bootstrap
```

**Key Points:**
- NestJS framework
- RESTful API
- JWT authentication with Clerk
- All database operations
- Image processing and R2 storage

### shared (Shared Package)

```
shared/
├── src/
│   ├── types/              # TypeScript types
│   │   └── content.ts      # Rich content block types
│   ├── constants/          # Shared constants
│   │   ├── conservation-status.ts
│   │   ├── chile-regions.ts
│   │   ├── species-groups.ts
│   │   └── protected-area-types.ts
│   ├── utils/              # Utility functions
│   │   └── index.ts        # formatDate, slugify
│   └── index.ts            # Main exports
├── dist/                   # Compiled output (gitignored)
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

**Key Points:**
- Dual build (CommonJS + ESM)
- Full TypeScript support
- Tree-shakeable exports
- Used by all other packages

## 📊 Estado Actual (Enero 2025)

### ✅ Completado

1. **Shared Package** - Types, constants, and utilities
2. **Backend API** - NestJS with:
   - Cookie authentication with Clerk
   - Database schemas with Drizzle ORM
   - Species, News, and Protected Areas modules
   - Public and protected endpoints
   - Draft/publish workflow
   - Role-based access control

### 🚧 En Progreso

1. **Web** - Contains entire original project (needs separation)
2. **Dashboard** - Initial Vite setup only (needs component migration)

### ❌ Pendiente

1. **Backend**: Gallery module, locks, Redis cache, user management
2. **Dashboard**: Migrate React components from web, setup routing
3. **Web**: Remove admin code, connect to backend API

## Authentication Flow

1. **Public Site (web)**:
   - Uses Clerk for sign-in/sign-up UI
   - After successful auth, redirects to admin panel
   - No protected routes (all content is public)

2. **Admin Panel (dashboard)**:
   - Checks auth status on mount via backend API
   - If not authenticated, redirects to Astro sign-in
   - Maintains session with JWT tokens

3. **Backend API (backend)**:
   - Validates Clerk tokens from cookies
   - Protects all `/api/*` routes with guards
   - Role-based access control

## Development Guidelines

### Code Organization

- **web**: Minimal JS, focus on performance
- **dashboard**: Full React features, rich interactions
- **backend**: Clean architecture, service layer
- **shared**: Only truly shared code

### Import Conventions

```typescript
// In React apps
import { Button } from '@/components/ui/button'
import { Species } from '@wildtrip/shared/types'

// In backend
import { speciesRepository } from '../repositories/species'
import { SpeciesType } from '@wildtrip/shared/types'

// In Astro
import Layout from '../layouts/Layout.astro'
import { apiClient } from '../lib/api/client'
```

### API Communication

```typescript
// Backend endpoint
POST /api/species
GET  /api/species/:id
PUT  /api/species/:id
DELETE /api/species/:id

// Frontend consumption
const response = await apiClient.species.create(data)
const species = await apiClient.species.findById(id)
```

## Environment Configuration

### web (.env)

```env
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
PUBLIC_API_URL=http://localhost:3000
PUBLIC_ADMIN_URL=http://localhost:5173
```

### dashboard (.env)

```env
VITE_API_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### backend (.env)

```env
# Database
DATABASE_URL=postgresql://...

# Clerk
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# R2 Storage
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
PUBLIC_R2_PUBLIC_URL=https://...

# Server
PORT=3000
JWT_SECRET=...
```

## Deployment Strategy

1. **web**: 
   - Deploy to Vercel/Netlify (static + edge functions)
   - CDN for assets
   - Minimal server requirements

2. **dashboard**:
   - Deploy as static SPA
   - Can use same CDN as web
   - No server required

3. **backend**:
   - Deploy to Railway/Fly.io
   - Requires Node.js environment
   - Database and Redis connections

## Migration Checklist

See [MIGRATION_README.md](./MIGRATION_README.md) for detailed migration steps.

## Key Benefits

1. **Performance**: Public site loads faster without admin code
2. **Scalability**: Each service scales independently
3. **Development**: Teams can work on services in parallel
4. **Deployment**: Deploy only what changed
5. **Security**: API isolated from public site
6. **Maintenance**: Clear separation of concerns

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

      
      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.