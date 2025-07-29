# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the **web** project in the Wildtrip monorepo.

## Project Overview

This is the public-facing Wildtrip Guia de Campo web application - a biodiversity portal for Chile. It's built with Astro for optimal performance, using SSG for content pages and SSR for dynamic features.

**Role in Monorepo:** This project handles all public-facing content display, authentication UI (Clerk), and redirects authenticated users to the admin panel.

## Development Commands

### Essential Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Start development server (localhost:4321)
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Start production server
pnpm run start

# Run linting
pnpm run lint

# Run type checking
pnpm run type-check

# Format code
pnpm run format
```

### Database Commands

```bash
# Generate migrations from schema changes
pnpm run db:generate

# Apply migrations to database
pnpm run db:migrate

# Push schema changes directly (development)
pnpm run db:push

# Open Drizzle Studio for database management
pnpm run db:studio
```

### Testing

No test commands are currently configured. Check with the team for testing approach before implementing tests.

## Environment Setup

Create a `.env` file with these required variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database_name

# Authentication (Clerk)
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Redis Cache (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# AWS S3/R2 Storage
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
PUBLIC_R2_PUBLIC_URL=https://your-public-r2-url.r2.dev

# Server Configuration
PORT=4321
HOST=0.0.0.0
```

## Architecture

### Tech Stack

- **Framework**: Astro v5 with SSR
- **Deployment**: Railway (Node.js adapter)
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Clerk (Spanish localization)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Icons**: Lucide React
- **Caching**: Upstash Redis
- **Language**: TypeScript
- **Shared Package**: `@wildtrip/shared` for types and constants

### Key Directories

- `src/pages/` - File-based routing
- `src/components/public/` - Public UI components (Astro)
- `src/components/manage/` - Management UI components (React + shadcn/ui)
- `src/components/ui/` - shadcn/ui component library
- `src/lib/db/schema/` - Database schema definitions
- `src/lib/public/repositories/` - Public data access layer
- `src/lib/private/repositories/` - Private/management data access
- `src/lib/utils/` - Utility functions
- `src/middleware.ts` - Auth and user middleware chain

### Database Schema

Main entities with base content system for drafts:

- **baseContent** - Shared draft/publish workflow
- **species** - Core species data with taxonomic info
- **mediaGallery** - Image management system
- **protectedAreas** - Parks and reserves
- **news** - News articles
- **users** - User management with Clerk integration

### Authentication Flow

1. Route blocker middleware prevents access to sensitive routes (configurable via BLOCKED_ROUTES env var)
2. Clerk middleware protects `/manage` and `/api/manage` routes
3. User middleware enriches requests with cached user data
4. Spanish UI localization throughout
5. User data available in `Astro.locals.user`

### Repository Pattern

Each entity has a dedicated repository with consistent methods:

- `findAll()` - List with pagination
- `findById()` - Single entity lookup
- `create()` - New entity creation
- `update()` - Entity updates
- `delete()` - Soft/hard deletion

### Component Patterns

#### Public Components (Astro)

- Icon components in `src/components/public/icons/` as individual Astro files
- Domain-specific components (species/, news/, protected-area/)
- Card components for list views
- Grid components for collections
- Filter components for search functionality

#### Management Components (React + shadcn/ui)

- Use shadcn/ui components for admin interfaces
- Follow MPA pattern with `client:load` directive
- Components receive data as props from Astro pages
- Form submissions use standard HTML forms (no SPA routing)
- Page reloads after mutations to reflect changes

### Development Standards

- No semicolons
- Single quotes for strings
- 120 character line width
- Trailing commas
- Prettier + ESLint configured
- TypeScript strict mode

### User Management

- **Location**: `/manage/users` (admin-only access)
- **Implementation**: React component with shadcn/ui (MPA pattern)
- **UI Components**:
  - Table component for user listing
  - Badge components for roles and status
  - DropdownMenu for role changes
  - Input and Select for filtering
  - Button components for pagination
- **Features**:
  - Search by name, email, username
  - Filter by role
  - Inline role editing via DropdownMenu
  - No separate edit page - changes happen directly in table
  - Visual role indicators with icons (Shield, Edit3, etc.)
- **Roles**: admin, content_editor, news_editor, areas_editor, species_editor, user
- **API Endpoints**:
  - `GET /api/manage/users` - List users with filters
  - `PATCH /api/manage/users/[id]/role` - Update user role

