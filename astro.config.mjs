import { defineConfig, fontProviders } from 'astro/config';
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
  // Astro's font pipeline emits real files. CSS `@fontsource/*` imports were
  // rewriting URLs under Vite 8/Rolldown without copying the binaries into dist,
  // so Googlebot got HTML soft-404s for every .woff / missing .woff2.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'DM Sans',
      cssVariable: '--font-dm-sans',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
  vite: {
    build: {
      cssMinify: 'esbuild',
    },
  },
  integrations: [
    sitemap({
      // Unused news/image/video namespaces confuse some GSC parsers; keep xhtml for hreflang.
      namespaces: { news: false, image: false, video: false, xhtml: true },
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-ES',
          en: 'en-GB',
        },
      },
      serialize(item) {
        const path = new URL(item.url).pathname;
        const site = 'https://busymad.pages.dev';
        if (path === '/licencia/') {
          item.links = [
            { url: `${site}/licencia/`, lang: 'es-ES' },
            { url: `${site}/en/license/`, lang: 'en-GB' },
          ];
        } else if (path === '/en/license/') {
          item.links = [
            { url: `${site}/licencia/`, lang: 'es-ES' },
            { url: `${site}/en/license/`, lang: 'en-GB' },
          ];
        } else if (path === '/faq/' || path === '/en/faq/') {
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
