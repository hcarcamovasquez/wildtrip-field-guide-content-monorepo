# @wildtrip/shared

Paquete compartido con tipos, constantes y utilidades para el monorepo de Wildtrip.

## Instalación

Este paquete se instala automáticamente como dependencia del workspace:

```json
{
  "dependencies": {
    "@wildtrip/shared": "workspace:*"
  }
}
```

## Uso

### Types

```typescript
import { RichContent, ContentBlock, ParagraphBlock } from '@wildtrip/shared/types'
// o
import { RichContent } from '@wildtrip/shared'
```

### Constants

```typescript
import { CONSERVATION_STATUSES, getConservationStatus } from '@wildtrip/shared/constants'
import { CHILE_REGIONS, getRegion } from '@wildtrip/shared/constants'
import { MAIN_GROUPS, getMainGroup } from '@wildtrip/shared/constants'
import { PROTECTED_AREA_TYPES, getProtectedAreaType } from '@wildtrip/shared/constants'
```

### Utils

```typescript
import { formatDate, slugify } from '@wildtrip/shared/utils'
```

## Estructura

```
src/
├── types/         # Tipos TypeScript compartidos
│   ├── content.ts # Tipos de bloques de contenido
│   └── index.ts
├── constants/     # Constantes compartidas
│   ├── conservation-status.ts
│   ├── chile-regions.ts
│   ├── species-groups.ts
│   ├── protected-area-types.ts
│   └── index.ts
├── utils/         # Funciones utilitarias
│   └── index.ts
└── index.ts       # Entry point principal
```

## Desarrollo

```bash
# Compilar
pnpm run build

# Compilar en modo watch
pnpm run dev

# Verificar tipos
pnpm run type-check

# Limpiar build
pnpm run clean
```

## Agregar nuevos exports

1. Crear el archivo en la carpeta correspondiente (`types/`, `constants/`, `utils/`)
2. Exportar desde el `index.ts` de esa carpeta
3. Ejecutar `pnpm run build` para compilar
4. Los cambios estarán disponibles automáticamente en los otros proyectos