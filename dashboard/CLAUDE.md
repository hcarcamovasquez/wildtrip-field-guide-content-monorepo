# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the **dashboard** project in the Wildtrip monorepo.

## Project Overview

This is the React-based admin dashboard for managing Wildtrip content. Built with Vite, React, and shadcn/ui, it provides a rich interface for content management.

**Role in Monorepo:** This project will handle all administrative functions including species management, protected areas, news articles, media gallery, and user management. It communicates with the backend API and uses shared types from `@wildtrip/shared`.

## Current Status (Enero 2025)

✅ **Migration Complete**: Dashboard is fully functional with all management features migrated from the web project.

### Completed:
- ✅ React + TypeScript setup with Vite
- ✅ React Router v6 configuration
- ✅ Clerk authentication integration
- ✅ API client with all endpoints
- ✅ All pages implemented (Species, News, Protected Areas, Gallery, Users)
- ✅ Layout with responsive navigation
- ✅ Query client setup with TanStack Query
- ✅ Tailwind CSS v4 setup with Vite plugin
- ✅ shadcn/ui components integrated
- ✅ All management components migrated from web project
- ✅ TipTap rich text editor with all extensions
- ✅ Media picker modal
- ✅ Data tables with sorting and filtering
- ✅ Form components with validation
- ✅ JSZip for batch downloads

### Recent Updates:
- All imports now use `@wildtrip/shared` for types and constants
- `@wildtrip/shared` added as dependency in package.json
- Fixed compatibility with latest API response format
- Image display components properly handle CDN URLs

### Known Issues:
- Some endpoints in backend need to be exposed (locks, drafts)
- Form validation with React Hook Form + Zod pending (using HTML5 validation currently)

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

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Rich Text Editor**: Tiptap
- **Authentication**: Clerk React SDK
- **Shared Package**: `@wildtrip/shared` for types and constants

## Project Structure

```
dashboard/
├── src/
│   ├── pages/              # Route components ✅
│   │   ├── species/
│   │   ├── protected-areas/
│   │   ├── news/
│   │   ├── gallery/
│   │   └── users/
│   ├── components/         # Reusable components ✅
│   │   ├── manage/         # Management UI components
│   │   └── ui/            # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and helpers ✅
│   │   ├── api/          # API client
│   │   └── utils/        # Various utilities
│   ├── types/             # TypeScript interfaces
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Migration Status

### ✅ Completed:
- [x] Configure TypeScript with strict mode
- [x] Setup Tailwind CSS v4 with Vite plugin
- [x] Install and configure shadcn/ui
- [x] Setup React Router v6
- [x] Configure Clerk authentication
- [x] Create API client for backend communication
- [x] Migrate all layout components
- [x] Setup complete routing structure
- [x] Create authentication wrapper
- [x] Species management page and components
- [x] Protected areas management
- [x] News management
- [x] Media gallery with folder support
- [x] User management
- [x] TipTap rich text editor integration
- [x] Draft/publish workflow UI
- [x] Lock system UI for concurrent editing
- [x] All management components from web project

### 🚧 Pending Improvements:
- [ ] React Hook Form + Zod for advanced validation
- [ ] More sophisticated error boundaries
- [ ] Real-time updates with WebSockets (optional)
- [ ] Advanced caching strategies

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

- All management functionality has been successfully migrated from the web project ✅
- The dashboard is a pure SPA with no SSR requirements ✅
- Rich interactions with TipTap editor, media picker, and data tables ✅
- Optimized for desktop usage with responsive design ✅
- API client uses Vite proxy in development for CORS handling ✅
- All components use TypeScript for type safety ✅

## Important Implementation Details

1. **API Client**: Uses empty base URL in development to leverage Vite proxy
2. **Authentication**: Cookies are sent automatically with `withCredentials: true`
3. **Image Handling**: Uses Cloudflare R2 with image resizing via CDN
4. **State Management**: TanStack Query for server state, React hooks for local state
5. **Routing**: All routes are protected by authentication check

## Critical Image Display Rules

**IMPORTANT**: Images from the API come with full CDN URLs. In the dashboard:

1. **Display images directly** from the URLs provided by the API
2. **Do NOT construct URLs** - the backend provides complete URLs
3. **For thumbnails**, append Cloudflare Image Resizing parameters:
   ```typescript
   const thumbnailUrl = `${imageUrl}?width=200&height=200&fit=cover`
   ```

### Image Upload Flow
1. Upload images through `/api/gallery/upload`
2. Backend converts to WebP and stores in R2
3. Response includes full CDN URL
4. Use this URL directly in UI components

### Gallery Components
- `ImageGalleryManager`: Handles batch uploads and gallery management
- `MediaPickerModal`: Allows selecting images from existing gallery
- Both components handle full URLs from the API