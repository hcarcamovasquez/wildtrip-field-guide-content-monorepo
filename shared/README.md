# @wildtrip/shared

Paquete compartido con tipos TypeScript, constantes y utilidades para el monorepo de Wildtrip.

## 📦 Instalación

Este paquete está automáticamente disponible en los proyectos del workspace:

```json
{
  "dependencies": {
    "@wildtrip/shared": "workspace:*"
  }
}
```

## 🚀 Uso

### Importar todo
```typescript
import * as shared from '@wildtrip/shared'
```

### Importar tipos específicos
```typescript
import { RichContent, ContentBlock } from '@wildtrip/shared/types'
import type { ConservationStatus, MainGroup } from '@wildtrip/shared'
```

### Importar constantes
```typescript
import { 
  CHILE_REGIONS, 
  CONSERVATION_STATUSES,
  MAIN_GROUPS,
  PROTECTED_AREA_TYPES,
  NEWS_CATEGORIES 
} from '@wildtrip/shared/constants'

// Funciones helper
import { 
  getRegion,
  getConservationStatus,
  getMainGroupLabel 
} from '@wildtrip/shared'
```

### Importar utilidades
```typescript
import { formatDate, slugify } from '@wildtrip/shared/utils'
```

## 📁 Estructura

```
shared/
├── src/
│   ├── types/              # Definiciones TypeScript
│   │   ├── content.ts      # Tipos de contenido rico
│   │   └── index.ts        # Re-exports
│   ├── constants/          # Constantes de la aplicación
│   │   ├── chile-regions.ts
│   │   ├── conservation-status.ts
│   │   ├── species-groups.ts
│   │   ├── protected-area-types.ts
│   │   ├── news-categories.ts
│   │   └── index.ts
│   ├── utils/              # Funciones utilitarias
│   │   └── index.ts
│   └── index.ts            # Entry point principal
├── dist/                   # Build output (gitignored)
├── package.json
├── tsconfig.json
└── tsup.config.ts         # Configuración de build
```

## 🛠️ Desarrollo

```bash
# Construir el paquete
pnpm build

# Modo watch (reconstruye en cambios)
pnpm dev

# Type checking
pnpm type-check

# Limpiar artifacts de build
pnpm clean
```

## 📝 Tipos Exportados

### Content Types

```typescript
// Bloque de contenido
export interface ContentBlock {
  id: string
  type: 'paragraph' | 'heading' | 'image' | 'list' | 'blockquote' | 'code' | 'table' | 'html'
  // ... propiedades específicas por tipo
}

// Contenido rico
export interface RichContent {
  blocks: ContentBlock[]
  version?: string
  meta?: {
    wordcount?: number
    charcount?: number
  }
}
```

### Conservation Status

```typescript
export interface ConservationStatus {
  value: string
  label: string
  emoji: string
  color: string
  bgClass: string
  textClass: string
  darkBgClass: string
  darkTextClass: string
}
```

### Regiones de Chile

```typescript
export interface ChileRegion {
  value: string
  label: string
  number: string
}
```

## 🔧 Configuración de Build

El paquete usa `tsup` para generar:
- CommonJS (`.js`)
- ES Modules (`.mjs`)
- TypeScript declarations (`.d.ts`)

Múltiples entry points para optimización:
- Main: Todo el paquete
- `/types`: Solo tipos
- `/constants`: Solo constantes
- `/utils`: Solo utilidades

## ➕ Agregar Nuevas Exportaciones

### 1. Agregar nueva constante

```typescript
// src/constants/mi-constante.ts
export const MI_CONSTANTE = {
  valor1: 'algo',
  valor2: 'otro'
}

export function getMiConstante(key: string) {
  return MI_CONSTANTE[key]
}
```

```typescript
// src/constants/index.ts
export * from './mi-constante'
```

### 2. Agregar nuevo tipo

```typescript
// src/types/mi-tipo.ts
export interface MiTipo {
  id: string
  nombre: string
}
```

```typescript
// src/types/index.ts
export * from './mi-tipo'
```

### 3. Reconstruir

```bash
pnpm build
```

## 🐛 Solución de Problemas

### Error de importación
- Ejecutar `pnpm build` en el paquete shared
- Reiniciar el servidor TypeScript en tu IDE
- Verificar que la ruta de importación sea correcta

### Tipos no encontrados
- Asegurarse de que están exportados en el index correspondiente
- Verificar el campo `exports` en package.json
- Reconstruir el paquete

### Cambios no se reflejan
- En desarrollo usar `pnpm dev` para watch mode
- Limpiar con `pnpm clean` y reconstruir
- Reiniciar el servidor de desarrollo del proyecto consumidor

## 📋 Mejores Prácticas

1. **Mantener puro**: Sin dependencias de frameworks
2. **Documentar tipos**: Usar JSDoc para documentación
3. **Evitar `any`**: Ser explícito con los tipos
4. **Exportar guards**: Incluir type guards cuando sea útil
5. **Versionado**: Actualizar versión en cambios breaking

## 🔮 Futuras Mejoras

- [ ] Agregar tests unitarios
- [ ] Incluir esquemas de validación (Zod)
- [ ] Agregar más funciones utilitarias
- [ ] Soporte i18n para labels
- [ ] Generación automática de documentación

## 📄 Licencia

Proyecto privado de Wildtrip.