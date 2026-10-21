# Technical Debt & Roadmap

**Last reviewed:** 2026-10-21

This replaces the old `IMPROVEMENT_PLAN.md`. It tracks the remaining technical debt after the October 2026 cleanup, not aspirational feature ideas alone.

## Completed in the 2026-10 clean-up

- Removed unused packages (`@heroui/avatar`, `@heroui/pagination`, `@react-aria/ssr`, `@react-aria/visually-hidden`, `intl-messageformat`, unused ESLint plugins) and the deprecated `@types/react-pdf` stub.
- Declared the real PDF.js dependency (`pdfjs-dist`) and HeroUI's `framer-motion` peer instead of relying on hoisting.
- Updated Next.js, React, TypeScript, Tailwind CSS, HeroUI, ESLint, and Prettier to current compatible releases.
- Replaced ESLint's Prettier rule with a separate Prettier check; lint no longer rewrites every file.
- Added `.gitattributes`, `.editorconfig`, `.prettierrc`, and a generated-worker ignore rule; normalised the working tree to LF.
- Added CI (lint, format check, typecheck, production build).
- Fixed anchor scroll offset, modified-click handling, mobile active-nav positioning, error/404 pages, JSON-LD escaping, Open Graph dimensions, and JSON-LD email/image data.
- Kept the background animation always on (paused only while the tab is hidden), matching the existing visual intent.
- Added HSTS, Permissions-Policy, and COOP to the existing security headers.
- Added `engines`, `packageManager`, `ROADMAP.md`, and an accurate README/AGENTS guide.

## Open: dependency majors

These are intentionally deferred until they can be tested as a focused change-set.

| Package         | Current | Latest  | Why deferred                                                                      |
| --------------- | ------- | ------- | --------------------------------------------------------------------------------- |
| `react-pdf`     | 10.5.0  | 11.0.0  | Major release; re-verify worker build, CSS imports, and PDF.js 6 API changes.     |
| `pdfjs-dist`    | 5.4.296 | 6.4.299 | Must move with `react-pdf`; worker path and browser support need validation.      |
| `typescript`    | 5.9.3   | 7.0.2   | Major compiler release; verify Next.js, ESLint, and editor compatibility.         |
| `eslint`        | 9.39.5  | 10.13.0 | Major release; wait for the flat-config plugin ecosystem to settle.               |
| `framer-motion` | 11.18.2 | 14.5.0  | HeroUI peer allows it, but the API/runtime change needs visual regression checks. |

Use `bun outdated` to re-check. Update one major at a time, run `bun run check`, `bun run build`, and manually verify the résumé viewer and navbar animations.

## Open: product and content

- **Theme:** the site is dark-only. Either implement a real light theme (navbar, panels, publications, PDF viewer) or remove `next-themes` and set the `dark` class directly. The current setup is documented as dark-only but still carries the theme provider.
- **Projects section:** the biggest content gap. Add project cards with stack tags and repository/demo links.
- **Skills:** add a small categorised stack summary, either in About or a separate section.
- **Contact:** replace `mailto:` with a validated form and a provider such as Resend, including spam protection and success/error states.
- **Content freshness:** review `data/about.json` and the Kambi/current-role wording each time the résumé changes.
- **Open Graph image:** `/profile.webp` is 1200 × 1195 (square). A dedicated 1200 × 630 social card would render better in link previews.

## Open: engineering

- **Tests:** no test runner yet. Add Vitest + React Testing Library and start with `Section`, `Publications`, and the résumé lazy-loading state.
- **Motion:** the background animates regardless of the OS reduced-motion preference, and there is no explicit pause control (WCAG 2.2.2). If that becomes a concern, add a small pause toggle rather than silently freezing the visual for everyone who has reduced motion enabled.
- **PDF viewer:** add a visible retry control on load failure and consider rendering only the first page (already the case) with a clear page count.
- **Analytics:** pick a privacy-first option or Vercel Analytics; update the privacy note if one is added.
- **Bundle analysis:** add `@next/bundle-analyzer` as a one-off script rather than a permanent dependency.
- **`next.config.js`:** migrate to `next.config.ts` when touching the config again; no functional urgency.
- **`types/` and `lib/`:** do not reintroduce empty catch-all folders. Colocate types and helpers with their consumers.

## Verification checklist

Run before merging or deploying:

```bash
bun install --frozen-lockfile
bun run check
bun run build
bun run start
```

Then manually verify: home hero, navbar active state and mobile menu, background animation, résumé lazy load and PDF open fallback, publications, contact links, and 404 page.
