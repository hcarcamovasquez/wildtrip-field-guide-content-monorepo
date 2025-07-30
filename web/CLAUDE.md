# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the **web** project in the Wildtrip monorepo.

## Project Overview

This is the public-facing Wildtrip Guia de Campo web application - a biodiversity portal for Chile. It's built with Astro for optimal performance, using SSG for content pages and minimal JavaScript.

**Role in Monorepo:** This project handles all public-facing content display, authentication UI (Clerk), and redirects authenticated users to the admin panel. All management functionality has been moved to the separate dashboard project.

## Current Status

✅ **Migration Complete**: All management code has been removed. The web project now only contains:
- Public content pages (species, news, protected areas)
- Authentication pages (sign-in, sign-up)
- API client to fetch data from backend
- No direct database access
- No management/admin functionality

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

## Environment Setup

Create a `.env` file with these required variables:

```env
# Authentication (Clerk)
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# External Services URLs
PUBLIC_API_URL=http://localhost:3000
PUBLIC_ADMIN_URL=http://localhost:5173

# Server Configuration (for production)
PORT=4321
HOST=0.0.0.0
```

## Architecture

### Tech Stack

- **Framework**: Astro v5 with SSR
- **Deployment**: Railway (Node.js adapter)
- **Auth**: Clerk (Spanish localization)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Icons**: Lucide React
- **Language**: TypeScript
- **Shared Package**: `@wildtrip/shared` for types and constants
- **API Client**: Consumes backend API for all data

### Key Directories

```
web/
├── src/
│   ├── pages/              # File-based routing
│   │   ├── content/        # Public content pages
│   │   │   ├── species/    # Species catalog and details
│   │   │   ├── protected-areas/ # Protected areas pages
│   │   │   └── news/       # News articles
│   │   ├── sign-in/        # Clerk authentication
│   │   ├── sign-up/        # Clerk registration
│   │   └── index.astro     # Homepage
│   ├── components/         
│   │   ├── public/         # Public UI components (Astro)
│   │   └── ui/             # shadcn/ui components
│   ├── layouts/            # Page layouts
│   └── lib/
│       ├── api/            # API client for backend
│       ├── public/         # Public repositories (use API)
│       └── utils/          # Utility functions
```

## Public Features

### Authentication Pages

The web project provides authentication UI using Clerk:

- **Sign In**: `/sign-in` - Clerk-hosted sign-in page
- **Sign Up**: `/sign-up` - Clerk-hosted sign-up page
- **After Auth**: Redirects to dashboard at `PUBLIC_ADMIN_URL`

### Public Content Pages

#### News (`/content/news`)
- List of published articles with pagination
- Article detail pages with rich content
- Tag filtering
- SEO optimized meta tags
- Share buttons

#### Protected Areas (`/content/protected-areas`)
- Catalog of protected areas
- Detail pages with visitor information
- Filtering by region and type
- Image galleries
- Location information

#### Species (`/content/species`)
- Species catalog with filtering
- Detailed species pages
- Filtering by group and conservation status
- Taxonomic information display
- Distribution information
- Image galleries

## Development Guidelines

1. **TypeScript First**: Always use TypeScript for new code
2. **API Data Only**: All data must be fetched through the backend API
3. **SSG Priority**: Use static generation when possible
4. **Minimal JavaScript**: Only use client-side JS when necessary
5. **SEO Focused**: Implement proper meta tags and structured data
6. **Accessibility**: Follow WCAG guidelines
7. **Performance**: Keep bundle size minimal
8. **Responsive**: Mobile-first design approach

## Code Style

- No semicolons
- Single quotes for strings
- 120 character line width
- Trailing commas
- Prettier + ESLint configured
- TypeScript strict mode

## React Component Usage

React components are used sparingly for interactive elements:

```astro
---
import FilterComponent from '@/components/public/news/NewsFiltersMobile'
---

<!-- Use client:visible for better performance -->
<FilterComponent client:visible filters={filters} />

<!-- Use client:idle for non-critical components -->
<ShareButtons client:idle url={shareUrl} />
```

## API Integration

All data is fetched through the API client:

```typescript
// In Astro pages
---
import { apiClient } from '@/lib/api/client'

const species = await apiClient.species.findAll({
  page: 1,
  limit: 20,
  mainGroup: 'mammal'
})
---
```

## Deployment

The project is configured for deployment to Railway:

1. Uses Node.js adapter for SSR support
2. Handles authentication redirects
3. Serves static assets efficiently
4. Environment variables managed through Railway

## Performance Considerations

1. **Image Optimization**: Use Cloudflare R2 CDN URLs with resizing
2. **Lazy Loading**: Images use loading="lazy" by default
3. **Minimal JS**: Only load React components when necessary
4. **Static First**: Pre-render all public content pages
5. **API Caching**: Leverage backend caching strategies

## SEO Implementation

1. **Meta Tags**: Proper title, description, and keywords
2. **Open Graph**: Social media preview tags
3. **Structured Data**: JSON-LD for species and articles
4. **Sitemap**: Auto-generated sitemap.xml
5. **Robots.txt**: Proper crawling directives

## Notes

- No direct database access - all data via API
- No management features - use dashboard project
- Authentication only for redirecting to admin
- Focus on public content and performance
- Minimal client-side JavaScript