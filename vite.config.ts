import { defineConfig, Plugin } from 'vitest/config';
import type { IncomingMessage, ServerResponse } from 'http';
import http from 'http';
import https from 'https';
import type { Connect } from 'vite';
// import basicSsl from '@vitejs/plugin-basic-ssl';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import viteCompression from 'vite-plugin-compression';
import handlebars from 'vite-plugin-handlebars';
import fs from 'fs';
import { resolve, relative } from 'path';
import { constants as zlibConstants } from 'zlib';
import type { OutputBundle } from 'rollup';

function collectHtmlInputs(
  dir: string,
  inputs: Record<string, string> = {}
): Record<string, string> {
  if (!fs.existsSync(dir)) return inputs;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = resolve(dir, entry.name);

    if (entry.isDirectory()) {
      collectHtmlInputs(fullPath, inputs);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      const key = relative(__dirname, fullPath)
        .replace(/\\/g, '/')
        .replace(/\.html$/, '');
      inputs[key] = fullPath;
    }
  }

  return inputs;
}

function getGeneratedBlogInputs(): Record<string, string> {
  const inputs: Record<string, string> = {};
  const blogIndexPath = resolve(__dirname, 'blog.html');

  if (fs.existsSync(blogIndexPath)) {
    inputs.blog = blogIndexPath;
  }

  return collectHtmlInputs(resolve(__dirname, 'blog'), inputs);
}

function createPageRoutingMiddleware(
  isDev: boolean
): Connect.NextHandleFunction {
  return (
    req: IncomingMessage,
    _res: ServerResponse,
    next: Connect.NextFunction
  ): void => {
    if (!req.url) return next();

    const [fullPathname, queryString] = req.url.split('?');
    const basePath = (process.env.BASE_URL || '/').replace(/\/$/, '');

    let pathname = fullPathname;
    if (basePath && basePath !== '/' && pathname.startsWith(basePath)) {
      pathname = pathname.slice(basePath.length) || '/';
    }

    if (!pathname.startsWith('/')) {
      pathname = '/' + pathname;
    }

    if (
      pathname === '/' ||
      pathname.startsWith('/@') ||
      pathname.startsWith('/src/') ||
      pathname.startsWith('/node_modules/') ||
      pathname.includes('/assets/') ||
      pathname.includes('/docs/')
    ) {
      return next();
    }

    const cleanPath = pathname.replace(/\/$/, '').replace(/\.html$/, '');
    const pageName = cleanPath.slice(1);

    if (!pageName || pageName.includes('..')) {
      return next();
    }

    const srcPagePath = resolve(__dirname, 'src/pages', `${pageName}.html`);
    if (isDev && fs.existsSync(srcPagePath)) {
      req.url =
        `/src/pages/${pageName}.html` + (queryString ? `?${queryString}` : '');
      return next();
    }

    const rootPagePath = resolve(__dirname, `${pageName}.html`);
    if (isDev && fs.existsSync(rootPagePath)) {
      req.url = `/${pageName}.html` + (queryString ? `?${queryString}` : '');
      return next();
    }

    const rootIndexPagePath = resolve(__dirname, pageName, 'index.html');
    if (isDev && fs.existsSync(rootIndexPagePath)) {
      req.url =
        `/${pageName}/index.html` + (queryString ? `?${queryString}` : '');
      return next();
    }

    const distPagePath = resolve(__dirname, 'dist', `${pageName}.html`);
    if (!isDev && !pathname.endsWith('.html') && fs.existsSync(distPagePath)) {
      req.url = `/${pageName}.html` + (queryString ? `?${queryString}` : '');
      return next();
    }

    const distIndexPagePath = resolve(
      __dirname,
      'dist',
      pageName,
      'index.html'
    );
    if (
      !isDev &&
      !pathname.endsWith('.html') &&
      fs.existsSync(distIndexPagePath)
    ) {
      req.url =
        `/${pageName}/index.html` + (queryString ? `?${queryString}` : '');
      return next();
    }

    next();
  };
}

