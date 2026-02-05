# Jesper Falkenby - Personal Portfolio

A modern, responsive personal portfolio website built with Next.js and optimized for performance and SEO.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/docs/getting-started) (App Router)
- **UI Components**: [HeroUI v2](https://heroui.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Tailwind Variants](https://tailwind-variants.org)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Package Manager**: [Bun](https://bun.sh/)
- **Deployment**: [Vercel](https://vercel.com/) with [Cloudflare](https://www.cloudflare.com/) DNS

## Features

- 🎨 Modern, animated UI with dark/light theme support
- 📱 Fully responsive design
- 🔍 SEO optimized with structured data and meta tags
- 📄 Interactive resume viewer with PDF.js
- 📚 Publications section
- ⚡ Optimized performance with Next.js 16
- 🌐 Semantic HTML5 and accessibility considerations

## Development

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine

### Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd personal-site-2025
```

2. Install dependencies:

```bash
bun install
```

3. Run the development server:

```bash
bun run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint with auto-fix
- `bunx tsc --noEmit` - Type checking without compilation

### Project Structure

```
├── app/                 # Next.js App Router pages and layouts
├── components/          # Reusable React components
├── config/             # Site configuration and constants
├── data/               # Static content (JSON)
├── lib/                # Utility functions
├── public/             # Static assets
├── scripts/            # Build scripts and utilities
├── styles/             # Global CSS and Tailwind config
└── types/              # TypeScript type definitions
```

## AI Development Disclaimer

This website has been largely written by the model Big Pickle on OpenCode Zen. The AI assistance was used for:

- Initial project setup and architecture
- Component development and styling
- SEO optimization implementation
- Code organization and best practices
- TypeScript type definitions

**2026-02-04 Update:** Critical accessibility and performance improvements were implemented using Kimi K2.5.

Human oversight was maintained throughout the development process, with manual review, testing, and refinement of all generated code to ensure quality, functionality, and adherence to project requirements.

## Deployment

The site is deployed on Vercel with Cloudflare handling DNS. The deployment process includes:

- Automatic builds on git push
- Optimized production builds
- Global CDN distribution
- SSL certificate management
- Custom domain configuration

## License

Licensed under the [MIT license](LICENSE).
