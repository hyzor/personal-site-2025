# Jesper Falkenby — Personal Portfolio

Personal portfolio for Jesper Falkenby, deployed at [falkenby.com](https://falkenby.com). The site is a single-page, dark-themed portfolio with an embedded résumé, publications, and contact links.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/docs) App Router with Turbopack
- **Language:** [TypeScript](https://www.typescriptlang.org/) (strict)
- **UI:** [React 19](https://react.dev/) + [HeroUI 2](https://heroui.com/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with [Tailwind Variants](https://tailwind-variants.org)
- **PDF viewer:** [react-pdf](https://github.com/wojtekmaj/react-pdf) + [PDF.js](https://mozilla.github.io/pdf.js/)
- **Theme:** [next-themes](https://github.com/pacocoursey/next-themes), pinned to dark mode
- **Package manager:** [Bun](https://bun.sh/)
- **Hosting:** [Vercel](https://vercel.com/) with [Cloudflare](https://www.cloudflare.com/) DNS

HeroUI lists `framer-motion` as a peer dependency; it is declared explicitly because HeroUI's animations import it.

## Features

- Single-page sections for home, résumé, publications, about, and contact
- Lazy-loaded PDF résumé with a text/annotation layer and a direct-PDF fallback
- Animated starfield and nebula background; the canvas pauses only while the tab is hidden
- SEO metadata, JSON-LD `Person` data, sitemap, and robots rules
- Accessibility basics: skip link, landmark structure, visible focus styles
- Security headers configured in `next.config.js`

## Requirements

- [Node.js](https://nodejs.org/) **20.9 or newer**
- [Bun](https://bun.sh/) **1.4 or newer**

## Getting Started

```bash
git clone https://github.com/hyzor/personal-site-2025.git
cd personal-site-2025
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

`prebuild` copies the PDF.js worker from `node_modules/pdfjs-dist` into `public/`. It runs automatically before both `dev` and `build`.

## Available Scripts

| Command                | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `bun run dev`          | Start the development server                        |
| `bun run build`        | Create an optimized production build                |
| `bun run start`        | Serve the production build                          |
| `bun run lint`         | Run ESLint without changing files                   |
| `bun run lint:fix`     | Run ESLint and apply safe fixes                     |
| `bun run format`       | Format the repository with Prettier                 |
| `bun run format:check` | Verify formatting without writing files             |
| `bun run typecheck`    | Generate Next.js route types and run `tsc --noEmit` |
| `bun run check`        | Run lint, formatting, and type checks               |
| `bun run prebuild`     | Copy the PDF.js worker into `public/` (internal)    |

## Project Structure

```
├── app/          # App Router pages, layout, metadata routes
├── components/   # Reusable UI and client widgets
├── config/       # Site metadata and font configuration
├── data/         # Static content (about + publications)
├── public/       # Static assets (profile image, résumé, favicon)
├── scripts/      # Build-time helper scripts
└── styles/       # Tailwind entry point and global CSS
```

## Editing Content

- Site metadata and links: [`config/site.ts`](config/site.ts)
- About text: [`data/about.json`](data/about.json)
- Publications: [`data/publications.json`](data/publications.json)
- Résumé PDF: `public/resume.pdf`
- Profile image: `public/profile.webp` (1200 × 1195)

The site is intentionally dark-only. `next-themes` is pinned to the `dark` class and system switching is disabled.

## Roadmap

Known technical debt and planned work are tracked in [`ROADMAP.md`](ROADMAP.md).

## Deployment

Vercel builds the site automatically on push. The build command is `bun run build`; the project requires Node.js 20.9 or newer. Cloudflare handles DNS, and the security headers in `next.config.js` are applied by Next.js at runtime.

## AI Assistance

Large parts of the site were originally generated with AI assistance (Big Pickle on OpenCode Zen, and later Kimi K2.5 for accessibility and performance work). All generated code was reviewed, tested, and refined manually.

## License

Licensed under the [MIT license](LICENSE).
