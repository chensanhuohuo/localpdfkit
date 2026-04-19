import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content', 'blog');
const OUTPUT_DIR = path.join(ROOT_DIR, 'blog');
const BLOG_INDEX_PATH = path.join(ROOT_DIR, 'blog.html');
const HOME_PARTIAL_PATH = path.join(
  ROOT_DIR,
  'src',
  'partials',
  'home-latest-blog.html'
);

const SITE_URL = (process.env.SITE_URL || 'https://localpdfkit.com').replace(
  /\/+$/,
  ''
);
const BRAND_NAME = process.env.VITE_BRAND_NAME || 'LocalPDFKit';
const DEFAULT_AUTHOR = 'LocalPDFKit Editorial Team';
const DEFAULT_IMAGE = '/images/og-home.png';
const POSTS_PER_PAGE = 9;

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function parseScalar(value) {
  const cleaned = stripWrappingQuotes(value.trim());

  if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
    return cleaned
      .slice(1, -1)
      .split(',')
      .map((item) => stripWrappingQuotes(item.trim()))
      .filter(Boolean);
  }

  return cleaned;
}

function parseFrontMatter(raw) {
  if (!raw.startsWith('---')) {
    return { attributes: {}, body: raw.trim() };
  }

  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { attributes: {}, body: raw.trim() };
  }

  const [, frontMatter, body] = match;
  const attributes = {};
  let currentKey = null;

  for (const rawLine of frontMatter.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      continue;
    }

    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(attributes[currentKey])) {
        attributes[currentKey] = [];
      }
      attributes[currentKey].push(parseScalar(listMatch[1]));
      continue;
    }

    const pairMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pairMatch) {
      continue;
    }

    const [, key, value] = pairMatch;
    if (!value.trim()) {
      attributes[key] = [];
      currentKey = key;
      continue;
    }

    attributes[key] = parseScalar(value);
    currentKey = null;
  }

  return { attributes, body: body.trim() };
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function toIsoDate(value, fallback = new Date().toISOString().slice(0, 10)) {
  if (!value) {
    return fallback;
  }

  const normalized = new Date(value);
  if (Number.isNaN(normalized.getTime())) {
    return fallback;
  }

  return normalized.toISOString().slice(0, 10);
}

function formatDisplayDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function estimateReadingMinutes(markdown) {
  const wordCount = stripMarkdown(markdown).split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(wordCount / 220));
}

function createMarkdownRenderer() {
  return new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
  }).use(markdownItAnchor, {
    slugify,
    permalink: false,
  });
}

function collectHeadings(markdownRenderer, markdown) {
  const tokens = markdownRenderer.parse(markdown, {});
  const headings = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.type || !token.type.startsWith('heading_')) {
      continue;
    }

    if (token.type !== 'heading_open') {
      continue;
    }

    const level = Number(token.tag.replace('h', ''));
    const inlineToken = tokens[index + 1];
    const title = inlineToken?.content?.trim();

    if (!title || level < 2 || level > 3) {
      continue;
    }

    headings.push({
      level,
      title,
      slug: slugify(title),
    });
  }

  return headings;
}

