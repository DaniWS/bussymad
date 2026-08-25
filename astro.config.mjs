import { defineConfig } from 'astro/config';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  site: 'https://busymad.dev',
  output: 'static',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  server: {
    port: 4322,
    host: true,
  },
  vite: {
    build: {
      cssMinify: 'esbuild',
    },
  },
  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.png',
        'logo.png',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-maskable-192.png',
        'pwa-maskable-512.png',
      ],
      manifest: {
        id: '/',
        name: 'BusyMAD',
        short_name: 'BusyMAD',
        description: 'BiciMAD station occupancy by hour',
        start_url: '/app/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#1a7f5a',
        theme_color: '#1a7f5a',
        lang: 'es',
        dir: 'ltr',
        prefer_related_applications: false,
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,json,webmanifest}'],
        // Offline shell only for Spanish /app/. Never intercept /en/* or the SW
        // serves Spanish HTML at English URLs and freezes the language switcher.
        navigateFallback: '/app/',
        navigateFallbackAllowlist: [/^\/app\/?$/],
        navigateFallbackDenylist: [/^\/en(?:\/|$)/],
      },
      devOptions: {
        // Dev SW caused ES↔EN to stick after one switch; use network in development.
        enabled: false,
      },
    }),
  ],
});