function createCorsProxyMiddleware(): Connect.NextHandleFunction {
  return (
    req: IncomingMessage,
    res: ServerResponse,
    next: Connect.NextFunction
  ): void => {
    if (!req.url?.startsWith('/cors-proxy')) return next();

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.statusCode = 204;
      res.end();
      return;
    }

    const parsed = new URL(req.url, 'http://localhost');
    const targetUrl = parsed.searchParams.get('url');
    if (!targetUrl) {
      res.statusCode = 400;
      res.end('Missing url parameter');
      return;
    }

    console.log(`[CORS Proxy] ${req.method} ${targetUrl}`);

    const bodyChunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => bodyChunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(bodyChunks);
      const target = new URL(targetUrl);
      const transport = target.protocol === 'https:' ? https : http;

      const headers: Record<string, string> = {};
      if (req.headers['content-type']) {
        headers['Content-Type'] = req.headers['content-type'] as string;
      }
      if (body.length > 0) {
        headers['Content-Length'] = String(body.length);
      }

      const proxyReq = transport.request(
        targetUrl,
        { method: req.method || 'GET', headers },
        (proxyRes) => {
          console.log(
            `[CORS Proxy] Response: ${proxyRes.statusCode} from ${targetUrl}`
          );
          res.setHeader(
            'Access-Control-Allow-Origin',
            req.headers.origin || '*'
          );
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = proxyRes.statusCode || 200;
          proxyRes.pipe(res);
        }
      );

      proxyReq.on('error', (err) => {
        console.error('[CORS Proxy] Error:', err.message);
        res.statusCode = 502;
        res.end(`Proxy error: ${err.message}`);
      });

      if (body.length > 0) {
        proxyReq.write(body);
      }
      proxyReq.end();
    });
  };
}

function serverUtilitiesPlugin(): Plugin {
  return {
    name: 'server-utilities',
    configureServer(server) {
      server.middlewares.use(createCorsProxyMiddleware());
      server.middlewares.use(createPageRoutingMiddleware(true));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createCorsProxyMiddleware());
      server.middlewares.use(createPageRoutingMiddleware(false));
    },
  };
}

function flattenPagesPlugin(): Plugin {
  return {
    name: 'flatten-pages',
    enforce: 'post',
    generateBundle(_: unknown, bundle: OutputBundle): void {
      for (const fileName of Object.keys(bundle)) {
        if (fileName.startsWith('src/pages/') && fileName.endsWith('.html')) {
          const newFileName = fileName.replace('src/pages/', '');
          bundle[newFileName] = bundle[fileName];
          bundle[newFileName].fileName = newFileName;
          delete bundle[fileName];
        }
      }
      if (process.env.SIMPLE_MODE === 'true' && bundle['simple-index.html']) {
        bundle['index.html'] = bundle['simple-index.html'];
        bundle['index.html'].fileName = 'index.html';
        delete bundle['simple-index.html'];
      }
    },
  };
}

function rewriteHtmlPathsPlugin(): Plugin {
  const baseUrl = process.env.BASE_URL || '/';
  const normalizedBase = baseUrl.replace(/\/?$/, '/');

  const escapedBase = normalizedBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return {
    name: 'rewrite-html-paths',
    enforce: 'post',
    generateBundle(_: unknown, bundle: OutputBundle): void {
      if (normalizedBase === '/') return;

      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith('.html')) {
          const asset = bundle[fileName];
          if (asset.type === 'asset' && typeof asset.source === 'string') {
            const hrefRegex = new RegExp(
              `href="\\/(?!${escapedBase.slice(1)}|test\\/|http|\\/\\/)`,
              'g'
            );
            const srcRegex = new RegExp(
              `src="\\/(?!${escapedBase.slice(1)}|test\\/|http|\\/\\/)`,
              'g'
            );
            const contentRegex = new RegExp(
              `content="\\/(?!${escapedBase.slice(1)}|test\\/|http|\\/\\/)`,
              'g'
            );

            asset.source = asset.source
              .replace(hrefRegex, `href="${normalizedBase}`)
              .replace(srcRegex, `src="${normalizedBase}`)
              .replace(contentRegex, `content="${normalizedBase}`);
          }
        }
      }
    },
  };
}

