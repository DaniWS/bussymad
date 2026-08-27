import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://busymad.pages.dev';

/**
 * Astro always emits sitemap-index.xml → sitemap-0.xml.
 * Copy the urlset to /sitemap.xml so Search Console / robots can use a single file.
 * Runs inside `astro build` (not a separate npm step) so Cloudflare Pages picks it up
 * even when the build command is `astro build` rather than `npm run build`.
 */
export function flattenSitemap() {
  return {
    name: 'flatten-sitemap',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const dist = fileURLToPath(dir);
        const src = join(dist, 'sitemap-0.xml');
        const dest = join(dist, 'sitemap.xml');
        if (!existsSync(src)) {
          throw new Error(`flatten-sitemap: missing ${src}`);
        }
        copyFileSync(src, dest);

        const robotsPath = join(dist, 'robots.txt');
        if (existsSync(robotsPath)) {
          const robots = readFileSync(robotsPath, 'utf8').replace(
            /^Sitemap:.*$/m,
            `Sitemap: ${SITE}/sitemap.xml`,
          );
          writeFileSync(robotsPath, robots.endsWith('\n') ? robots : `${robots}\n`);
        }
      },
    },
  };
}
