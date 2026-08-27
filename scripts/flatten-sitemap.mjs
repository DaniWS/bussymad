#!/usr/bin/env node
/**
 * Astro emits sitemap-index.xml → sitemap-0.xml. Google Search Console on
 * *.pages.dev often fails to read the index; a root sitemap.xml is more reliable.
 */
import { copyFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const site = 'https://busymad.pages.dev';
const src = 'dist/sitemap-0.xml';
const dest = 'dist/sitemap.xml';
const robotsPath = 'dist/robots.txt';

if (!existsSync(src)) {
  console.error(`Missing ${src}; run astro build first.`);
  process.exit(1);
}

copyFileSync(src, dest);

if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, 'utf8').replace(
    /^Sitemap:.*$/m,
    `Sitemap: ${site}/sitemap.xml`,
  );
  writeFileSync(robotsPath, robots.endsWith('\n') ? robots : `${robots}\n`);
}

console.log(`Wrote ${dest} and updated robots Sitemap → ${site}/sitemap.xml`);
