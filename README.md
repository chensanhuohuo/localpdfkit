# LocalPDFKit

<p align="center">
  <img src="public/images/localpdfkit-mark.svg" width="88" alt="LocalPDFKit logo">
</p>

<p align="center">
  <strong>LocalPDFKit</strong> is a privacy-first, browser-based PDF tools website built for local file processing, English PDF tutorials, and static deployment.
</p>

<p align="center">
  <a href="https://localpdfkit.com">Website</a> |
  <a href="https://github.com/chensanhuohuo/localpdfkit">Source Code</a> |
  <a href="./LICENSE">AGPL-3.0 License</a>
</p>

## Important Notice

LocalPDFKit is a modified derivative of the open-source project [BentoPDF](https://github.com/alam00000/bentopdf).

This repository is not the official BentoPDF project and is not affiliated with, endorsed by, or sponsored by the BentoPDF maintainers. The BentoPDF name, project identity, and upstream work belong to their respective owners and contributors.

LocalPDFKit keeps the project open source under the GNU Affero General Public License v3.0 only (AGPL-3.0-only). If you deploy a modified version of this project and make it available over a network, you must provide the corresponding source code to users as required by the AGPL.

## What This Fork Changes

LocalPDFKit keeps BentoPDF's browser-based PDF processing foundation and adapts it into a public vertical tools website.

Major changes include:

- Rebranded the site from BentoPDF to LocalPDFKit.
- Configured the production domain as `localpdfkit.com`.
- Converted the project into an English-only website.
- Added LocalPDFKit logo, favicon, Apple touch icon, Open Graph image, and site metadata.
- Updated titles, descriptions, canonical URLs, Open Graph metadata, and structured data for the LocalPDFKit brand.
- Added legal and trust pages such as About, Contact, Privacy, Terms, FAQ, Cookies, Disclaimer, Licensing, and Source Code.
- Added tutorial and blog content for PDF workflows, PDF privacy, PDF conversion, OCR, compression, merging, splitting, and document preparation use cases.
- Added blog listing, pagination, internal links, and content distribution pages.
- Adjusted the visual design toward a bright, SaaS-style PDF tools website.
- Preserved the client-side processing model where supported: files are processed in the user's browser instead of being uploaded to an application server.

## License

This project is licensed under the [GNU Affero General Public License v3.0](./LICENSE).

Because LocalPDFKit is based on BentoPDF and follows the AGPL path, please follow these rules when using, modifying, or deploying it:

- Keep the AGPL license file in the repository.
- Keep clear attribution to BentoPDF as the upstream project.
- Keep this README notice or provide an equivalent attribution notice.
- Publish the complete corresponding source code for any deployed modified version that users can access over a network.
- Include your build scripts, source files, templates, configuration examples, and modified assets needed to reproduce the deployed version.
- Do not publish only the `dist` folder as the source code for an AGPL deployment.
- Review third-party library licenses before changing dependencies or enabling additional features.

This README is provided for project transparency and is not legal advice. If you plan to use this project commercially or at scale, consult a qualified legal professional about open-source license compliance.

## Features

LocalPDFKit includes a large collection of PDF tools, including:

- Merge, split, organize, rotate, delete, and extract PDF pages.
- Compress, repair, linearize, sanitize, and flatten PDFs.
- Convert images, Office documents, Markdown, text, CSV, JSON, XML, EPUB, and other formats to PDF.
- Convert PDF pages to images, text, Markdown, CSV, JSON, SVG, and other formats where supported.
- Add watermarks, page numbers, headers, footers, stamps, attachments, and metadata changes.
- Use OCR, PDF security tools, signature validation, timestamping, and other advanced workflows where the required browser/WASM dependencies are available.
- Read English tutorials and blog posts that explain common PDF workflows.

Most tools run entirely in the browser. Some advanced tools rely on WebAssembly packages, browser workers, or optional external endpoints such as a CORS proxy for digital signature certificate fetching.

## Tech Stack

- Vite
- TypeScript
- Tailwind CSS
- Vanilla JavaScript and browser APIs
- Web Workers
- WebAssembly-based PDF/image/document processing libraries
- Static HTML content and generated blog pages

## Repository

Official LocalPDFKit source repository:

```text
https://github.com/chensanhuohuo/localpdfkit
```

Clone the repository:

```bash
git clone https://github.com/chensanhuohuo/localpdfkit.git
cd localpdfkit
```

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

The development server supports clean URLs such as:

```text
/about
/tools
/blog
/blog/page/2
/how-to-compress-a-pdf-for-email
```

## Production Build

Before building, check `.env.production`.

Recommended production values for LocalPDFKit:

```env
VITE_BRAND_NAME=LocalPDFKit
VITE_BRAND_LOGO=images/localpdfkit-mark.svg
VITE_DEFAULT_LANGUAGE=en
SITE_URL=https://localpdfkit.com
BASE_URL=/
```

Build the static site:

```bash
npm run build
```

The production files will be generated in:

```text
dist/
```

Preview the production build locally:

```bash
npm run preview
```

## Static Hosting

LocalPDFKit can be deployed as a static website after `npm run build`.

You can upload the generated `dist/` directory to:

- Nginx
- Apache
- Cloudflare Pages
- Netlify
- Vercel
- GitHub Pages
- A Linux server with a control panel such as BT/Baota Panel

For Nginx, use a fallback rule that maps clean URLs to generated `.html` files:

```nginx
location / {
    try_files $uri $uri/ $uri.html =404;
}
```

This is required because the production output contains files such as `about.html`, while users may visit clean URLs such as `/about`.

If you upload only the static `dist/` files to a server, Node.js is not required on the server. Node.js is only needed for development and building.

## Environment Variables

Common configuration:

| Variable                    | Purpose                                                        | Typical Value                        |
| --------------------------- | -------------------------------------------------------------- | ------------------------------------ |
| `VITE_BRAND_NAME`           | Site brand name displayed in the UI                            | `LocalPDFKit`                        |
| `VITE_BRAND_LOGO`           | Logo path under `public/`                                      | `images/localpdfkit-mark.svg`        |
| `VITE_DEFAULT_LANGUAGE`     | Default UI language                                            | `en`                                 |
| `SITE_URL`                  | Canonical production site URL used by sitemap/metadata scripts | `https://localpdfkit.com`            |
| `BASE_URL`                  | Public base path for deployment                                | `/`                                  |
| `VITE_CORS_PROXY_URL`       | Optional CORS proxy for digital signature certificate fetching | empty or custom proxy URL            |
| `VITE_TESSERACT_WORKER_URL` | Optional custom OCR worker URL                                 | empty unless self-hosting OCR assets |
| `VITE_TESSERACT_CORE_URL`   | Optional custom OCR core URL                                   | empty unless self-hosting OCR assets |
| `VITE_TESSERACT_LANG_URL`   | Optional custom OCR language data URL                          | empty unless self-hosting OCR assets |
| `VITE_OCR_FONT_BASE_URL`    | Optional OCR font asset base URL                               | empty unless self-hosting OCR assets |

## Blog And Tutorial Content

LocalPDFKit includes an English blog/tutorial system for SEO-friendly PDF workflow content.

Content source files are stored in:

```text
content/blog/
```

Generated blog HTML files are written to:

```text
blog/
```

Generate blog pages manually:

```bash
npm run blog:generate
```

The normal development and build commands already run blog generation automatically.

Recommended content workflow:

1. Add a new Markdown article under `content/blog/`.
2. Use a clear English title that targets a specific PDF problem.
3. Link from the article to the most relevant tool page.
4. Link from related articles back to the new article.
5. Run `npm run build` to generate the final static pages and sitemap.

## Deployment Checklist

Before publishing a production build:

- Confirm `.env.production` contains `SITE_URL=https://localpdfkit.com`.
- Run `npm run build`.
- Check `dist/robots.txt` and `dist/sitemap.xml`.
- Confirm clean URLs work on the server with the Nginx `try_files` rule.
- Confirm `/source-code` links to the public GitHub repository.
- Confirm About, Contact, Privacy, Terms, Cookies, Disclaimer, Licensing, and FAQ pages are accessible.
- Confirm the deployed version's source code is available at `https://github.com/chensanhuohuo/localpdfkit`.

## AGPL Compliance Checklist

For public deployment, keep this checklist in mind:

- The deployed website should provide a visible source code link.
- The linked repository should contain the full corresponding source code for the deployed version.
- Do not remove the AGPL license.
- Do not remove upstream attribution to BentoPDF.
- Do not imply that LocalPDFKit is the official BentoPDF website.
- If you modify the project further, publish those modifications under the same AGPL-compatible terms.
- If you add third-party code, images, fonts, or templates, make sure their licenses allow your intended use.

## Attribution

LocalPDFKit is based on BentoPDF:

- Upstream project: [BentoPDF](https://github.com/alam00000/bentopdf)
- Upstream license path: AGPL-3.0
- LocalPDFKit repository: [chensanhuohuo/localpdfkit](https://github.com/chensanhuohuo/localpdfkit)

Thanks to the BentoPDF maintainers and contributors for the original browser-based PDF toolkit.

## Disclaimer

LocalPDFKit is provided as-is, without warranty of any kind. PDF processing can vary depending on browser support, file complexity, WebAssembly availability, and third-party library behavior. Always verify important documents after processing.
