import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // registered manually in src/main.jsx via virtual:pwa-register/react
      includeAssets: ['icons/favicon-16.png', 'icons/favicon-32.png'],
      manifest: {
        id: '/',
        name: 'Thanthrajnaani — Learn',
        short_name: 'Thanthrajnaani',
        description:
          'Free, hands-on courses by Thanthrajnaani — Flutter, Supabase, GenAI, POS, and more, built in Kundapura.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#f97316',
        background_color: '#ffffff',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache only the app shell + small, stable assets. Per-course
        // curriculum data and diagram-rendering chunks are large and
        // lazy-loaded already — they're cached opportunistically via the
        // runtime rule below as each course is actually opened, instead of
        // forcing every visitor to download every course upfront.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        globIgnores: [
          '**/curriculum-*.js',
          '**/*[Dd]iagram*.js',
          '**/mermaid*.js',
          '**/katex-*.js',
          '**/cytoscape*.js',
          '**/wardley*.js',
          '**/dagre-*.js',
          '**/*.map',
        ],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Never cache Firebase Auth/Firestore traffic — always live.
            urlPattern: ({ url }) =>
              /googleapis\.com|firebaseio\.com|firestore\.googleapis\.com/.test(url.hostname),
            handler: 'NetworkOnly',
          },
          {
            // Per-course curriculum + diagram-support JS/CSS: cache the
            // first time a course is opened so it re-reads instantly and
            // offline afterward; revalidate in the background on repeat
            // visits so content updates still land.
            urlPattern: ({ url }) => url.pathname.startsWith('/assets/') && /\.(js|css)$/.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-chunks',
              expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 80, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 5173, host: true },
})
