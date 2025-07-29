# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the **dashboard** project in the Wildtrip monorepo.

## Project Overview

This is the React-based admin dashboard for managing Wildtrip content. Built with Vite, React, and shadcn/ui, it provides a rich interface for content management.

**Role in Monorepo:** This project will handle all administrative functions including species management, protected areas, news articles, media gallery, and user management. It communicates with the backend API and uses shared types from `@wildtrip/shared`.

## Current Status

⚠️ **Migration In Progress**: This project is being migrated from the Astro-based management system. Currently contains minimal Vite setup.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (port 5173)
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## Tech Stack (Planned)

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Rich Text Editor**: Tiptap
- **Authentication**: Clerk React SDK
- **Shared Package**: `@wildtrip/shared` for types and constants

## Project Structure (Planned)

```
dashboard/
├── src/
│   ├── pages/              # Route components
│   │   ├── species/
│   │   ├── protected-areas/
│   │   ├── news/
│   │   ├── gallery/
│   │   └── users/
│   ├── components/         # Reusable components
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── modals/
│   │   └── ui/            # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and helpers
│   │   ├── api/          # API client
│   │   └── auth/         # Auth utilities
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Migration Tasks

### Phase 1: Setup
- [ ] Configure TypeScript with strict mode
- [ ] Setup Tailwind CSS v4
- [ ] Install and configure shadcn/ui
- [ ] Setup React Router
- [ ] Configure Clerk authentication
- [ ] Create API client for backend communication

### Phase 2: Core Components
- [ ] Migrate layout components (headers, sidebars)
- [ ] Setup routing structure
- [ ] Create authentication wrapper
- [ ] Implement error boundaries

### Phase 3: Feature Migration
- [ ] Species management
- [ ] Protected areas management
- [ ] News management
- [ ] Media gallery
- [ ] User management

### Phase 4: Advanced Features
- [ ] Tiptap rich text editor integration
- [ ] Draft/publish workflow
- [ ] Lock system for concurrent editing
- [ ] Real-time updates (optional)

## Using Shared Package

```typescript
// Import types
import { RichContent, ContentBlock } from '@wildtrip/shared/types'

// Import constants
import { 
  CONSERVATION_STATUSES, 
  CHILE_REGIONS,
  MAIN_GROUPS,
  PROTECTED_AREA_TYPES
} from '@wildtrip/shared/constants'

// Import utilities
import { formatDate, slugify } from '@wildtrip/shared/utils'
```

## API Integration

The dashboard will communicate with the backend API:

```typescript
// Example API client setup
import { createAPIClient } from '@/lib/api/client'

const api = createAPIClient({
  baseURL: import.meta.env.VITE_API_URL,
  // Auth headers will be added by Clerk
})

// Usage in components
const { data: species } = useQuery({
  queryKey: ['species'],
  queryFn: () => api.species.findAll()
})
```

## Authentication Flow

1. User loads dashboard
2. Clerk checks authentication status
3. If not authenticated, redirect to web project's sign-in page
4. If authenticated, allow access and add auth headers to API requests

## Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3000

# Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Public Web URL (for redirects)
VITE_WEB_URL=http://localhost:4321
```

## Development Guidelines

1. **Component Organization**:
   - Page components in `src/pages/`
   - Reusable components in `src/components/`
   - UI primitives in `src/components/ui/`

2. **State Management**:
   - Server state with TanStack Query
   - Local state with React hooks
   - Form state with React Hook Form

3. **Type Safety**:
   - Always use types from `@wildtrip/shared`
   - Define component props interfaces
   - Use Zod for runtime validation

4. **Code Style**:
   - Use `@/` imports for absolute paths
   - Functional components with hooks
   - Named exports for components

## Key Features to Implement

1. **Data Tables**: Sortable, filterable tables with pagination
2. **Forms**: Multi-step forms with validation
3. **Media Picker**: Modal for selecting images from gallery
4. **Rich Text Editor**: Tiptap with custom extensions
5. **Notifications**: Toast notifications for actions
6. **Loading States**: Skeletons and spinners
7. **Error Handling**: User-friendly error messages

## Notes

- All management functionality will be moved here from the web project
- The dashboard is a pure SPA with no SSR requirements
- Focus on rich interactions and smooth UX
- Optimize for desktop usage (admin panel)