function resolveAbsoluteUrl(relativeUrl) {
  if (!relativeUrl) {
    return `${SITE_URL}${DEFAULT_IMAGE}`;
  }

  if (/^https?:\/\//.test(relativeUrl)) {
    return relativeUrl;
  }

  return `${SITE_URL}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
}

function humanizeToolName(toolSlug) {
  const upperAcronyms = new Set([
    'pdf',
    'ocr',
    'jpg',
    'png',
    'svg',
    'bmp',
    'csv',
    'txt',
    'json',
    'xml',
    'xps',
    'wps',
    'wpd',
    'odt',
    'ods',
    'odp',
    'heic',
    'tiff',
    'webp',
    'psd',
    'pub',
    'vsd',
    'docx',
    'xlsx',
    'pdfa',
  ]);

  return toolSlug
    .split('-')
    .map((part) =>
      upperAcronyms.has(part)
        ? part.toUpperCase()
        : part[0].toUpperCase() + part.slice(1)
    )
    .join(' ');
}

function scoreRelatedPosts(post, candidate) {
  if (post.slug === candidate.slug) {
    return -1;
  }

  let score = 0;
  if (post.category === candidate.category) {
    score += 3;
  }

  for (const tag of post.tags) {
    if (candidate.tags.includes(tag)) {
      score += 2;
    }
  }

  const daysDiff =
    Math.abs(
      new Date(post.date).getTime() - new Date(candidate.date).getTime()
    ) /
    (1000 * 60 * 60 * 24);
  score += Math.max(0, 1 - daysDiff / 60);

  return score;
}

function sortPostsDescending(posts) {
  return [...posts].sort((left, right) => {
    if (left.date === right.date) {
      return left.title.localeCompare(right.title);
    }
    return right.date.localeCompare(left.date);
  });
}

function readPosts() {
  ensureDir(CONTENT_DIR);
  const markdownRenderer = createMarkdownRenderer();

  const posts = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => {
      const fullPath = path.join(CONTENT_DIR, entry.name);
      const raw = fs.readFileSync(fullPath, 'utf8');
      const { attributes, body } = parseFrontMatter(raw);
      const title =
        String(attributes.title || '')
          .trim()
          .replace(/\s+/g, ' ') ||
        humanizeToolName(entry.name.replace(/\.md$/, ''));
      const slug =
        String(attributes.slug || '')
          .trim()
          .replace(/^\//, '') || slugify(title);
      const description = String(attributes.description || '')
        .trim()
        .replace(/\s+/g, ' ');
      const excerpt =
        String(attributes.excerpt || '')
          .trim()
          .replace(/\s+/g, ' ') ||
        stripMarkdown(body).split('. ').slice(0, 2).join('. ').trim();
      const date = toIsoDate(attributes.date);
      const updated = toIsoDate(attributes.updated || date, date);
      const category = String(attributes.category || 'PDF Tutorials').trim();
      const tags = normalizeArray(attributes.tags).map((tag) =>
        tag.toLowerCase()
      );
      const relatedTools = normalizeArray(attributes.relatedTools);
      const author = String(attributes.author || DEFAULT_AUTHOR).trim();
      const image =
        String(attributes.image || DEFAULT_IMAGE).trim() || DEFAULT_IMAGE;
      const readingMinutes = estimateReadingMinutes(body);
      const headings = collectHeadings(markdownRenderer, body);
      const html = markdownRenderer.render(body);

      return {
        title,
        slug,
        description,
        excerpt,
        date,
        updated,
        category,
        tags,
        relatedTools,
        author,
        image,
        readingMinutes,
        headings,
        html,
        markdown: body,
      };
    });

  return sortPostsDescending(posts);
}

function renderTagChips(tags) {
  return tags
    .slice(0, 4)
    .map((tag) => `<span class="blog-chip">${escapeHtml(tag)}</span>`)
    .join('');
}

function renderRelatedTools(post) {
  if (!post.relatedTools.length) {
    return '';
  }

  const links = post.relatedTools
    .map(
      (toolSlug) => `
          <a href="/${escapeHtml(toolSlug)}" class="blog-resource-card">
            <strong>${escapeHtml(humanizeToolName(toolSlug))}</strong>
            <span>Open the tool directly on ${escapeHtml(BRAND_NAME)}.</span>
          </a>`
    )
    .join('');

  return `
        <section class="blog-panel">
          <p class="blog-panel-eyebrow">Related tools</p>
          <h2 class="blog-panel-title">Open the workflow without leaving the article</h2>
          <div class="blog-resource-grid">
${links}
          </div>
        </section>`;
}

function renderToc(headings) {
  if (!headings.length) {
    return '';
  }

  const links = headings
    .map(
      (heading) => `
            <a href="#${escapeHtml(heading.slug)}" class="blog-toc-link blog-toc-level-${heading.level}">
              ${escapeHtml(heading.title)}
            </a>`
    )
    .join('');

  return `
        <div class="blog-panel blog-sticky-panel">
          <p class="blog-panel-eyebrow">On this page</p>
          <nav class="blog-toc">
${links}
          </nav>
        </div>`;
}

function renderRelatedPosts(post, allPosts) {
  const related = allPosts
    .map((candidate) => ({
      candidate,
      score: scoreRelatedPosts(post, candidate),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((entry) => entry.candidate);

  if (!related.length) {
    return '';
  }

  const cards = related
    .map(
      (entry) => `
          <a href="/blog/${escapeHtml(entry.slug)}" class="blog-resource-card">
            <strong>${escapeHtml(entry.title)}</strong>
            <span>${escapeHtml(entry.excerpt)}</span>
          </a>`
    )
    .join('');

  return `
        <section class="blog-panel">
          <p class="blog-panel-eyebrow">Keep reading</p>
          <h2 class="blog-panel-title">More tutorials from the blog</h2>
          <div class="blog-resource-grid">
${cards}
          </div>
        </section>`;
}

function getBlogPageUrl(pageNumber) {
  if (pageNumber <= 1) {
    return `${SITE_URL}/blog`;
  }

  return `${SITE_URL}/blog/page/${pageNumber}`;
}

function paginatePosts(posts, pageSize = POSTS_PER_PAGE) {
  const pages = [];

  for (let index = 0; index < posts.length; index += pageSize) {
    pages.push(posts.slice(index, index + pageSize));
  }

  return pages.length ? pages : [[]];
}

function renderPagination(currentPage, totalPages) {
  if (totalPages <= 1) {
    return '';
  }

  const pageLinks = [];

  if (currentPage > 1) {
    pageLinks.push(`
          <a href="${currentPage === 2 ? '/blog' : `/blog/page/${currentPage - 1}`}" class="blog-pagination-link blog-pagination-prev">
            Previous
          </a>`);
  }

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    pageLinks.push(`
          <a
            href="${pageNumber === 1 ? '/blog' : `/blog/page/${pageNumber}`}"
            class="blog-pagination-link${pageNumber === currentPage ? ' blog-pagination-link-active' : ''}"
            aria-current="${pageNumber === currentPage ? 'page' : 'false'}"
          >
            ${pageNumber}
          </a>`);
  }

  if (currentPage < totalPages) {
    pageLinks.push(`
          <a href="/blog/page/${currentPage + 1}" class="blog-pagination-link blog-pagination-next">
            Next
          </a>`);
  }

  return `
      <nav class="blog-pagination" aria-label="Blog pagination">
${pageLinks.join('')}
      </nav>`;
}

function renderBreadcrumbJsonLd(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: BRAND_NAME,
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  };
}

function renderBlogPostingJsonLd(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: BRAND_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/favicon.svg`,
      },
    },
    image: resolveAbsoluteUrl(post.image),
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };
}

