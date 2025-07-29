# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the **shared** package in the Wildtrip monorepo.

## Package Overview

This is the shared package containing types, constants, and utilities used across all Wildtrip projects. It ensures type safety and consistency throughout the monorepo.

**Role in Monorepo:** Central source of truth for TypeScript types, application constants (regions, conservation statuses, etc.), and common utility functions.

## Development Commands

```bash
# Build the package
pnpm run build

# Watch mode (rebuilds on file changes)
pnpm run dev

# Type checking
pnpm run type-check

# Clean build artifacts
pnpm run clean
```

## Package Structure

```
shared/
├── src/
│   ├── types/              # TypeScript type definitions
│   │   ├── content.ts      # Rich content block types
│   │   └── index.ts        # Type exports
│   ├── constants/          # Application constants
│   │   ├── conservation-status.ts  # Conservation status definitions
│   │   ├── chile-regions.ts        # Chilean regions data
│   │   ├── species-groups.ts       # Species categorization
│   │   ├── protected-area-types.ts # Protected area types
│   │   └── index.ts               # Constant exports
│   ├── utils/              # Utility functions
│   │   └── index.ts        # formatDate, slugify, etc.
│   └── index.ts            # Main package exports
├── dist/                   # Compiled output (gitignored)
│   ├── *.js               # CommonJS modules
│   ├── *.mjs              # ES modules
│   └── *.d.ts             # TypeScript declarations
├── package.json
├── tsconfig.json          # TypeScript configuration
├── tsup.config.ts         # Build configuration
└── README.md
```

## Build Configuration

The package uses `tsup` for building with the following features:
- **Dual package support**: CommonJS and ESM
- **TypeScript declarations**: Full .d.ts files
- **Multiple entry points**: Main, types, constants, utils
- **Source maps**: For debugging
- **Tree-shaking ready**: Optimized imports

## Exported Content

### Types (`@wildtrip/shared/types`)

```typescript
// Content block types for rich text editor
export interface RichContent {
  blocks: ContentBlock[]
  version?: string
  meta?: {
    wordcount?: number
    charcount?: number
  }
}

export type ContentBlock = 
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | TableBlock
  | ListBlock
  | QuoteBlock
  | CodeBlock
  | HtmlBlock
```

### Constants (`@wildtrip/shared/constants`)

#### Conservation Status
```typescript
export const CONSERVATION_STATUSES: ConservationStatus[]
export function getConservationStatus(value: string): ConservationStatus | undefined
export function getConservationStatusLabel(value: string): string
```

#### Chile Regions
```typescript
export const CHILE_REGIONS: ChileRegion[]
export function getRegion(value: string): ChileRegion | undefined
export function getRegionLabel(value: string): string
export function getRegionWithNumber(value: string): string
```

#### Species Groups
```typescript
export const MAIN_GROUPS: MainGroup[]
export function getMainGroup(value: string): MainGroup | undefined
export function getMainGroupLabel(value: string): string
```

#### Protected Area Types
```typescript
export const PROTECTED_AREA_TYPES: ProtectedAreaType[]
export function getProtectedAreaType(value: string): ProtectedAreaType | undefined
export function getProtectedAreaTypeLabel(value: string): string
```

### Utilities (`@wildtrip/shared/utils`)

```typescript
// Format date to Spanish locale
export function formatDate(date: Date | string): string

// Convert text to URL-friendly slug
export function slugify(text: string): string
```

## Usage in Other Projects

### Installation
The package is automatically available in workspace projects:

```json
{
  "dependencies": {
    "@wildtrip/shared": "workspace:*"
  }
}
```

### Import Examples

```typescript
// Import everything
import * as shared from '@wildtrip/shared'

// Import specific modules
import { RichContent } from '@wildtrip/shared/types'
import { CHILE_REGIONS, getRegion } from '@wildtrip/shared/constants'
import { formatDate } from '@wildtrip/shared/utils'

// Import from main entry
import { 
  RichContent, 
  CONSERVATION_STATUSES,
  slugify 
} from '@wildtrip/shared'
```

## Adding New Exports

1. **Create the source file** in the appropriate directory
2. **Export from the category index** (types/index.ts, etc.)
3. **Build the package** with `pnpm run build`
4. **Update dependent projects** if needed

Example: Adding a new constant
```typescript
// 1. Create src/constants/new-constant.ts
export const MY_CONSTANT = ['value1', 'value2']

// 2. Add to src/constants/index.ts
export * from './new-constant'

// 3. Build
pnpm run build
```

## Development Workflow

1. **Make changes** to source files
2. **Run build** to compile: `pnpm run build`
3. **Test in dependent project** by importing
4. **Use watch mode** for active development: `pnpm run dev`

## Type Safety Guidelines

1. **Always export interfaces** for complex types
2. **Use const assertions** for literal types
3. **Document types** with JSDoc comments
4. **Avoid any** - be explicit with types
5. **Export utility type guards** when helpful

## Versioning

Currently at v1.0.0. When making breaking changes:
1. Update version in package.json
2. Document breaking changes
3. Update dependent projects

## Common Issues

### Build Errors
- Run `pnpm run clean` then `pnpm run build`
- Check for circular dependencies
- Ensure all imports are valid

### Type Errors in Dependent Projects
- Rebuild shared: `pnpm run build`
- Restart TypeScript server in IDE
- Check import paths are correct

### Import Not Found
- Verify export in appropriate index file
- Check the package.json exports field
- Ensure build completed successfully

## Future Enhancements

- [ ] Add more utility functions as needed
- [ ] Consider adding validation schemas (Zod)
- [ ] Add constants for other repeated values
- [ ] Consider i18n support for labels
- [ ] Add unit tests for utilities

## Notes

- Keep this package focused on truly shared code
- Avoid framework-specific code (React, Astro, etc.)
- Maintain backward compatibility when possible
- Document all public APIs
- Use pure functions for utilities