export default defineConfig(() => {
  const USE_CDN = process.env.VITE_USE_CDN === 'true';
  const compressionMode = process.env.COMPRESSION_MODE || 'o';
  const enableBrotli =
    compressionMode === 'b' || compressionMode === 'all';
  const enableGzip = compressionMode === 'g' || compressionMode === 'all';
  const generatedBlogInputs = getGeneratedBlogInputs();

  if (USE_CDN) {
    console.log('[Vite] Using CDN for WASM files (with local fallback)');
  } else {
    console.log('[Vite] Using local WASM files only');
  }

  const staticCopyTargets = [
    {
      src: 'node_modules/embedpdf-snippet/dist/pdfium.wasm',
      dest: 'embedpdf',
    },
  ];

  return {
    base: (process.env.BASE_URL || '/').replace(/\/?$/, '/'),
    plugins: [
      // basicSsl(),
      handlebars({
        partialDirectory: resolve(__dirname, 'src/partials'),
        context: {
          baseUrl: (process.env.BASE_URL || '/').replace(/\/?$/, '/'),
          simpleMode: process.env.SIMPLE_MODE === 'true',
          brandName: process.env.VITE_BRAND_NAME || '',
          brandLogo: process.env.VITE_BRAND_LOGO || '',
          footerText: process.env.VITE_FOOTER_TEXT || '',
          appVersion: process.env.npm_package_version || 'Unknown',
        },
      }),
      serverUtilitiesPlugin(),
      flattenPagesPlugin(),
      rewriteHtmlPathsPlugin(),
      tailwindcss(),
      nodePolyfills({
        include: ['buffer', 'stream', 'util', 'zlib', 'process'],
        globals: {
          Buffer: true,
          global: false,
          process: true,
        },
      }),
      viteStaticCopy({
        targets: staticCopyTargets,
      }),
      ...(enableBrotli
        ? [
            viteCompression({
              algorithm: 'brotliCompress',
              ext: '.br',
              threshold: 1024,
              compressionOptions: {
                params: {
                  [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
                  [zlibConstants.BROTLI_PARAM_MODE]:
                    zlibConstants.BROTLI_MODE_TEXT,
                },
              },
              deleteOriginFile: false,
            }),
          ]
        : []),
      ...(enableGzip
        ? [
            viteCompression({
              algorithm: 'gzip',
              ext: '.gz',
              threshold: 1024,
              compressionOptions: {
                level: 9,
              },
              deleteOriginFile: false,
            }),
          ]
        : []),
    ],
    define: {
      __SIMPLE_MODE__: JSON.stringify(process.env.SIMPLE_MODE === 'true'),
      __BRAND_NAME__: JSON.stringify(process.env.VITE_BRAND_NAME || ''),
      __DISABLED_TOOLS__: JSON.stringify(
        (process.env.DISABLE_TOOLS || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      ),
    },
    resolve: {
      alias: {
        '@/types': resolve(__dirname, 'src/js/types/index.ts'),
        stream: 'stream-browserify',
        zlib: 'browserify-zlib',
      },
    },
    optimizeDeps: {
      include: ['pdfkit', 'blob-stream'],
      exclude: ['coherentpdf', 'wasm-vips'],
    },
    server: {
      host: true,
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    preview: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    build: {
      rollupOptions: {
        input: {
          main:
            process.env.SIMPLE_MODE === 'true'
              ? resolve(__dirname, 'simple-index.html')
              : resolve(__dirname, 'index.html'),
          about: resolve(__dirname, 'about.html'),
          contact: resolve(__dirname, 'contact.html'),
          cookies: resolve(__dirname, 'cookies.html'),
          disclaimer: resolve(__dirname, 'disclaimer.html'),
          faq: resolve(__dirname, 'faq.html'),
          guides: resolve(__dirname, 'guides.html'),
          'how-it-works': resolve(__dirname, 'how-it-works.html'),
          'how-to-compress-a-pdf-for-email': resolve(
            __dirname,
            'how-to-compress-a-pdf-for-email.html'
          ),
          'how-to-convert-images-to-pdf': resolve(
            __dirname,
            'how-to-convert-images-to-pdf.html'
          ),
          'how-to-convert-pdf-tables-to-excel': resolve(
            __dirname,
            'how-to-convert-pdf-tables-to-excel.html'
          ),
          'how-to-convert-pdf-to-word': resolve(
            __dirname,
            'how-to-convert-pdf-to-word.html'
          ),
          'how-to-extract-text-from-a-pdf': resolve(
            __dirname,
            'how-to-extract-text-from-a-pdf.html'
          ),
          'how-to-merge-pdf-files': resolve(
            __dirname,
            'how-to-merge-pdf-files.html'
          ),
          'how-to-organize-pages-in-a-pdf': resolve(
            __dirname,
            'how-to-organize-pages-in-a-pdf.html'
          ),
          'how-to-prepare-a-pdf-for-archiving': resolve(
            __dirname,
            'how-to-prepare-a-pdf-for-archiving.html'
          ),
          'how-to-recover-a-damaged-pdf': resolve(
            __dirname,
            'how-to-recover-a-damaged-pdf.html'
          ),
          'how-to-remove-pdf-metadata': resolve(
            __dirname,
            'how-to-remove-pdf-metadata.html'
          ),
          'how-to-scan-and-ocr-a-pdf': resolve(
            __dirname,
            'how-to-scan-and-ocr-a-pdf.html'
          ),
          privacy: resolve(__dirname, 'privacy.html'),
          terms: resolve(__dirname, 'terms.html'),
          licensing: resolve(__dirname, 'licensing.html'),
          'pdf-conversion-and-ocr-faq': resolve(
            __dirname,
            'pdf-conversion-and-ocr-faq.html'
          ),
          'pdf-privacy-and-browser-processing-faq': resolve(
            __dirname,
            'pdf-privacy-and-browser-processing-faq.html'
          ),
          'source-code': resolve(__dirname, 'source-code.html'),
          tools: resolve(__dirname, 'tools.html'),
          workflows: resolve(__dirname, 'workflows.html'),
          '404': resolve(__dirname, '404.html'),
          ...generatedBlogInputs,
          // Category Hub Pages
          'pdf-converter': resolve(__dirname, 'pdf-converter.html'),
          'pdf-editor': resolve(__dirname, 'pdf-editor.html'),
          'pdf-security': resolve(__dirname, 'pdf-security.html'),
          'pdf-merge-split': resolve(__dirname, 'pdf-merge-split.html'),
          // Tool Pages
          bookmark: resolve(__dirname, 'src/pages/bookmark.html'),
          'table-of-contents': resolve(
            __dirname,
            'src/pages/table-of-contents.html'
          ),
          'pdf-to-json': resolve(__dirname, 'src/pages/pdf-to-json.html'),
          'json-to-pdf': resolve(__dirname, 'src/pages/json-to-pdf.html'),
          'pdf-multi-tool': resolve(__dirname, 'src/pages/pdf-multi-tool.html'),
          'add-stamps': resolve(__dirname, 'src/pages/add-stamps.html'),
          'form-creator': resolve(__dirname, 'src/pages/form-creator.html'),
          'repair-pdf': resolve(__dirname, 'src/pages/repair-pdf.html'),
          'merge-pdf': resolve(__dirname, 'src/pages/merge-pdf.html'),
          'split-pdf': resolve(__dirname, 'src/pages/split-pdf.html'),
          'compress-pdf': resolve(__dirname, 'src/pages/compress-pdf.html'),
          'edit-pdf': resolve(__dirname, 'src/pages/edit-pdf.html'),
          'jpg-to-pdf': resolve(__dirname, 'src/pages/jpg-to-pdf.html'),
          'sign-pdf': resolve(__dirname, 'src/pages/sign-pdf.html'),
          'crop-pdf': resolve(__dirname, 'src/pages/crop-pdf.html'),
          'extract-pages': resolve(__dirname, 'src/pages/extract-pages.html'),
          'delete-pages': resolve(__dirname, 'src/pages/delete-pages.html'),
          'organize-pdf': resolve(__dirname, 'src/pages/organize-pdf.html'),
          'overlay-pdf': resolve(__dirname, 'src/pages/overlay-pdf.html'),
          'page-numbers': resolve(__dirname, 'src/pages/page-numbers.html'),
          'add-page-labels': resolve(
            __dirname,
            'src/pages/add-page-labels.html'
          ),
          'add-watermark': resolve(__dirname, 'src/pages/add-watermark.html'),
          'header-footer': resolve(__dirname, 'src/pages/header-footer.html'),
          'invert-colors': resolve(__dirname, 'src/pages/invert-colors.html'),
          'scanner-effect': resolve(__dirname, 'src/pages/scanner-effect.html'),
          'pdf-workflow': resolve(__dirname, 'src/pages/pdf-workflow.html'),
          'adjust-colors': resolve(__dirname, 'src/pages/adjust-colors.html'),
          'background-color': resolve(
            __dirname,
            'src/pages/background-color.html'
          ),
          'text-color': resolve(__dirname, 'src/pages/text-color.html'),
          'remove-annotations': resolve(
            __dirname,
            'src/pages/remove-annotations.html'
          ),
          'remove-blank-pages': resolve(
            __dirname,
            'src/pages/remove-blank-pages.html'
          ),
          'image-to-pdf': resolve(__dirname, 'src/pages/image-to-pdf.html'),
          'png-to-pdf': resolve(__dirname, 'src/pages/png-to-pdf.html'),
          'webp-to-pdf': resolve(__dirname, 'src/pages/webp-to-pdf.html'),
          'svg-to-pdf': resolve(__dirname, 'src/pages/svg-to-pdf.html'),
          'form-filler': resolve(__dirname, 'src/pages/form-filler.html'),
          'reverse-pages': resolve(__dirname, 'src/pages/reverse-pages.html'),
          'add-blank-page': resolve(__dirname, 'src/pages/add-blank-page.html'),
          'divide-pages': resolve(__dirname, 'src/pages/divide-pages.html'),
          'rotate-pdf': resolve(__dirname, 'src/pages/rotate-pdf.html'),
          'rotate-custom': resolve(__dirname, 'src/pages/rotate-custom.html'),
          'n-up-pdf': resolve(__dirname, 'src/pages/n-up-pdf.html'),
          'combine-single-page': resolve(
            __dirname,
            'src/pages/combine-single-page.html'
          ),
          'view-metadata': resolve(__dirname, 'src/pages/view-metadata.html'),
          'edit-metadata': resolve(__dirname, 'src/pages/edit-metadata.html'),
          'pdf-to-zip': resolve(__dirname, 'src/pages/pdf-to-zip.html'),
          'alternate-merge': resolve(
            __dirname,
            'src/pages/alternate-merge.html'
          ),
          'compare-pdfs': resolve(__dirname, 'src/pages/compare-pdfs.html'),
          'add-attachments': resolve(
            __dirname,
            'src/pages/add-attachments.html'
          ),
          'edit-attachments': resolve(
            __dirname,
            'src/pages/edit-attachments.html'
          ),
          'extract-attachments': resolve(
            __dirname,
            'src/pages/extract-attachments.html'
          ),
          'ocr-pdf': resolve(__dirname, 'src/pages/ocr-pdf.html'),
          'posterize-pdf': resolve(__dirname, 'src/pages/posterize-pdf.html'),
          'fix-page-size': resolve(__dirname, 'src/pages/fix-page-size.html'),
          'remove-metadata': resolve(
            __dirname,
            'src/pages/remove-metadata.html'
          ),
          'decrypt-pdf': resolve(__dirname, 'src/pages/decrypt-pdf.html'),
          'flatten-pdf': resolve(__dirname, 'src/pages/flatten-pdf.html'),
          'encrypt-pdf': resolve(__dirname, 'src/pages/encrypt-pdf.html'),
          'linearize-pdf': resolve(__dirname, 'src/pages/linearize-pdf.html'),
          'remove-restrictions': resolve(
            __dirname,
            'src/pages/remove-restrictions.html'
          ),
          'change-permissions': resolve(
            __dirname,
            'src/pages/change-permissions.html'
          ),
          'sanitize-pdf': resolve(__dirname, 'src/pages/sanitize-pdf.html'),
          'page-dimensions': resolve(
            __dirname,
            'src/pages/page-dimensions.html'
          ),
          'bmp-to-pdf': resolve(__dirname, 'src/pages/bmp-to-pdf.html'),
          'heic-to-pdf': resolve(__dirname, 'src/pages/heic-to-pdf.html'),
          'tiff-to-pdf': resolve(__dirname, 'src/pages/tiff-to-pdf.html'),
          'txt-to-pdf': resolve(__dirname, 'src/pages/txt-to-pdf.html'),
          'markdown-to-pdf': resolve(
            __dirname,
            'src/pages/markdown-to-pdf.html'
          ),
          'pdf-to-bmp': resolve(__dirname, 'src/pages/pdf-to-bmp.html'),
          'pdf-to-greyscale': resolve(
            __dirname,
            'src/pages/pdf-to-greyscale.html'
          ),
          'pdf-to-jpg': resolve(__dirname, 'src/pages/pdf-to-jpg.html'),
          'pdf-to-png': resolve(__dirname, 'src/pages/pdf-to-png.html'),
          'pdf-to-tiff': resolve(__dirname, 'src/pages/pdf-to-tiff.html'),
          'pdf-to-cbz': resolve(__dirname, 'src/pages/pdf-to-cbz.html'),
          'pdf-to-webp': resolve(__dirname, 'src/pages/pdf-to-webp.html'),
          'pdf-to-docx': resolve(__dirname, 'src/pages/pdf-to-docx.html'),
          'extract-images': resolve(__dirname, 'src/pages/extract-images.html'),
          'pdf-to-markdown': resolve(
            __dirname,
            'src/pages/pdf-to-markdown.html'
          ),
          'rasterize-pdf': resolve(__dirname, 'src/pages/rasterize-pdf.html'),
          'prepare-pdf-for-ai': resolve(
            __dirname,
            'src/pages/prepare-pdf-for-ai.html'
          ),
          'pdf-layers': resolve(__dirname, 'src/pages/pdf-layers.html'),
          'pdf-to-pdfa': resolve(__dirname, 'src/pages/pdf-to-pdfa.html'),
          'odt-to-pdf': resolve(__dirname, 'src/pages/odt-to-pdf.html'),
          'csv-to-pdf': resolve(__dirname, 'src/pages/csv-to-pdf.html'),
          'rtf-to-pdf': resolve(__dirname, 'src/pages/rtf-to-pdf.html'),
          'word-to-pdf': resolve(__dirname, 'src/pages/word-to-pdf.html'),
          'excel-to-pdf': resolve(__dirname, 'src/pages/excel-to-pdf.html'),
          'powerpoint-to-pdf': resolve(
            __dirname,
            'src/pages/powerpoint-to-pdf.html'
          ),
          'pdf-booklet': resolve(__dirname, 'src/pages/pdf-booklet.html'),
          'xps-to-pdf': resolve(__dirname, 'src/pages/xps-to-pdf.html'),
          'mobi-to-pdf': resolve(__dirname, 'src/pages/mobi-to-pdf.html'),
          'epub-to-pdf': resolve(__dirname, 'src/pages/epub-to-pdf.html'),
          'fb2-to-pdf': resolve(__dirname, 'src/pages/fb2-to-pdf.html'),
          'cbz-to-pdf': resolve(__dirname, 'src/pages/cbz-to-pdf.html'),
          'wpd-to-pdf': resolve(__dirname, 'src/pages/wpd-to-pdf.html'),
          'wps-to-pdf': resolve(__dirname, 'src/pages/wps-to-pdf.html'),
          'xml-to-pdf': resolve(__dirname, 'src/pages/xml-to-pdf.html'),
          'pages-to-pdf': resolve(__dirname, 'src/pages/pages-to-pdf.html'),
          'odg-to-pdf': resolve(__dirname, 'src/pages/odg-to-pdf.html'),
          'ods-to-pdf': resolve(__dirname, 'src/pages/ods-to-pdf.html'),
          'odp-to-pdf': resolve(__dirname, 'src/pages/odp-to-pdf.html'),
          'pub-to-pdf': resolve(__dirname, 'src/pages/pub-to-pdf.html'),
          'vsd-to-pdf': resolve(__dirname, 'src/pages/vsd-to-pdf.html'),
          'psd-to-pdf': resolve(__dirname, 'src/pages/psd-to-pdf.html'),
          'pdf-to-svg': resolve(__dirname, 'src/pages/pdf-to-svg.html'),
          'extract-tables': resolve(__dirname, 'src/pages/extract-tables.html'),
          'pdf-to-csv': resolve(__dirname, 'src/pages/pdf-to-csv.html'),
          'pdf-to-excel': resolve(__dirname, 'src/pages/pdf-to-excel.html'),
          'pdf-to-text': resolve(__dirname, 'src/pages/pdf-to-text.html'),
          'digital-sign-pdf': resolve(
            __dirname,
            'src/pages/digital-sign-pdf.html'
          ),
          'timestamp-pdf': resolve(__dirname, 'src/pages/timestamp-pdf.html'),
          'validate-signature-pdf': resolve(
            __dirname,
            'src/pages/validate-signature-pdf.html'
          ),
          'email-to-pdf': resolve(__dirname, 'src/pages/email-to-pdf.html'),
          'font-to-outline': resolve(
            __dirname,
            'src/pages/font-to-outline.html'
          ),
          'deskew-pdf': resolve(__dirname, 'src/pages/deskew-pdf.html'),
          'wasm-settings': resolve(__dirname, 'src/pages/wasm-settings.html'),
          'bates-numbering': resolve(
            __dirname,
            'src/pages/bates-numbering.html'
          ),
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/tests/setup.ts',
      coverage: {
        provider: 'v8' as const,
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/tests/',
          '*.config.ts',
          '**/*.d.ts',
          'dist/',
        ],
      },
    },
  };
});
