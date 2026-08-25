import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://bussymad.dev',
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
});
