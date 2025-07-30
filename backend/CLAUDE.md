# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the **backend** project in the Wildtrip monorepo.

## Project Overview

This is the API backend for the Wildtrip application built with NestJS, handling all API endpoints, database operations, authentication validation, image processing, and integration with external services.

**Role in Monorepo:** This project serves as the central API for both the public web application and the admin dashboard.

## Current Status

✅ **Backend Operational**: NestJS backend with core functionality implemented.

### Implemented Features:
- Cookie-parser for session management
- Clerk authentication with guards and decorators
- Database connection with Drizzle ORM
- Species, News, and Protected Areas modules
- Public and protected API endpoints
- Draft/publish system for content
- Role-based access control
- Gallery module with R2 storage integration
- Image processing with Sharp (WebP conversion)
- Lock system for concurrent editing (15-minute locks)
- Folder-based media organization
- AI module with Cloudflare AI integration for SEO generation
- User management module

### Pending Features:
- Redis caching implementation
- Webhooks for Clerk sync

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (port 3000)
pnpm run start:dev

# Build for production
pnpm run build

# Run in production
pnpm run start:prod

# Database operations
pnpm run db:generate   # Generate migrations
pnpm run db:migrate    # Run migrations
pnpm run db:push       # Push schema (dev)
pnpm run db:studio     # Drizzle Studio
```

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk Backend SDK
- **Validation**: class-validator & class-transformer
- **Cache**: Upstash Redis (pending)
- **File Storage**: Cloudflare R2 (pending)
- **Image Processing**: Sharp (pending)
- **Shared Package**: `@wildtrip/shared` for types and constants
- **Language**: TypeScript

## Project Structure

```
backend/
├── src/
│   ├── auth/                # Authentication guards and decorators
│   │   ├── guards/
│   │   │   ├── clerk-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   └── auth.module.ts
│   ├── config/              # Configuration
│   │   └── configuration.ts
│   ├── db/                  # Database
│   │   ├── schema/          # Drizzle schemas
│   │   │   ├── users.ts
│   │   │   ├── species.ts
│   │   │   ├── news.ts
│   │   │   ├── protectedAreas.ts
│   │   │   ├── mediaGallery.ts
│   │   │   ├── mediaFolders.ts
│   │   │   └── index.ts
│   │   ├── db.module.ts
│   │   └── db.service.ts
│   ├── species/             # Species module
│   │   ├── dto/
│   │   ├── species.controller.ts
│   │   ├── species.service.ts
│   │   ├── species.repository.ts
│   │   └── species.module.ts
│   ├── news/                # News module
│   │   ├── dto/
│   │   ├── news.controller.ts
│   │   ├── news.service.ts
│   │   ├── news.repository.ts
│   │   └── news.module.ts
│   ├── protected-areas/     # Protected Areas module
│   │   ├── dto/
│   │   ├── protected-areas.controller.ts
│   │   ├── protected-areas.service.ts
│   │   ├── protected-areas.repository.ts
│   │   └── protected-areas.module.ts
│   ├── gallery/             # Gallery module
│   │   ├── dto/
│   │   ├── gallery.controller.ts
│   │   ├── gallery.service.ts
│   │   ├── gallery.repository.ts
│   │   └── gallery.module.ts
│   ├── storage/             # Storage services
│   │   ├── r2.service.ts
│   │   ├── image-processor.service.ts
│   │   └── storage.module.ts
│   ├── locks/               # Lock system
│   │   ├── locks.service.ts
│   │   └── locks.module.ts
│   ├── ai/                  # AI module
│   │   ├── dto/
│   │   ├── ai.controller.ts
│   │   ├── ai.service.ts
│   │   └── ai.module.ts
│   ├── users/               # Users module
│   │   ├── dto/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   └── users.module.ts
│   ├── seed/                # Database seeding
│   │   ├── seed.controller.ts
│   │   ├── seed.service.ts
│   │   ├── seed-data.ts
│   │   └── seed.module.ts
│   ├── utils/               # Utilities
│   │   └── username-generator.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts              # Application entry point
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── .env.example
```

## API Endpoints

### Public Endpoints (No Auth Required)
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

### Protected Endpoints (Auth Required)
```
# Species (Roles: admin, content_editor, species_editor)
POST   /api/species
PATCH  /api/species/:id
DELETE /api/species/:id         # Admin only

# Protected Areas (Roles: admin, content_editor, areas_editor)
POST   /api/protected-areas
PATCH  /api/protected-areas/:id
DELETE /api/protected-areas/:id  # Admin only
POST   /api/protected-areas/:id/publish
POST   /api/protected-areas/:id/draft
POST   /api/protected-areas/:id/discard-draft

# News (Roles: admin, content_editor, news_editor)
POST   /api/news
PATCH  /api/news/:id
DELETE /api/news/:id            # Admin only
POST   /api/news/:id/publish
POST   /api/news/:id/draft
POST   /api/news/:id/discard-draft

# Gallery (Roles: admin, content_editor, all editors)
GET    /api/gallery/browse
GET    /api/gallery/by-ids
GET    /api/gallery/media/:id
POST   /api/gallery/upload
PATCH  /api/gallery/media/:id
DELETE /api/gallery/media/:id
POST   /api/gallery/media/batch-delete
POST   /api/gallery/media/move
GET    /api/gallery/folders
GET    /api/gallery/folders/:id
POST   /api/gallery/folders
PATCH  /api/gallery/folders/:id
DELETE /api/gallery/folders/:id  # Admin only