## shadcn/ui Integration

### Installation

```bash
# Add new components
npx shadcn@latest add [component-name]

# Components are installed to src/components/ui/
```

### Usage in Astro

```astro
---
import MyReactComponent from '@/components/manage/MyReactComponent'
---

<!-- Use client:load for immediate hydration in admin pages -->
<MyReactComponent client:load data={serverData} />
```

### MPA Considerations

- Server-side data fetching in Astro pages
- Props passed from Astro to React components
- Form submissions reload the page (no client-side routing)
- API calls can trigger page reloads for data refresh
- Maintains SEO benefits and fast initial loads

## News Management

- **Location**: `/manage/news`
- **Implementation**: React components with shadcn/ui following MPA pattern
- **Features**:
  - Draft/publish workflow with base content system
  - Rich text editing with Tiptap (typed block structure)
  - Automatic save on content changes
  - Lock system prevents concurrent editing
  - Media picker integration for images
  - Preview at `/content/news/preview/[id]`
  - Track local changes indicator for published content
- **Components**:
  - `NewsTable.tsx` - List view with truncated titles/summaries
  - `NewsForm.tsx` - Edit form with 2-column layout
  - `CreateNewsModal.tsx` - New article creation
  - `LockBanner.tsx` - Shows when content is locked by another user
  - `MediaPickerModal.tsx` - Reusable media selection from gallery
- **API Endpoints**:
  - `GET/POST /api/manage/news` - List and create
  - `PATCH/DELETE /api/manage/news/[id]` - Update and delete (delete requires admin role)
  - `POST /api/manage/news/[id]/image` - Upload featured image
  - `POST/DELETE /api/manage/news/[id]/lock` - Lock management
  - `POST /api/manage/news/[id]/publish-draft` - Publish draft changes
  - `POST /api/manage/news/[id]/discard-draft` - Discard draft changes

## Gallery Management

- **Location**: `/manage/gallery`
- **Implementation**: React component with drag-and-drop interface
- **Features**:
  - Folder-based organization (database only, files at R2 root)
  - Multi-file upload with WebP conversion
  - Drag-and-drop file management
  - Batch operations (delete, move)
  - File details view with metadata
  - Search and filter capabilities
  - Grid/List view toggle
- **Components**:
  - `GalleryExplorer.tsx` - Main gallery interface
  - `FileDetails.tsx` - File metadata and preview
  - `MediaPickerModal.tsx` - Reusable media picker for forms
- **API Endpoints**:
  - `GET /api/manage/gallery/browse` - Browse files with filters
  - `GET /api/manage/gallery/by-source` - Filter by source entity
  - `POST /api/manage/gallery/upload` - Upload new files
  - `GET/POST/PATCH/DELETE /api/manage/gallery/folders/[id]` - Folder CRUD
  - `PATCH/DELETE /api/manage/gallery/media/[id]` - File operations
  - `POST /api/manage/gallery/media/move` - Move files between folders
  - `POST /api/manage/gallery/media/batch-delete` - Delete multiple files

## Protected Areas Management

- **Location**: `/manage/protected-areas`
- **Implementation**: React components with shadcn/ui following MPA pattern
- **Features**:
  - Draft/publish workflow with base content system
  - Rich text editing with Tiptap
  - Single region selection (Chilean regions)
  - Centralized protected area types with colors
  - Gallery drag-and-drop integration
  - Media picker for featured image
  - Lock system prevents concurrent editing
  - Preview at `/content/protected-areas/preview/[id]`
- **Components**:
  - `ProtectedAreasTable.tsx` - List view with filters
  - `ProtectedAreaForm.tsx` - Edit form with gallery section
  - `CreateProtectedAreaModal.tsx` - New area creation
  - Utilizes centralized `protected-area-types.ts` for type definitions
  - Utilizes centralized `chile-regions.ts` for region data
- **API Endpoints**:
  - `GET/POST /api/manage/protected-areas` - List and create
  - `PATCH/DELETE /api/manage/protected-areas/[id]` - Update and delete
  - `POST /api/manage/protected-areas/[id]/image` - Upload featured image
  - `POST/DELETE /api/manage/protected-areas/[id]/lock` - Lock management
  - `POST /api/manage/protected-areas/[id]/publish-draft` - Publish draft
  - `POST /api/manage/protected-areas/[id]/discard-draft` - Discard draft

