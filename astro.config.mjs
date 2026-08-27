import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';
import { flattenSitemap } from './integrations/flatten-sitemap.mjs';

export default defineConfig({
  site: 'https://busymad.pages.dev',
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
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-ES',
          en: 'en-GB',
        },
      },
      serialize(item) {
        const path = new URL(item.url).pathname;
        if (path === '/faq/' || path === '/en/faq/') {
          item.priority = 0.85;
          item.changefreq = 'monthly';
        } else if (path === '/' || path === '/en/') {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        }
        return item;
      },
    }),
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
        description: 'BiciMAD Madrid open data: hourly station occupancy stats and map',
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,json,webmanifest,webm,jpg}'],
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
    // After @astrojs/sitemap so sitemap-0.xml exists; ships /sitemap.xml in every astro build.
    flattenSitemap(),
  ],
});
