# Wildtrip Field Guide Content Monorepo Guidelines

This document provides essential information for developers working on the Wildtrip Field Guide Content Management System monorepo.

## Project Structure

This is a monorepo managed with pnpm workspaces, containing the following packages:

- **shared**: Common types, constants, and utilities used across the project
- **web**: Frontend application built with Astro and React
- **backend**: API server built with NestJS
- **dashboard**: Admin dashboard interface

## Build and Configuration Instructions

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Initial Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

### Development Workflow

1. Start all services in development mode:
   ```bash
   pnpm dev
   ```

2. Start individual services:
   ```bash
   # Shared package
   pnpm dev:shared
   
   # Web application
   pnpm dev:web
   
   # Backend API
   pnpm dev:backend
   
   # Dashboard
   pnpm dev:dashboard
   ```

### Building for Production

1. Build all packages:
   ```bash
   pnpm build
   ```

2. Build individual packages:
   ```bash
   pnpm build:shared
   pnpm build:web
   pnpm build:backend
   pnpm build:dashboard
   ```

### Starting Production Services

1. Start all services:
   ```bash
   pnpm start
   ```

2. Start individual services:
   ```bash
   pnpm start:web
   pnpm start:backend
   pnpm start:dashboard
   ```

## Database Configuration

The project uses Drizzle ORM with a PostgreSQL database (likely Neon DB based on dependencies).

### Database Commands

Available in both web and backend packages:

- Generate migrations: `pnpm db:generate`
- Run migrations: `pnpm db:migrate`
- Push schema changes: `pnpm db:push`
- Open Drizzle Studio: `pnpm db:studio`

## Testing Information

### Backend Testing (NestJS with Jest)

The backend package uses Jest for testing.

#### Running Backend Tests

```bash
# Run all tests
cd backend && pnpm test

# Run tests in watch mode
cd backend && pnpm test:watch

# Run tests with coverage
cd backend && pnpm test:cov

# Run end-to-end tests
cd backend && pnpm test:e2e
```

#### Backend Test Structure

- **Unit Tests**: Located alongside the source files with `.spec.ts` extension
- **E2E Tests**: Located in the `test` directory with `.e2e-spec.ts` extension

#### Example: Creating a Backend Unit Test

1. Create a utility function in `backend/src/utils/string-utils.ts`:

```typescript
/**
 * Capitalizes the first letter of a string
 */
export function capitalizeFirstLetter(str: string | null): string | null {
  if (str === null || str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

2. Create a test file `backend/src/utils/string-utils.spec.ts`:

```typescript
import { capitalizeFirstLetter } from './string-utils';

describe('String Utils', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
    });

    it('should return empty string if input is empty', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });

    it('should return null if input is null', () => {
      expect(capitalizeFirstLetter(null)).toBe(null);
    });
  });
});
```

3. Run the test:

```bash
cd backend && pnpm test src/utils/string-utils.spec.ts
```

### Frontend Testing (Astro with Playwright)

The web package has Playwright installed for end-to-end testing, but no tests have been implemented yet.

#### Setting Up Frontend Tests

1. Create a test directory:

```bash
mkdir -p web/tests
```

2. Create a Playwright configuration file `web/playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm run preview',
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
});
```

3. Add a test script to `web/package.json`:

```json
"scripts": {
  "test": "playwright test"
}
```

## Code Style and Development Guidelines

### TypeScript Configuration

- The project uses TypeScript with strict type checking enabled.
- Each package has its own `tsconfig.json` file.
- The shared package is built with tsup and exports multiple entry points.

### Linting and Formatting

- ESLint is used for linting with a configuration that extends Prettier.
- Prettier is used for code formatting.
- Run linting: `pnpm lint`
- Run formatting: `pnpm format`
- Run type checking: `pnpm type-check`

### Content Model

The project includes a rich content model defined in the shared package, with support for various content block types compatible with TinyMCE/TipTap:

- Paragraphs
- Headings
- Images
- Tables
- Lists
- Quotes
- Code blocks
- HTML blocks

### Authentication

The project uses Clerk for authentication in both the web and backend packages.

### File Storage

AWS S3 is used for file storage, with Sharp for image processing.

### Caching

Upstash Redis is used for caching in both the web and backend packages.

## Debugging Tips

- Use `pnpm dev` to start all services with concurrently, which provides color-coded logs.
- For backend debugging, use `pnpm start:debug` to enable the Node.js inspector.
- For test debugging, use `pnpm test:debug`.