## Species Management

- **Location**: `/manage/species`
- **Implementation**: React components with shadcn/ui following MPA pattern
- **Features**:
  - Draft workflow (no publish system yet)
  - Rich text editing with Tiptap for multiple fields
  - Taxonomic information management
  - Conservation status tracking
  - Media picker integration
  - Gallery management
  - Lock system prevents concurrent editing
  - Preview at `/content/species/preview/[id]`
- **Components**:
  - `SpeciesTable.tsx` - List view with search
  - `SpeciesForm.tsx` - Comprehensive edit form
  - `CreateSpeciesModal.tsx` - New species creation
- **API Endpoints**:
  - `GET/POST /api/manage/species` - List and create
  - `PATCH/DELETE /api/manage/species/[id]` - Update and delete
  - `POST /api/manage/species/[id]/image` - Upload main image
  - `PATCH /api/manage/species/[id]/field` - Update specific fields
  - `POST/DELETE /api/manage/species/[id]/lock` - Lock management

## Important Notes

1. Database connections auto-switch between local Postgres and Neon based on environment
2. All protected routes must be under `/manage` or `/api/manage`
3. Content paths use `/content/` prefix for public navigation
4. Rich text editing uses Tiptap with typed block structure and unique block IDs
5. Conservation status follows Chilean classification system
6. Redis caching has 15-minute TTL for user data
7. Cloudflare R2 stores media files with public URL access
8. Spanish localization is primary language throughout the app
9. Management pages use React + shadcn/ui components with MPA pattern
10. Public pages remain pure Astro for optimal performance
11. All database access must go through repository pattern - no direct queries
12. Server-side image conversion to WebP using Sharp
13. Role-based permissions: admin can delete, content_editor has full access
14. **IMPORTANT**: Images are stored in R2 with folder organization
15. Image processing happens server-side during upload
16. Media folder organization is maintained in both database and R2 storage
17. Image URLs pattern: `[PUBLIC_R2_PUBLIC_URL]/path/to/image.webp`
18. All forms with media now use `MediaPickerModal` for consistent image selection
19. Tiptap content is converted to/from typed block structure using utilities in `tiptap-converter.ts`
20. Repository methods use Drizzle ORM's `count` utility instead of raw SQL for counting
21. Dark mode toggle uses class-based selection for multiple instance support

## Code Conventions

- **Import Paths**:
  - Use `@/` imports ONLY in React components (`*.tsx` files)
  - Use relative imports (`../`) in all other files (`*.ts`, `*.astro`)
  - This is enforced to maintain clear separation between React and non-React code
- **Type Annotations**:
  - Enhanced type safety with detailed type definitions
  - Use utility types from schema (e.g., `CreateFolderInput`, `RichContent`)
  - Proper null coalescing for optional fields
- **Component Patterns**:
  - Destructure props at function declaration
  - Remove unused state and props
  - Standardize event handling
- **Data Access**:
  - All database queries through repository pattern
  - Use Drizzle ORM utilities (avoid raw SQL)
  - Consistent method naming across repositories

## Security Configuration

### Route Blocking

The application includes a configurable route blocker middleware to prevent access to sensitive endpoints:

- **Configuration**: Set `BLOCKED_ROUTES` environment variable
- **Format**: Comma-separated list of routes
- **Wildcards**: Support for `*` at the end of routes (e.g., `/api/dev/*`)
- **Default**: `/api/dev/seed` is blocked by default
- **Response**: Returns 404 Not Found for blocked routes

Example configuration:

```env
BLOCKED_ROUTES=/api/dev/seed,/api/test/*,/api/internal/*
```

## Using Shared Package

The `@wildtrip/shared` package is available as a workspace dependency:

```typescript
// Import types
import { RichContent, ContentBlock } from '@wildtrip/shared/types'

// Import constants
import { CONSERVATION_STATUSES, CHILE_REGIONS } from '@wildtrip/shared/constants'

// Import utilities
import { formatDate, slugify } from '@wildtrip/shared/utils'
```

**Important:** When updating shared code, rebuild it with `pnpm --filter=shared build`

## Development Guidance

- **Database Operations Caution**:
  - No Drizzle operations (migrate, generate, push) should be performed without careful study and requirement verification
- **Shared Dependencies**: Always use types and constants from `@wildtrip/shared` instead of local duplicates
