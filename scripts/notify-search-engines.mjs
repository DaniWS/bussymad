#!/usr/bin/env node
/**
 * Ping Bing after deploy. Google Search Console requires manual sitemap submit:
 * https://search.google.com/search-console → Sitemaps → sitemap-index.xml
 */
const site = process.env.SITE_URL ?? 'https://busymad.pages.dev';
const sitemap = new URL('/sitemap-index.xml', site).href;

const targets = [
  `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
];

for (const url of targets) {
  try {
    const res = await fetch(url);
    console.log(`${res.ok ? 'OK' : 'FAIL'} ${res.status} ${url}`);
  } catch (err) {
    console.error(`FAIL ${url}`, err.message);
  }
}

console.log(`Google: add ${sitemap} in Search Console (manual).`);
