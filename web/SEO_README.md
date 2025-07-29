# Implementación SEO - WildTrip Guía de Campo

Este documento describe todas las optimizaciones SEO implementadas en el sitio web de WildTrip Guía de Campo.

## 📋 Tabla de Contenidos

- [Sitemap Dinámico con Cache](#sitemap-dinámico-con-cache)
- [Robots.txt](#robotstxt)
- [Meta Tags y Open Graph](#meta-tags-y-open-graph)
- [Structured Data (JSON-LD)](#structured-data-json-ld)
- [Utilidades SEO](#utilidades-seo)
- [Cómo Usar](#cómo-usar)
- [Mantenimiento](#mantenimiento)

## 🗺️ Sitemap Dinámico con Cache

### Implementación

El sitemap se genera automáticamente usando la integración oficial de Astro (`@astrojs/sitemap`) con las siguientes características:

1. **Generación Automática**: Detecta todas las páginas estáticas y dinámicas
2. **Filtrado Inteligente**: Excluye automáticamente rutas de administración (`/manage/*`) y API (`/api/*`)
3. **Prioridades Personalizadas**:
   - Home: 1.0 (daily)
   - Páginas de listado: 0.9 (daily)
   - Especies y áreas protegidas: 0.8 (monthly)
   - Noticias: 0.7 (weekly)

### Cache con Upstash Redis

Se creó una función de utilidad para cachear URLs dinámicas:

```typescript
// src/lib/utils/sitemap.ts
- Cache de 24 horas para las URLs dinámicas
- Se invalida automáticamente cuando se actualiza contenido
- Fallback en caso de error de Redis
```

### Configuración en astro.config.mjs

```javascript
sitemap({
  filter: (page) => !page.includes('/manage') && !page.includes('/api/'),
  changefreq: 'daily',
  priority: 0.7,
  lastmod: new Date(),
  serialize(item) {
    // Lógica personalizada para diferentes tipos de contenido
  }
})
```

## 🤖 Robots.txt

Ubicación: `/public/robots.txt`

### Características

- Permite acceso completo a crawlers legítimos
- Bloquea rutas de administración y API
- Referencia al sitemap
- Bloqueo de bots maliciosos (AhrefsBot, SemrushBot, etc.)
- Reglas específicas para crawlers principales (Google, Bing, etc.)

## 🏷️ Meta Tags y Open Graph

### Layout.astro Mejorado

El layout principal ahora acepta las siguientes props para SEO:

```typescript
interface Props {
  title: string
  description?: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  noindex?: boolean
  canonical?: string
  jsonLd?: any
}
```

### Meta Tags Implementados

1. **Básicos**:
   - Title con formato: `{title} - WildTrip Guia de Campo`
   - Meta description
   - Canonical URL
   - Robots/Googlebot directives
   - Language (Spanish)

2. **Open Graph** (Facebook):
   - og:type, og:url, og:title, og:description
   - og:image con URL completa
   - og:site_name, og:locale (es_CL)
   - article:published_time, article:modified_time (para artículos)

3. **Twitter Cards**:
   - twitter:card (summary_large_image)
   - twitter:url, twitter:title, twitter:description
   - twitter:image

### Imagen Open Graph por Defecto

- Ubicación: `/public/default-og-image.jpg`
- **IMPORTANTE**: Debes crear una imagen de 1200x630px con el logo/branding de WildTrip

## 📊 Structured Data (JSON-LD)

### Schemas Implementados

Ubicación: `/src/lib/utils/structured-data.ts`

1. **Website Schema**: Para la página principal
2. **Organization Schema**: Información de la organización
3. **BreadcrumbList Schema**: Para navegación
4. **NewsArticle Schema**: Para noticias
5. **Taxon Schema**: Para especies (con información taxonómica)
6. **Place Schema**: Para áreas protegidas
7. **CollectionPage Schema**: Para páginas de listado

### Ejemplo de Uso

```astro
---
import Layout from '@/layouts/Layout.astro'
import { generateSpeciesSchema, generateBreadcrumbSchema } from '@/lib/utils/structured-data'

const speciesSchema = generateSpeciesSchema({
  name: species.commonName,
  scientificName: species.scientificName,
  description: species.description,
  url: `https://guiadecampo.cl/content/species/${species.id}`,
  image: species.mainImage,
  conservationStatus: species.conservationStatus,
  taxonRank: 'species'
})

const breadcrumbs = generateBreadcrumbSchema([
  { name: 'Inicio', url: 'https://guiadecampo.cl' },
  { name: 'Especies', url: 'https://guiadecampo.cl/content/species' },
  { name: species.commonName, url: `https://guiadecampo.cl/content/species/${species.id}` }
])
---

<Layout 
  title={species.commonName}
  description={generateMetaDescription(species.description)}
  image={species.mainImage}
  type="article"
  jsonLd={[speciesSchema, breadcrumbs]}
>
  <!-- Contenido -->
</Layout>
```

## 🛠️ Utilidades SEO

Ubicación: `/src/lib/utils/seo.ts`

### Funciones Disponibles

1. **generateMetaDescription(text, maxLength)**: Trunca texto para meta descriptions (155 chars)
2. **generatePageTitle(title, suffix)**: Genera títulos SEO-friendly (60 chars max)
3. **extractTextFromRichContent(blocks)**: Extrae texto de contenido Tiptap
4. **generateBreadcrumbs(path, currentTitle)**: Genera breadcrumbs para structured data
5. **formatDateForSEO(date)**: Formatea fechas en ISO 8601
6. **generateImageAlt(title, type)**: Genera texto alt para imágenes
7. **generateSlug(text)**: Crea slugs URL-friendly
8. **getCanonicalUrl(path)**: Obtiene URL canónica

## 📝 Cómo Usar

### 1. En Páginas de Contenido

```astro
---
import Layout from '@/layouts/Layout.astro'
import { generateMetaDescription, generateBreadcrumbs } from '@/lib/utils/seo'
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/utils/structured-data'

// Generar meta description
const metaDescription = generateMetaDescription(news.summary || news.content)

// Generar structured data
const articleSchema = generateArticleSchema({
  title: news.title,
  description: metaDescription,
  url: Astro.url.href,
  datePublished: formatDateForSEO(news.publishedAt),
  dateModified: formatDateForSEO(news.updatedAt),
  image: news.mainImage?.url
})

const breadcrumbSchema = generateBreadcrumbSchema(
  generateBreadcrumbs(Astro.url.pathname, news.title)
)
---

<Layout 
  title={news.title}
  description={metaDescription}
  image={news.mainImage?.url}
  type="article"
  publishedTime={news.publishedAt.toISOString()}
  modifiedTime={news.updatedAt.toISOString()}
  jsonLd={[articleSchema, breadcrumbSchema]}
>
  <!-- Contenido -->
</Layout>
```

### 2. Invalidar Cache del Sitemap

Cuando se actualice contenido (especies, noticias, áreas protegidas), llama a:

```typescript
import { clearSitemapCache } from '@/lib/utils/sitemap'

// Después de crear/actualizar/eliminar contenido
await clearSitemapCache()
```

## 🔧 Mantenimiento

### Tareas Regulares

1. **Actualizar imagen Open Graph por defecto** (`/public/default-og-image.jpg`)
2. **Monitorear cache del sitemap** - Se regenera cada 24 horas automáticamente
3. **Revisar robots.txt** - Actualizar lista de bots bloqueados según necesidad

### Monitoreo SEO

Herramientas recomendadas:

1. **Google Search Console**: Para monitorear indexación y errores
2. **Google PageSpeed Insights**: Para performance
3. **Schema Markup Validator**: Para validar structured data
4. **Open Graph Debugger** (Facebook): Para validar meta tags sociales

### Mejoras Futuras

1. **Implementar Image Sitemap** para mejor indexación de imágenes
2. **Añadir soporte multiidioma** con hreflang tags
3. **Implementar AMP** para noticias (opcional)
4. **Añadir RSS Feed** para noticias
5. **Implementar Web Stories** para contenido visual
6. **Optimización de Core Web Vitals**

## 🚀 Performance SEO

### Optimizaciones Implementadas

1. **Cache en CDN** para assets estáticos
2. **Lazy loading** de imágenes
3. **Conversión a WebP** automática
4. **Minificación** de CSS/JS (Astro build)
5. **Compression** (gzip/brotli en servidor)

### Recomendaciones Adicionales

1. **Optimizar tamaño de imágenes** - Usar dimensiones apropiadas
2. **Implementar prefetch/preconnect** para recursos externos
3. **Minimizar JavaScript** en páginas públicas
4. **Usar font-display: swap** para web fonts
5. **Implementar Service Worker** para offline support

## 📱 Mobile SEO

El sitio es completamente responsive con:

- Viewport meta tag configurado
- Diseño mobile-first con Tailwind CSS
- Touch-friendly UI elements
- Optimización de performance móvil

## 🔍 Validación

Para validar la implementación SEO:

1. **Sitemap**: Visita `https://guiadecampo.cl/sitemap-index.xml`
2. **Robots.txt**: Visita `https://guiadecampo.cl/robots.txt`
3. **Structured Data**: Usa [Google's Rich Results Test](https://search.google.com/test/rich-results)
4. **Open Graph**: Usa [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
5. **Meta Tags**: Inspecciona el HTML o usa herramientas SEO

---

**Nota**: Recuerda actualizar este documento cuando se añadan nuevas optimizaciones SEO.