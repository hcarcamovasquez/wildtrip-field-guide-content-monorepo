// @ts-check
import node from '@astrojs/node'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import clerk from '@clerk/astro'
import {esMX} from '@clerk/localizations'
import tailwindcss from '@tailwindcss/vite'
import {defineConfig} from 'astro/config'

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    clerk({
      localization: esMX,
    }),
    sitemap({
      // Filter out management pages and API routes
      filter: (page) => !page.includes('/manage') && !page.includes('/api/'),
    }),
  ],
  site: 'https://guiadecampo.cl',
  devToolbar: { enabled: false },
  output: 'server',
  server: {
    host: '0.0.0.0',
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: true,
      hmr: {
        host: 'localhost'
      }
    },
    ssr: {
      external: ['node:buffer', 'node:stream', 'node:events'],
    },
    optimizeDeps: {
      exclude: ['@astrojs/react'],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
  },
  adapter: node({
    mode: 'standalone',
  }),
})
