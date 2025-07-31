# Informe de Limpieza y Refactorización - Proyecto Web

**Fecha:** 31 de Enero 2025  
**Proyecto:** Web (Frontend público del monorepo WildTrip)

## Resumen Ejecutivo

El proyecto web mantiene código huérfano y dependencias de cuando era una aplicación fullstack con administración. Ahora que es solo el frontend público, se pueden eliminar múltiples archivos, directorios y dependencias para simplificar el proyecto.

## 1. Código y Archivos Huérfanos para Eliminar

### 1.1 Base de Datos (Ya no se usa - todo viene del API)
- ❌ `/drizzle.config.ts` - Configuración de Drizzle ORM
- ❌ `/migrations/` - Directorio completo de migraciones
- ❌ `/data/*.sql` - Archivos SQL de datos
- ❌ Scripts en package.json: `db:generate`, `db:migrate`, `db:push`, `db:studio`

### 1.2 Utilidades No Utilizadas
- ❌ `/src/lib/cache/redis.ts` - Redis no se usa en el frontend
- ❌ `/src/lib/utils/r2-upload.ts` - Subida de archivos es del backend
- ❌ `/src/lib/utils/image-variants.ts` - Variantes se generan en Cloudflare

### 1.3 Datos Legacy
- ❌ `/data/EducationArea.csv`
- ❌ `/data/EducationCategory.csv`  
- ❌ `/data/EducationSpecie.csv`
- ❌ `/data/areas_protegidas_para_copiar.md`
- ❌ `/data/especies_completas_para_copiar.md`

### 1.4 Archivos de Configuración Obsoletos
- ❌ `/bin/kill-port.sh` - Script no necesario

## 2. Dependencias para Eliminar del package.json

### 2.1 Base de Datos
```json
- "drizzle-kit": "^0.36.0"
- "drizzle-orm": "^0.40.0"
- "@neondatabase/serverless": "^1.0.1"
- "pg": "^8.14.0"
```

### 2.2 AWS/S3 (R2)
```json
- "@aws-sdk/client-s3": "^3.848.0"
```

### 2.3 Redis
```json
- "@upstash/redis": "^1.38.2"
```

### 2.4 TipTap (Editor rico - solo se usa en dashboard)
```json
- "@tiptap/core": "^3.0.7"
- "@tiptap/extension-image": "^3.0.7"
- "@tiptap/extension-link": "^3.0.7"
- "@tiptap/extension-placeholder": "^3.0.7"
- "@tiptap/extension-table": "^3.0.7"
- "@tiptap/extension-table-cell": "^3.0.7"
- "@tiptap/extension-table-header": "^3.0.7"
- "@tiptap/extension-table-row": "^3.0.7"
- "@tiptap/extension-text-align": "^3.0.7"
- "@tiptap/html": "^3.0.7"
- "@tiptap/pm": "^3.0.7"
- "@tiptap/react": "^3.0.7"
- "@tiptap/starter-kit": "^3.0.7"
```

### 2.5 Utilidades No Usadas
```json
- "sharp": "^0.33.6" - Procesamiento de imágenes en backend
- "sanitize-html": "^2.14.0" - Si no se usa en render-content
```

## 3. Refactorización de Directorios

### Estructura Actual vs Propuesta

```
web/
├── src/
│   ├── components/
│   │   ├── public/          # ✅ Mantener pero renombrar
│   │   └── ui/              # ✅ Mantener
│   ├── layouts/
│   │   ├── AuthLayout.astro # ❓ Verificar si se usa
│   │   └── Layout.astro     # ✅ Mantener
│   ├── lib/
│   │   ├── api/            # ✅ Mantener
│   │   ├── cache/          # ❌ Eliminar directorio
│   │   ├── public/         # ❓ Renombrar a 'repositories'
│   │   ├── services/       # ❓ Verificar si está vacío
│   │   └── utils/          # ✅ Mantener (limpiar archivos)
│   └── middleware/
│       ├── authMiddleware.ts        # ❓ Simplificar
│       └── routeBlockerMiddleware.ts # ❓ Verificar necesidad
```

### Estructura Propuesta Simplificada

```
web/
├── src/
│   ├── components/         # Componentes sin subdirectorio 'public'
│   │   ├── icons/
│   │   ├── news/
│   │   ├── protected-area/
│   │   ├── species/
│   │   └── ui/
│   ├── layouts/
│   ├── lib/
│   │   ├── api/           # Cliente API
│   │   ├── repositories/  # Repositorios de datos
│   │   └── utils/         # Utilidades limpias
│   ├── pages/
│   └── styles/
```

## 4. Refactorizaciones Recomendadas

### 4.1 Componentes
- Mover todo de `/components/public/` a `/components/` directamente
- Los componentes ya no necesitan el prefijo "public"

### 4.2 Repositorios
- Renombrar `/lib/public/repositories/` a `/lib/repositories/`
- Simplificar interfaces eliminando campos no usados

### 4.3 Utilidades
- Consolidar funciones de imágenes en un solo archivo
- Eliminar funciones deprecated de `r2-upload.ts`
- Revisar si `tiptap-converter.ts` se usa realmente

### 4.4 Middleware
- Simplificar `authMiddleware.ts` ya que no hay rutas protegidas
- Evaluar si `routeBlockerMiddleware.ts` es necesario

## 5. Archivos Específicos para Revisar

### Potencialmente Huérfanos
1. `/src/pages/unauthorized.astro` - ¿Se usa sin rutas protegidas?
2. `/src/layouts/AuthLayout.astro` - ¿Solo para sign-in/sign-up?
3. `/test-cases.md` - ¿Documentación actualizada?

### Para Actualizar
1. `README.md` - Debe reflejar que es solo frontend
2. `CLAUDE.md` - Actualizar para eliminar referencias a DB/backend
3. `package.json` - Limpiar scripts no usados

## 6. Plan de Acción Recomendado

### Fase 1: Limpieza Inmediata
1. Eliminar directorios `/migrations/`, `/data/`, `/bin/`
2. Eliminar archivos de configuración de base de datos
3. Eliminar utilidades no usadas (redis, r2-upload parcial)

### Fase 2: Actualización de Dependencias
1. Eliminar todas las dependencias listadas arriba
2. Ejecutar `pnpm install` para limpiar node_modules
3. Verificar que todo compile correctamente

### Fase 3: Refactorización de Estructura
1. Mover componentes de `/public/` al raíz de components
2. Renombrar directorios según propuesta
3. Actualizar todas las importaciones

### Fase 4: Documentación
1. Actualizar README.md
2. Actualizar CLAUDE.md
3. Eliminar documentación obsoleta

## 7. Impacto Estimado

### Beneficios
- 📉 Reducción de ~30% en dependencias
- 🗂️ Estructura más clara y simple
- 🚀 Build más rápido sin dependencias pesadas
- 🧹 Código más mantenible
- 📦 Bundle size reducido

### Riesgos
- ⚠️ Posibles imports rotos durante refactorización
- ⚠️ Verificar que no se use código "huérfano" indirectamente
- ⚠️ Validar que las páginas funcionen post-limpieza

## 8. Scripts a Actualizar en package.json

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build", 
    "preview": "astro preview",
    "astro": "astro",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "astro check",
    "start": "node ./dist/server/entry.mjs"
    // Eliminar: db:generate, db:migrate, db:push, db:studio
  }
}
```

## Conclusión

El proyecto web tiene una cantidad significativa de código legacy de cuando manejaba base de datos y funcionalidades de administración. La limpieza propuesta simplificará considerablemente el proyecto, haciéndolo más mantenible y eficiente como un frontend público puro que consume APIs.