# Wildtrip Field Guide - Dashboard (Admin Panel)

Panel de administración para la gestión de contenido de la Guía de Campo de Wildtrip.

## 🚀 Características

- **Framework**: React 19 + Vite
- **UI Components**: shadcn/ui + Radix UI
- **Estilos**: Tailwind CSS v4
- **Editor**: TipTap (texto enriquecido)
- **Autenticación**: Clerk
- **Estado**: TanStack Query (React Query)
- **Gestión**: CRUD completo para todas las entidades

## 📋 Requisitos

- Node.js 20+
- pnpm 10+
- API backend funcionando

## 🛠️ Instalación

```bash
# Desde la raíz del monorepo
pnpm --filter=dashboard install

# O desde el directorio dashboard
cd dashboard
pnpm install
```

## ⚙️ Configuración

Crear archivo `.env` basado en `.env.example`:

```env
# API Backend
VITE_API_URL=http://localhost:3000

# Autenticación (Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# URL del sitio público (para redirects)
VITE_WEB_URL=http://localhost:4321

# CDN para imágenes
VITE_R2_PUBLIC_URL=https://dev.cdn.wildtrip.cl
```

## 🏃‍♂️ Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm dev

# El dashboard estará disponible en http://localhost:5173
```

## 🏗️ Estructura del Proyecto

```
dashboard/
├── src/
│   ├── pages/              # Páginas de React Router
│   │   ├── species/        # Gestión de especies
│   │   │   ├── index.tsx   # Lista de especies
│   │   │   └── edit.tsx    # Editar especie
│   │   ├── protected-areas/ # Gestión de áreas protegidas
│   │   ├── news/           # Gestión de noticias
│   │   ├── gallery/        # Gestión de galería
│   │   └── users/          # Gestión de usuarios
│   ├── components/         
│   │   ├── manage/         # Componentes de gestión
│   │   │   ├── SpeciesForm.tsx
│   │   │   ├── SpeciesTable.tsx
│   │   │   ├── TiptapEditor.tsx
│   │   │   ├── MediaPickerModal.tsx
│   │   │   └── ...
│   │   └── ui/             # Componentes shadcn/ui
│   ├── hooks/              # Custom React hooks
│   ├── lib/
│   │   ├── api/            # Cliente API
│   │   └── utils/          # Utilidades
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Contexto de autenticación
│   └── App.tsx             # Aplicación principal
├── public/                 # Assets estáticos
└── vite.config.ts         # Configuración de Vite
```

## 🎨 Componentes Principales

### Editor de Contenido Enriquecido (TipTap)

```tsx
import { TiptapEditor } from '@/components/manage/TiptapEditor'

<TiptapEditor
  content={content}
  onChange={setContent}
  placeholder="Escribe aquí..."
/>
```

Extensiones incluidas:
- Formato básico (negrita, cursiva, subrayado)
- Encabezados (H1-H6)
- Listas (ordenadas/desordenadas)
- Imágenes con resize y estilos
- Tablas
- Enlaces
- Código y bloques de código
- Citas
- Separadores horizontales

### Gestión de Imágenes

```tsx
import { MediaPickerModal } from '@/components/manage/MediaPickerModal'

<MediaPickerModal
  isOpen={isOpen}
  onClose={onClose}
  onSelectImages={handleSelectImages}
  multiple={true}
/>
```

### Sistema de Borradores

Todas las entidades soportan borradores:
- Guardar cambios sin publicar
- Previsualizar borradores
- Publicar cuando esté listo
- Descartar cambios
- Sistema de bloqueos para edición concurrente

## 🔒 Autenticación

El dashboard verifica la autenticación al cargar:

1. Si no está autenticado → Redirige a `/sign-in` del sitio público
2. Si está autenticado → Carga el dashboard
3. Mantiene sesión con cookies HTTP-only
4. Permisos basados en roles (admin, editor)

## 📦 Build

```bash
# Build para producción
pnpm build

# Preview del build
pnpm preview
```

## 🚀 Despliegue

Como SPA estática:

1. Build genera archivos en `dist/`
2. Configurar redirects para React Router
3. Servir desde CDN o servidor estático
4. Configurar variables de entorno

### Ejemplo nginx:

```nginx
location / {
  try_files $uri /index.html;
}
```

### Ejemplo Vercel:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🧪 Testing

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Formateo
pnpm format
```

## 📝 Características Específicas

### Gestión de Especies

- Información taxonómica completa
- Estado de conservación
- Distribución geográfica
- Galería de imágenes con orden personalizable
- Referencias bibliográficas
- Contenido enriquecido
- Campos SEO personalizados

### Gestión de Áreas Protegidas

- Información básica
- Ubicación geográfica con mapa
- Ecosistemas
- Información para visitantes
- Galería multimedia
- Contenido enriquecido

### Gestión de Noticias

- Título y resumen
- Categorías múltiples
- Tags personalizables
- Imagen destacada
- Autor automático
- Contenido enriquecido
- Programación de publicación

### Galería Multimedia

- Organización por carpetas
- Carga múltiple de archivos
- Conversión automática a WebP
- Optimización de imágenes
- Búsqueda y filtrado
- Batch download con JSZip

## 🐛 Solución de Problemas

### Error de CORS
- Verificar que `VITE_API_URL` sea correcto
- Asegurar que el backend esté corriendo
- Verificar CORS en el backend

### Imágenes no se cargan
- Verificar `VITE_R2_PUBLIC_URL`
- Comprobar permisos en el bucket R2
- Las imágenes vienen con URLs completas del API

### Error de autenticación
- Verificar `VITE_CLERK_PUBLISHABLE_KEY`
- Limpiar cookies y volver a iniciar sesión
- Verificar que el backend tenga la misma clave de Clerk

### Editor TipTap no funciona
- Verificar instalación de dependencias
- Limpiar caché de node_modules
- Reinstalar con `pnpm install`

## 📊 Estado Actual (Agosto 2025)

### ✅ Completado
- Migración completa desde el proyecto web
- Todos los componentes de gestión funcionando
- Editor TipTap con todas las extensiones
- Sistema de permisos por roles
- Gestión de galería multimedia
- Tablas con ordenamiento y filtrado
- Sistema de borradores y publicación
- Previsualización de contenido
- Exportación de datos

### 🚧 Pendiente
- Validación avanzada con React Hook Form + Zod
- WebSockets para actualizaciones en tiempo real
- Tests unitarios con Vitest
- Tests E2E con Playwright
- Mejoras de accesibilidad
- Modo oscuro completo

## 🔗 Enlaces Útiles

- [shadcn/ui](https://ui.shadcn.com/)
- [TipTap](https://tiptap.dev/)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query)
- [Clerk Docs](https://clerk.com/docs)

## 📄 Licencia

Proyecto privado de Wildtrip.