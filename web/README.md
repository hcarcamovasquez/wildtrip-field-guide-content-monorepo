# Wildtrip Guia de Campo Content Web

Portal de biodiversidad de Chile - Guía de Campo WildTrip. Una plataforma web para explorar y gestionar información sobre especies, áreas protegidas y noticias de conservación en Chile.

## 🌿 Descripción

Este proyecto es una aplicación web completa para presentar y gestionar contenido de biodiversidad chilena, incluyendo:

- **Especies**: Catálogo completo con información taxonómica, imágenes y estados de conservación
- **Áreas Protegidas**: Parques nacionales, reservas y santuarios con información detallada
- **Noticias**: Artículos sobre conservación y biodiversidad
- **Galería de Medios**: Sistema de gestión de imágenes con organización por carpetas

## 🚀 Stack Tecnológico

- **Framework**: [Astro v5](https://astro.build/) con SSR
- **Deployment**: [Railway](https://railway.app/) con Node.js adapter
- **Base de Datos**: PostgreSQL con [Drizzle ORM](https://orm.drizzle.team/)
- **Autenticación**: [Clerk](https://clerk.com/) (localización en español)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI + Tailwind)
- **Cache**: [Upstash Redis](https://upstash.com/)
- **Storage**: AWS S3 compatible (R2)
- **Lenguaje**: TypeScript

## 📋 Requisitos Previos

- Node.js 18+
- pnpm 8+
- PostgreSQL 15+
- Cuenta en Railway (para deployment)
- Cuenta en AWS o servicio S3 compatible (para almacenamiento)
- Cuenta en Clerk (para autenticación)
- Cuenta en Upstash (para Redis)

## 🛠️ Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/wildtrip-field-guide-content-web.git
cd wildtrip-field-guide-content-web
```

2. Instala las dependencias:

```bash
pnpm install
```

3. Configura las variables de entorno:

```bash
cp .env.example .env
```

4. Edita `.env` con tus credenciales:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database_name

# Authentication (Clerk)
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Redis Cache (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# AWS S3/R2 Storage
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
PUBLIC_R2_PUBLIC_URL=https://your-public-r2-url.r2.dev

# Server Configuration
PORT=4321
HOST=0.0.0.0
```

5. Ejecuta las migraciones de base de datos:

```bash
pnpm run db:push
```

6. (Opcional) Carga datos de ejemplo:

```bash
# En desarrollo local
curl http://localhost:4321/api/dev/seed
```

## 🧞 Comandos

### Desarrollo

```bash
# Inicia servidor de desarrollo (localhost:4321)
pnpm run dev

# Construye para producción
pnpm run build

# Previsualiza build de producción
pnpm run preview

# Inicia servidor de producción
pnpm run start
```

### Base de Datos

```bash
# Genera migraciones desde cambios en el schema
pnpm run db:generate

# Aplica migraciones a la base de datos
pnpm run db:migrate

# Push directo del schema (desarrollo)
pnpm run db:push

# Abre Drizzle Studio para gestión visual
pnpm run db:studio
```

### Calidad de Código

```bash
# Ejecuta linting
pnpm run lint

# Corrige problemas de linting
pnpm run lint:fix

# Verifica tipos TypeScript
pnpm run type-check

# Formatea código
pnpm run format

# Verifica formato
pnpm run format:check
```

## 🏗️ Estructura del Proyecto

```
wildtrip-field-guide-content-web/
├── src/
│   ├── pages/              # Rutas basadas en archivos
│   │   ├── content/        # Páginas públicas
│   │   ├── manage/         # Panel de administración
│   │   └── api/            # Endpoints API
│   ├── components/
│   │   ├── public/         # Componentes públicos (Astro)
│   │   ├── manage/         # Componentes admin (React + shadcn/ui)
│   │   └── ui/             # Librería shadcn/ui
│   ├── lib/
│   │   ├── db/
│   │   │   └── schema/     # Definiciones de base de datos
│   │   ├── public/
│   │   │   └── repositories/  # Acceso a datos públicos
│   │   ├── private/
│   │   │   └── repositories/  # Acceso a datos privados
│   │   └── utils/          # Funciones utilitarias
│   ├── middleware.ts       # Cadena de middleware (auth + user)
│   └── styles/
│       └── global.css      # Estilos globales Tailwind
├── public/                 # Archivos estáticos
├── CLAUDE.md              # Guía para Claude Code AI
└── package.json
```

## 🔐 Autenticación y Roles

El sistema utiliza Clerk para autenticación con los siguientes roles:

- **admin**: Acceso completo a todas las funcionalidades
- **content_editor**: Gestión completa de contenido
- **news_editor**: Gestión de noticias
- **areas_editor**: Gestión de áreas protegidas
- **species_editor**: Gestión de especies
- **user**: Solo lectura

## 🌟 Características Principales

### Sistema de Contenido Base

- Flujo de borrador/publicación para todo el contenido
- Sistema de bloqueo para prevenir edición concurrente
- Autoguardado en formularios de edición
- Vista previa antes de publicar

### Editor de Texto Rico

- Editor Tiptap con estructura de bloques tipada
- Soporte para imágenes, enlaces, tablas y más
- Alineación de texto y formato avanzado

### Gestión de Medios

- Conversión automática a WebP en el servidor
- Organización por carpetas en base de datos y almacenamiento
- Procesamiento de imágenes con Sharp
- Carga múltiple y procesamiento por lotes

### Optimización

- Cache Redis con TTL de 15 minutos
- Renderizado del lado del servidor (SSR)
- Lazy loading de imágenes
- Compresión y optimización automática

## 🚀 Deployment en Railway

Para desplegar en Railway:

1. Crea un nuevo proyecto en Railway
2. Conecta tu repositorio GitHub
3. Agrega un servicio PostgreSQL
4. Configura las variables de entorno:
   - Todas las variables del archivo `.env`
   - Railway automáticamente configura `DATABASE_URL`
5. El deployment se ejecuta automáticamente con cada push

### Comando de inicio

Railway ejecutará automáticamente:

- Build: `pnpm install && pnpm run build`
- Start: `pnpm run start`

## 📚 Documentación Adicional

- [CLAUDE.md](./CLAUDE.md) - Guía detallada para desarrollo con Claude Code
- [Astro Docs](https://docs.astro.build) - Documentación de Astro
- [Drizzle Docs](https://orm.drizzle.team/docs/overview) - Documentación de Drizzle ORM
- [shadcn/ui](https://ui.shadcn.com) - Componentes UI

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propiedad de WildTrip.

## 👥 Equipo

Desarrollado por el equipo de WildTrip para la conservación de la biodiversidad chilena.
