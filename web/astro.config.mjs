// @ts-check
import node from '@astrojs/node'
import react from '@astrojs/react'
import clerk from '@clerk/astro'
import { esMX } from '@clerk/localizations'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    clerk({
      localization: esMX,
    }),
  ],
  site: 'https://guiadecampo.cl',
  devToolbar: { enabled: false },
  output: 'server',
  build: {
    inlineStylesheets: 'auto',
  },
  // Compression
  compressHTML: true,
  // Prefetch configuration for faster navigation
  prefetch: {
    defaultStrategy: 'viewport',
    prefetchAll: false,
  },
  server: {
    host: '0.0.0.0',
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: true,
      hmr: {
        host: 'localhost',
      },
    },
    ssr: {
      external: ['node:buffer', 'node:stream', 'node:events'],
    },
    optimizeDeps: {
      exclude: ['@astrojs/react'],
    },
  },
  adapter: node({
    mode: 'standalone',
  }),
})