# Locks (Available for species, news, protected-areas)
POST   /api/{entity}/:id/lock
DELETE /api/{entity}/:id/lock
GET    /api/{entity}/:id/lock

# AI (Roles: admin, content_editor, specific editors)
POST   /api/ai/generate-seo/news        # news_editor
POST   /api/ai/generate-seo/species     # species_editor
POST   /api/ai/generate-seo/protected-areas # areas_editor

# Users (Roles: admin for modifications)
GET    /api/users               # List all users
GET    /api/users/me            # Current user info
GET    /api/users/stats         # User statistics
GET    /api/users/:id           # Get user by ID
PATCH  /api/users/:id           # Update user (admin only)

# Development (Admin only, dev environment)
POST   /api/dev/seed            # Seed database
DELETE /api/dev/clear           # Clear database
```

## Authentication

The backend uses Clerk for authentication with cookie-based sessions:

1. **Cookie Parser**: Reads `__session` cookie from requests
2. **ClerkAuthGuard**: Verifies JWT tokens and fetches user data
3. **RolesGuard**: Checks user roles for authorization
4. **CurrentUser Decorator**: Provides access to authenticated user in controllers

```typescript
// Example protected endpoint
@Post()
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles('admin', 'content_editor')
create(@Body() dto: CreateDto, @CurrentUser() user: ICurrentUser) {
  // user object contains: id, email, role, etc.
}
```

## Database Schema

Using Drizzle ORM with PostgreSQL:

- **users**: Synced with Clerk, stores roles and profiles
- **species**: Species with taxonomic data and rich content
- **news**: Articles with draft/publish workflow
- **protectedAreas**: Parks and reserves with visitor info
- **mediaGallery**: Image storage metadata with R2 URLs
- **mediaFolders**: Hierarchical folder organization

All content tables support:
- Draft/publish workflow ✅
- Lock system with 15-minute expiration ✅
- SEO metadata ✅
- Rich content blocks ✅
- Automatic slug generation ✅

## Using Shared Package

```typescript
// Import types
import { RichContent, ContentBlock } from '@wildtrip/shared/types'

// Import constants for validation
import { 
  CONSERVATION_STATUSES,
  CHILE_REGIONS,
  MAIN_GROUPS,
  PROTECTED_AREA_TYPES
} from '@wildtrip/shared/constants'

// Import utilities
import { slugify, formatDate } from '@wildtrip/shared/utils'
```

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:4321,http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wildtrip

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_...

# Redis (Upstash) - pending implementation
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Cloudflare R2 Storage - pending implementation
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
PUBLIC_R2_PUBLIC_URL=https://...

# Cloudflare AI
CLOUDFLARE_IA_API_ID=...
CLOUDFLARE_IA_API_TOKEN=...
```

## Development Guidelines

1. **Module Structure**:
   - Each resource has its own module
   - Repository pattern for data access
   - Service layer for business logic
   - Controller for HTTP handling
   - DTOs for validation

2. **Error Handling**:
   - Use NestJS built-in exceptions
   - Repository methods return null/undefined when not found
   - Services throw NotFoundException
   - Global validation pipe handles DTO validation

3. **Database Queries**:
   - All queries through repositories
   - Use Drizzle's query builder
   - Pagination included in list endpoints
   - Consistent response format

4. **Authentication**:
   - Public endpoints: No guards
   - Protected endpoints: Use both ClerkAuthGuard and RolesGuard
   - Access user data with @CurrentUser() decorator

## Features Implemented

1. **Gallery Module** ✅:
   - File upload with Multer
   - Image processing with Sharp (auto WebP conversion)
   - R2 storage integration with Cloudflare
   - Hierarchical folder management
   - Batch operations (delete, move)
   - Metadata and tagging support

2. **Lock System** ✅:
   - Prevents concurrent editing
   - 15-minute auto-expiring locks
   - Lock status endpoints
   - User-specific lock management

3. **AI Integration** ✅:
   - Cloudflare AI Workers for SEO generation
   - Automatic SEO content generation for news, species, and protected areas
   - Support for Spanish language optimization
   - Integration with Llama 3.1 model

4. **User Management** ✅:
   - User listing with search and filters
   - Role management (admin only)
   - Username generation for new users
   - User statistics endpoint
   - Integration with Clerk for authentication

5. **Database Seeding** ✅:
   - Development seed data for all entities
   - Clear database functionality
   - Protected endpoints (admin only, dev environment)

## Optional Features (Not Critical)

1. **Redis Caching**:
   - Would improve performance for frequently accessed data
   - Not required for basic functionality

2. **Clerk Webhooks**:
   - Would enable real-time user sync
   - Current implementation syncs on first login

3. **Advanced Search**:
   - Full-text search across entities
   - More complex filtering options

## Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## Notes

- All endpoints return consistent pagination format
- Slug generation is automatic from names/titles
- Draft system allows saving changes without publishing
- Role-based permissions are enforced at controller level
- Database connection uses connection pooling
- Cookie session management is configured for Clerk integration