function toJsonLd(data) {
  return JSON.stringify(data, null, 2);
}

function renderPostPage(post, allPosts) {
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
  const toc = renderToc(post.headings);
  const relatedTools = renderRelatedTools(post);
  const relatedPosts = renderRelatedPosts(post, allPosts);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(post.title)} | ${escapeHtml(BRAND_NAME)} Blog</title>
    <meta name="description" content="${escapeHtml(post.description)}" />
    <meta name="author" content="localpdfkit.com" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(post.title)} | ${escapeHtml(BRAND_NAME)} Blog" />
    <meta property="og:description" content="${escapeHtml(post.description)}" />
    <meta property="og:image" content="${escapeHtml(resolveAbsoluteUrl(post.image))}" />
    <meta property="og:site_name" content="${escapeHtml(BRAND_NAME)}" />
    <meta property="article:published_time" content="${escapeHtml(post.date)}" />
    <meta property="article:modified_time" content="${escapeHtml(post.updated)}" />
    <meta property="article:section" content="${escapeHtml(post.category)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(post.title)} | ${escapeHtml(BRAND_NAME)} Blog" />
    <meta name="twitter:description" content="${escapeHtml(post.description)}" />
    <meta name="twitter:image" content="${escapeHtml(resolveAbsoluteUrl(post.image))}" />
    <meta name="twitter:site" content="@LocalPDFKit" />
    <meta name="apple-mobile-web-app-title" content="${escapeHtml(BRAND_NAME)}" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
    <link rel="icon" type="image/png" sizes="192x192" href="/images/favicon-192x192.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="/images/favicon-512x512.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
    <link rel="icon" href="/favicon.ico" sizes="32x32" />
    <link href="/src/css/styles.css" rel="stylesheet" />
  </head>

  <body class="antialiased bg-gray-900 text-gray-300 blog-page blog-detail-page">
    {{> navbar }}

    <main id="app" class="min-h-screen container mx-auto p-4 md:p-8">
      <section class="max-w-6xl mx-auto py-10 md:py-16">
        <nav class="blog-breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href="/blog">Blog</a>
          <span>/</span>
          <span>${escapeHtml(post.title)}</span>
        </nav>
      </section>

      <article class="blog-article-shell max-w-6xl mx-auto pb-20">
        <header class="blog-hero">
          <div class="blog-eyebrow-row">
            <span class="blog-chip blog-chip-strong">${escapeHtml(post.category)}</span>
            <span class="blog-meta-inline">Updated ${escapeHtml(formatDisplayDate(post.updated))}</span>
          </div>
          <h1 class="blog-title">${escapeHtml(post.title)}</h1>
          <p class="blog-lead">${escapeHtml(post.excerpt)}</p>
          <div class="blog-meta-row">
            <span>${escapeHtml(post.author)}</span>
            <span>${escapeHtml(formatDisplayDate(post.date))}</span>
            <span>${escapeHtml(post.readingMinutes)} min read</span>
          </div>
          <div class="blog-chip-row">
            ${renderTagChips(post.tags)}
          </div>
        </header>

        <div class="blog-layout">
          <div class="blog-main-column">
            <section class="blog-panel">
              <div class="blog-prose">
                ${post.html}
              </div>
            </section>
            ${relatedTools}
            ${relatedPosts}
            <section class="blog-panel blog-cta-panel">
              <p class="blog-panel-eyebrow">Next step</p>
              <h2 class="blog-panel-title">Keep the workflow moving</h2>
              <p class="text-gray-400 leading-relaxed">
                Open the tool, browse the full tool directory, or return to the blog for the next tutorial in your PDF workflow.
              </p>
              <div class="blog-cta-row">
                <a href="/tools" class="blog-button-primary">Browse all tools</a>
                <a href="/blog" class="blog-button-secondary">Back to blog</a>
              </div>
            </section>
          </div>

          <aside class="blog-sidebar">
