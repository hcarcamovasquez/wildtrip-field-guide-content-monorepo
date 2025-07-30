# Wildtrip Field Guide - Dashboard (Admin Panel)

Panel de administración para la gestión de contenido de la Guía de Campo de Wildtrip.

## 🚀 Características

- **Framework**: React 19 + Vite
- **UI Components**: shadcn/ui + Radix UI
- **Estilos**: Tailwind CSS v4
- **Editor**: TipTap (texto enriquecido)
- **Autenticación**: Clerk
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
│   │   ├── protected-areas/ # Gestión de áreas protegidas
│   │   ├── news/           # Gestión de noticias
│   │   ├── gallery/        # Gestión de galería
│   │   └── users/          # Gestión de usuarios
│   ├── components/         
│   │   ├── manage/         # Componentes de gestión
│   │   ├── editor/         # Editor TipTap
│   │   └── ui/             # Componentes shadcn/ui
│   ├── hooks/              # Custom React hooks
│   ├── lib/
│   │   ├── api/            # Cliente API
│   │   └── utils/          # Utilidades
│   ├── contexts/           # React contexts
│   └── App.tsx             # Aplicación principal
├── public/                 # Assets estáticos
└── vite.config.ts         # Configuración de Vite
```

## 🎨 Componentes Principales

### Editor de Contenido Enriquecido

```tsx
import { RichContentEditor } from '@/components/editor/RichContentEditor'

<RichContentEditor
  content={content}
  onChange={setContent}
  placeholder="Escribe aquí..."
/>
```

### Gestión de Imágenes

```tsx
import { ImageGalleryManager } from '@/components/manage/ImageGalleryManager'

<ImageGalleryManager
  images={images}
  onImagesChange={setImages}
  maxImages={10}
/>
```

### Sistema de Borradores

Todas las entidades soportan borradores:
- Guardar cambios sin publicar
- Previsualizar borradores
- Publicar cuando esté listo
- Descartar cambios

## 🔒 Autenticación

El dashboard verifica la autenticación al cargar:

1. Si no está autenticado → Redirige a `/sign-in` del sitio público
2. Si está autenticado → Carga el dashboard
3. Mantiene sesión con cookies HTTP-only

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

### Editor TipTap

Extensiones incluidas:
- Formato básico (negrita, cursiva, etc.)
- Encabezados (H1-H6)
- Listas (ordenadas/desordenadas)
- Imágenes con resize
- Tablas
- Enlaces
- Código
- Citas

### Gestión de Especies

- Información taxonómica completa
- Estado de conservación
- Distribución geográfica
- Galería de imágenes
- Referencias
- Contenido enriquecido

### Gestión de Áreas Protegidas

- Información básica
- Ubicación geográfica
- Ecosistemas
- Información para visitantes
- Galería
- Contenido enriquecido

### Gestión de Noticias

- Título y resumen
- Categorías
- Tags
- Imagen destacada
- Autor
- Contenido enriquecido

## 🐛 Solución de Problemas

### Error de CORS
- Verificar que `VITE_API_URL` sea correcto
- Asegurar que el backend esté corriendo
- Verificar CORS en el backend

### Imágenes no se cargan
- Verificar `VITE_R2_PUBLIC_URL`
- Comprobar permisos en el bucket R2

### Error de autenticación
- Verificar `VITE_CLERK_PUBLISHABLE_KEY`
- Limpiar cookies y volver a iniciar sesión

## 🔗 Enlaces Útiles

- [shadcn/ui](https://ui.shadcn.com/)
- [TipTap](https://tiptap.dev/)
- [React Router](https://reactrouter.com/)
- [Clerk Docs](https://clerk.com/docs)

## 📄 Licencia

Proyecto privado de Wildtrip.