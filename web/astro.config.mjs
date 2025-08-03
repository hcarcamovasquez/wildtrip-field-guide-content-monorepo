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
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
    build: {
      // Optimize for production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      // Increase chunk size warning limit slightly
      chunkSizeWarningLimit: 200,
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate React core from other dependencies
            'react-vendor': ['react', 'react-dom'],
            // Clerk authentication in its own chunk
            clerk: ['@clerk/clerk-react', '@clerk/shared'],
            // UI components
            'ui-vendor': ['lucide-react', 'clsx'],
          },
          // Use consistent chunk names for better caching
          chunkFileNames: 'chunks/[name]-[hash].js',
          entryFileNames: 'entries/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
  },
  adapter: node({
    mode: 'standalone',
  }),
})
