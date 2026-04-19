# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (Next.js + TinaCMS visual editor)
pnpm build        # Generate embeddings, then Next.js build
pnpm start        # Run production server
pnpm embed        # Pre-compute Gemini embeddings (requires GEMINI_API_KEY)
```

Linting is enforced via Husky pre-commit hooks (Prettier + lint-staged). No separate lint command — Prettier runs automatically on commit.

## Architecture

**Stack**: Next.js 16 App Router, React 19, Tailwind CSS v4, TinaCMS (local-only), Vercel

### Key directories

- `app/` — All routing, pages, components, and API routes
  - `app/blog/posts/` — MDX blog post files (frontmatter: `title`, `publishedAt`, `summary`, `image`, `tags[]`)
  - `app/blog/utils.shared.ts` — Shared utilities usable on both server and client: `slugify`, `formatDate`, and types `BlogPost`, `Heading`, `Metadata`
  - `app/components/` — Shared UI components
  - `app/lib/` — `profile.ts` (single source of truth for identity data, reads from `content/profile.json`), `search.ts` (embedding search)
  - `app/api/` — Serverless API routes: `/chat`, `/search`, `/generate-code`, `/contact`
  - `app/og/` — OpenGraph image generation
- `content/` — JSON data files: `profile.json`, `projects.json`, `misc.json` (all TinaCMS-managed), `embeddings.json` (generated at build)
- `tina/config.ts` — TinaCMS schema (Profile → Blog → Projects → Misc, in nav order)
- `scripts/generate-embeddings.ts` — Pre-build script; outputs `content/embeddings.json`

### Content management

All content is stored in `content/` as JSON and edited via TinaCMS at `/admin` during dev.

- **Profile**: `content/profile.json` — name, title, bio, location, contact links. `app/lib/profile.ts` re-exports this as a typed object; everything else imports from there.
- **Blog**: Static MDX files in `app/blog/posts/`. Parsed with `gray-matter` + `next-mdx-remote`. Custom MDX components in `app/components/mdx.tsx` (auto-slugified headings, Shiki syntax highlighting, internal vs external link detection).
- **Projects**: `content/projects.json`, re-exported from `app/projects/data.ts`.
- **Misc links**: `content/misc.json`, re-exported from `app/misc/data.ts`.

### TinaCMS live editing pattern

TinaCMS is **dev-only** — zero impact on production. Each TinaCMS-enabled page follows this pattern:

```tsx
// page.tsx (server component)
if (process.env.NODE_ENV === 'development') {
  try {
    // @ts-ignore — tina/__generated__ is gitignored; bundler DCEs this block in prod
    const { client } = await import('../../tina/__generated__/client')
    const tinaData = await client.queries.xxx({ relativePath: 'xxx.json' })
    return (
      <XxxClient
        query={tinaData.query}
        variables={tinaData.variables}
        data={tinaData.data}
      />
    )
  } catch {
    /* TinaCMS server not running — fall through */
  }
}
// static fallback (production path)
```

The `XxxClient` component (e.g. `home-client.tsx`, `projects-client.tsx`) is a `'use client'` component that calls `useTina()` to enable visual editing. `tina/__generated__/` is gitignored — the `@ts-ignore` suppresses the TypeScript error and Turbopack's DCE removes the block entirely in production builds.

### Chat widget architecture

`ChatWidget` (modal) is rendered once in `app/layout.tsx`. `ChatButton` (in nav) opens it via `window.dispatchEvent(new Event('openChat'))`. This custom event pattern avoids z-index stacking context issues between the nav and the modal.

### Semantic search & AI chat

- `pnpm embed` indexes profile, blog posts, and projects into `content/embeddings.json` (misc links intentionally excluded).
- `EmbeddingItem` type in `scripts/generate-embeddings.ts` and `app/lib/search.ts` must stay in sync when adding new indexed types (`profile`, `blog`, `project`, `contact`).
- `/api/chat` uses Gemini 2.5 Flash with tool calling. System prompt has no hardcoded content — the model discovers everything via search tools. Responses cached in Vercel KV (24h TTL). Rate-limited per IP (20 req/hour via KV).

### Styling

Tailwind CSS v4 configured inline in `app/global.css`. Theme variables (colors, breakpoints) are defined under `@theme` there. Dark mode via `next-themes`.

Custom breakpoints: `navrow` at 28rem (nav layout switch), `smplus` at 43rem.

All `--color-*` theme variables are usable as Tailwind utilities — e.g. `text-dark-primary`, `bg-dark-background`. Prefer these over `[var(--color-*)]` arbitrary syntax.

### MDX custom components

Used in blog posts (`app/blog/posts/*.mdx`) and registered in both `app/components/mdx.tsx` (static path) and `app/blog/[slug]/blog-post-client.tsx` (TinaCMS path):

- `<OpenGistCode url="..." />` — fetches and renders a GitHub Gist with syntax highlighting
- `<VibeSimulator />` — interactive AI app builder widget
- `<Callout type="note|warning|tip" content="..." />` — styled callout. Use the `content` prop (not children) so it works in both the static MDX path and TinaCMS's template renderer.

### Environment variables

| Variable                                         | Purpose                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| `GEMINI_API_KEY`                                 | Required — Gemini API for chat, search, embeddings                       |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_URL` | Vercel KV for rate limiting and caching (optional — degrades gracefully) |

### next.config.ts highlights

- MDX page extensions enabled
- Gravatar remote image patterns allowed
- View transitions enabled (experimental)
- `/admin` redirects to `/admin/index.html` (TinaCMS admin panel)
- `/cv` redirects to `/cv/ml`; `/cv/ml`, `/cv/research`, `/cv/ai`, `/cv/software`, `/cv/data` each redirect to their respective PDF
- CORS headers for Giscus comments CSS