${toc}
          </aside>
        </div>
      </article>
    </main>

    {{> footer }}

    <script type="module" src="/src/js/utils/lucide-init.ts"></script>
    <script type="module" src="/src/js/mobileMenu.ts"></script>
    <script type="module" src="/src/js/main.ts"></script>
    <script type="application/ld+json">
${toJsonLd(renderBlogPostingJsonLd(post))}
    </script>
    <script type="application/ld+json">
${toJsonLd(renderBreadcrumbJsonLd(post))}
    </script>
  </body>
</html>
`;
}

function renderStandardCard(post) {
  return `
        <a href="/blog/${escapeHtml(post.slug)}" class="blog-card">
          <p class="blog-card-kicker">${escapeHtml(post.category)}</p>
          <h2 class="blog-card-title">${escapeHtml(post.title)}</h2>
          <p class="blog-card-copy">${escapeHtml(post.excerpt)}</p>
          <div class="blog-card-meta">
            <span>${escapeHtml(formatDisplayDate(post.date))}</span>
            <span>${escapeHtml(post.readingMinutes)} min read</span>
          </div>
        </a>`;
}

function renderBlogIndexPage(posts, currentPage, totalPages) {
  const canonicalUrl = getBlogPageUrl(currentPage);
  const categories = [...new Set(posts.map((post) => post.category))];
  const archiveCards = posts.map(renderStandardCard).join('');
  const pagination = renderPagination(currentPage, totalPages);
  const pageTitle =
    currentPage === 1
      ? `${BRAND_NAME} Blog | PDF Tutorials and Workflow Guides`
      : `${BRAND_NAME} Blog | Page ${currentPage}`;
  const pageDescription =
    currentPage === 1
      ? `Read practical PDF tutorials, troubleshooting articles, and workflow guides from ${BRAND_NAME}.`
      : `Browse page ${currentPage} of the ${BRAND_NAME} blog for more PDF tutorials and workflow articles.`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(pageDescription)}" />
    <meta name="author" content="localpdfkit.com" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(pageDescription)}" />
    <meta property="og:image" content="${escapeHtml(resolveAbsoluteUrl(DEFAULT_IMAGE))}" />
    <meta property="og:site_name" content="${escapeHtml(BRAND_NAME)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(pageDescription)}" />
    <meta name="twitter:image" content="${escapeHtml(resolveAbsoluteUrl(DEFAULT_IMAGE))}" />
    <meta name="twitter:site" content="@LocalPDFKit" />
    <meta name="apple-mobile-web-app-title" content="${escapeHtml(BRAND_NAME)}" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
    <link rel="icon" type="image/png" sizes="192x192" href="/images/favicon-192x192.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="/images/favicon-512x512.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
    <link rel="icon" href="/favicon.ico" sizes="32x32" />
    <link href="/src/css/styles.css" rel="stylesheet" />
  </head>

  <body class="antialiased bg-gray-900 text-gray-300 blog-page blog-index-page">
    {{> navbar }}

    <main id="app" class="min-h-screen container mx-auto p-4 md:p-8">
      <section class="max-w-5xl mx-auto py-16 md:py-24 text-center">
        <p class="text-sm uppercase tracking-[0.3em] text-indigo-300 mb-4">Blog</p>
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-5">
          ${currentPage === 1 ? 'Practical PDF tutorials for real document work' : `More PDF tutorials and workflow articles`}
        </h1>
        <p class="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
          ${currentPage === 1 ? `${escapeHtml(BRAND_NAME)} blog posts are written to support search intent, teach workflows clearly, and make it easy to move from a question into the right PDF tool.` : `Browse page ${currentPage} of the ${escapeHtml(BRAND_NAME)} blog archive for more step-by-step PDF tutorials.`}
        </p>
        <div class="blog-chip-row blog-chip-row-center">
          ${categories
            .map(
              (category) =>
                `<span class="blog-chip">${escapeHtml(category)}</span>`
            )
            .join('')}
        </div>
      </section>

      <section class="max-w-6xl mx-auto py-8">
        <div class="blog-section-header">
          <div>
            <p class="blog-panel-eyebrow">All posts</p>
            <h2 class="blog-panel-title">Page ${currentPage} of ${totalPages}</h2>
          </div>
          <a href="/workflows" class="blog-button-secondary">Browse workflows</a>
        </div>
        <div class="blog-card-grid">
${archiveCards}
        </div>
${pagination}
      </section>

      <section class="max-w-6xl mx-auto py-16">
        <div class="blog-panel blog-cta-panel">
          <p class="blog-panel-eyebrow">Start now</p>
          <h2 class="blog-panel-title">Need the tool first?</h2>
          <p class="text-gray-400 leading-relaxed">
            Jump into the full tool library, or use the workflow hub if you want a clearer path from question to action.
          </p>
          <div class="blog-cta-row">
            <a href="/tools" class="blog-button-primary">Browse all tools</a>
            <a href="/workflows" class="blog-button-secondary">Open workflow hub</a>
          </div>
        </div>
      </section>
    </main>

    {{> footer }}

    <script type="module" src="/src/js/utils/lucide-init.ts"></script>
    <script type="module" src="/src/js/mobileMenu.ts"></script>
    <script type="module" src="/src/js/main.ts"></script>
    <script type="application/ld+json">
${toJsonLd({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: `${BRAND_NAME} Blog`,
  url: canonicalUrl,
  description: pageDescription,
  publisher: {
    '@type': 'Organization',
    name: BRAND_NAME,
    url: SITE_URL,
  },
})}
    </script>
  </body>
</html>
`;
}

