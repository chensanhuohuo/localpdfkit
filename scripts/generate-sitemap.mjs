import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const SITE_URL = (process.env.SITE_URL || 'https://localpdfkit.com').replace(
  /\/+$/,
  ''
);

const PRIORITY_MAP = {
  index: 1.0,
  blog: 0.85,
  tools: 0.9,
  'pdf-converter': 0.9,
  'pdf-editor': 0.9,
  'pdf-security': 0.9,
  'pdf-merge-split': 0.9,
  'merge-pdf': 0.9,
  'split-pdf': 0.9,
  'compress-pdf': 0.9,
  'edit-pdf': 0.9,
  'word-to-pdf': 0.9,
  'excel-to-pdf': 0.9,
  'powerpoint-to-pdf': 0.9,
  'jpg-to-pdf': 0.9,
  'pdf-to-docx': 0.9,
  'pdf-to-excel': 0.9,
  'pdf-to-jpg': 0.9,
  about: 0.8,
  'how-it-works': 0.8,
  faq: 0.8,
  contact: 0.7,
  privacy: 0.5,
  terms: 0.5,
  cookies: 0.5,
  disclaimer: 0.5,
  licensing: 0.5,
  'source-code': 0.5,
  404: 0.1,
};

const EXCLUDED_PAGES = new Set(['404', 'guides']);

function getPriority(pageName) {
  return PRIORITY_MAP[pageName] || 0.7;
}

function buildUrl(pageName) {
  if (pageName === 'index') return SITE_URL;
  if (pageName.endsWith('/index')) {
    return `${SITE_URL}/${pageName.slice(0, -6)}`;
  }
  return `${SITE_URL}/${pageName}`;
}

function collectHtmlPages(dir, base = '') {
  const pages = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      pages.push(
        ...collectHtmlPages(path.join(dir, entry.name), `${base}${entry.name}/`)
      );
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      pages.push(`${base}${entry.name.replace('.html', '')}`);
    }
  }

  return pages;
}

function generateSitemap() {
  console.log('[sitemap] Generating English-only sitemap...');
  console.log(`   SITE_URL: ${SITE_URL}`);

  const htmlFiles = collectHtmlPages(DIST_DIR)
    .filter((pageName) => !EXCLUDED_PAGES.has(pageName))
    .sort((a, b) => a.localeCompare(b));

  const today = new Date().toISOString().split('T')[0];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const pageName of htmlFiles) {
    const priority = getPriority(pageName);
    const url = buildUrl(pageName);

    sitemap += `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>
`;
  }

  sitemap += `</urlset>
`;

  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);

  const publicSitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(publicSitemapPath, sitemap);

  console.log(`[sitemap] Sitemap generated with ${htmlFiles.length} URLs`);
}

generateSitemap();
