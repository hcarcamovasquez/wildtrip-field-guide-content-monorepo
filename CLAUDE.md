# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the Wildtrip Field Guide Content Monorepo with a microservices architecture:

1. **web** - Public-facing Astro site (SSG/SSR hybrid for performance) ✅
2. **dashboard** - React SPA for content management (Vite + React + shadcn/ui) ✅
3. **backend** - Node.js API backend (NestJS with Drizzle ORM) ✅
4. **shared** - Shared types, utilities, and constants ✅

## Architecture Goals

- **Separation of Concerns**: Public site, admin panel, and API are independent services ✅
- **Performance**: Public Astro site optimized for static content with minimal JavaScript ✅
- **Scalability**: Each service can be deployed and scaled independently ✅
- **Type Safety**: Shared types package ensures consistency across services ✅

## Project Structure

```
wildtrip-field-guide-content-monorepo/
├── web/                     # Public Astro site ✅
├── dashboard/               # React admin dashboard ✅
├── backend/                 # API backend ✅
├── shared/                  # Shared code (types, constants, utils) ✅
├── pnpm-workspace.yaml      # Monorepo configuration ✅
├── package.json             # Root package.json ✅
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
│   │   ├── content/        # Public content pages ✅
│   │   │   ├── species/
│   │   │   ├── protected-areas/
│   │   │   └── news/
│   │   ├── sign-in/        # Auth pages (Clerk) ✅
│   │   └── sign-up/
│   ├── components/         # Astro components only
│   │   └── public/         # UI components ✅
│   ├── layouts/            # Page layouts ✅
│   └── lib/
│       └── api/            # API client for backend ✅
```

**Key Points:**
- SSG for content pages, SSR for dynamic data ✅
- Minimal JavaScript (only auth) ✅
- Clerk for authentication UI ✅
- Redirects to admin panel after login ✅
- All management code removed ✅

### dashboard (React Admin)

```
dashboard/
├── src/
│   ├── pages/              # React Router pages ✅
│   │   ├── species/
│   │   ├── protected-areas/
│   │   ├── news/
│   │   ├── gallery/
│   │   └── users/
│   ├── components/         # All React management components ✅
│   │   ├── manage/         # Management UI components ✅
│   │   └── ui/             # shadcn/ui ✅
│   ├── hooks/              # Custom React hooks
│   ├── lib/
│   │   ├── api/            # API client ✅
│   │   └── utils/          # Utilities ✅
│   └── App.tsx             # Main app with routing ✅
```

**Key Points:**
- SPA with React Router ✅
- All management UI migrated from Astro project ✅
- Authentication check on mount ✅
- Redirects to Astro login if not authenticated ✅
- TipTap editor with all extensions ✅
- JSZip for batch downloads ✅

### backend (API)

```
backend/
├── src/
│   ├── species/            # Species module ✅
│   ├── news/               # News module ✅
│   ├── protected-areas/    # Protected areas module ✅
│   ├── gallery/            # Gallery module ✅
│   ├── users/              # Users module ✅
│   ├── ai/                 # AI module (Cloudflare AI) ✅
│   ├── seed/               # Database seeding ✅
│   ├── auth/               # Authentication guards ✅
│   ├── db/                 # Database configuration ✅
│   │   └── schema/         # Drizzle schemas ✅
│   ├── storage/            # R2 storage and image processing ✅
│   ├── locks/              # Lock system ✅
│   ├── config/             # App configuration ✅
│   └── main.ts             # NestJS bootstrap ✅
```

**Key Points:**
- NestJS framework ✅
- RESTful API ✅
- JWT authentication with Clerk ✅
- All database operations ✅
- Image processing and R2 storage ✅
- Lock system for concurrent editing ✅
- Database seeding functionality ✅
- Username generation for new users ✅
- Cloudflare AI integration for SEO ✅

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

## 📊 Current Status (Enero 2025)

### ✅ Completed

1. **Shared Package** - Types, constants, and utilities ✅
2. **Backend API** - NestJS with all features:
   - Cookie authentication with Clerk ✅
   - Database schemas with Drizzle ORM ✅
   - All CRUD modules (Species, News, Protected Areas, Gallery, Users) ✅
   - Draft/publish workflow ✅
   - Lock system for concurrent editing ✅
   - Image processing with Sharp ✅
   - R2 storage integration ✅
   - AI module for SEO generation ✅
   - Database seeding ✅
   - Username generation ✅
3. **Dashboard** - React SPA with:
   - All management components migrated ✅
   - React Router configuration ✅
   - Clerk authentication ✅
   - API integration ✅
   - TipTap editor with all extensions ✅
   - shadcn/ui components ✅
4. **Web** - Public Astro site:
   - All management code removed ✅
   - API client for backend ✅
   - Only public content and auth ✅

### 🚧 Known Issues

1. **Backend Missing Endpoints**:
   - Lock endpoints need to be exposed in controllers
   - Draft management endpoints need to be exposed
   - Field update endpoint for species

2. **Constants Duplication**:
   - Some constants still duplicated across projects
   - Should be consolidated in shared package

3. **Optional Features Not Implemented**:
   - Redis caching
   - Clerk webhooks for user sync
   - CI/CD pipeline

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
# Clerk Authentication
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# External Services URLs
PUBLIC_API_URL=http://localhost:3000
PUBLIC_ADMIN_URL=http://localhost:5173
```

### dashboard (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:3000

# Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Public Web URL (for redirects)
VITE_WEB_URL=http://localhost:4321

# CDN URL for images
VITE_R2_PUBLIC_URL=https://dev.cdn.wildtrip.cl
```

### backend (.env)

```env
# Server
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:4321,http://localhost:5173

# Database
DATABASE_URL=postgresql://...

# Clerk
CLERK_SECRET_KEY=sk_test_...

# Redis (Optional - not implemented)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# R2 Storage
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
PUBLIC_R2_PUBLIC_URL=https://...

# Cloudflare AI
CLOUDFLARE_IA_API_ID=...
CLOUDFLARE_IA_API_TOKEN=...

# Security
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


## Key Benefits

1. **Performance**: Public site loads faster without admin code ✅
2. **Scalability**: Each service scales independently ✅
3. **Development**: Teams can work on services in parallel ✅
4. **Deployment**: Deploy only what changed ✅
5. **Security**: API isolated from public site ✅
6. **Maintenance**: Clear separation of concerns ✅

## 📝 Important Notes

1. **Migration Status**: 98% Complete
   - Core functionality: 100% ✅
   - Optional features: ~60% (Redis, webhooks, CI/CD pending)

2. **Testing**: All services should be tested locally before deployment

3. **Database**: Run migrations before starting backend

4. **Shared Package**: Must be built before running other services

5. **Development Order**: shared → backend → web/dashboard

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

      
      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.