function renderHomePartial(posts) {
  const latestPosts = posts.slice(0, 3);

  const cards = latestPosts
    .map(
      (post) => `
        <a href="/blog/${escapeHtml(post.slug)}" class="blog-card">
          <p class="blog-card-kicker">${escapeHtml(post.category)}</p>
          <h3 class="blog-card-title">${escapeHtml(post.title)}</h3>
          <p class="blog-card-copy">${escapeHtml(post.excerpt)}</p>
          <div class="blog-card-meta">
            <span>${escapeHtml(formatDisplayDate(post.date))}</span>
            <span>${escapeHtml(post.readingMinutes)} min read</span>
          </div>
        </a>`
    )
    .join('');

  return `<section class="py-20">
  <div class="max-w-6xl mx-auto">
    <div class="blog-section-header">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-indigo-300 mb-4">Fresh content</p>
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-3">Latest from the blog</h2>
        <p class="text-gray-400 max-w-3xl">
          Read new how-to articles, troubleshooting notes, and workflow tutorials for everyday PDF tasks.
        </p>
      </div>
      <a href="/blog" class="blog-button-secondary">Visit the blog</a>
    </div>
    <div class="blog-card-grid">
${cards}
    </div>
  </div>
</section>
`;
}

function writePostPages(posts) {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  ensureDir(OUTPUT_DIR);

  for (const post of posts) {
    const outputPath = path.join(OUTPUT_DIR, `${post.slug}.html`);
    fs.writeFileSync(outputPath, renderPostPage(post, posts), 'utf8');
  }
}

function writeIndexPages(posts) {
  const pages = paginatePosts(posts);
  const pageOutputDir = path.join(OUTPUT_DIR, 'page');

  pages.forEach((pagePosts, index) => {
    const pageNumber = index + 1;
    const html = renderBlogIndexPage(pagePosts, pageNumber, pages.length);

    if (pageNumber === 1) {
      fs.writeFileSync(BLOG_INDEX_PATH, html, 'utf8');
      return;
    }

    ensureDir(pageOutputDir);
    const pageDir = path.join(pageOutputDir, String(pageNumber));
    ensureDir(pageDir);
    fs.writeFileSync(path.join(pageDir, 'index.html'), html, 'utf8');
  });
}

function main() {
  const posts = readPosts();

  writePostPages(posts);
  writeIndexPages(posts);
  ensureDir(path.dirname(HOME_PARTIAL_PATH));
  fs.writeFileSync(HOME_PARTIAL_PATH, renderHomePartial(posts), 'utf8');

  console.log(`[blog] Generated ${posts.length} blog posts`);
}

main();
