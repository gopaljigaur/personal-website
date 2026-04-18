# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (Next.js + TinaCMS)
pnpm build        # Generate embeddings, then Next.js build
pnpm start        # Run production server
pnpm embed        # Pre-compute Gemini embeddings (requires GEMINI_API_KEY)
```

Linting is enforced via Husky pre-commit hooks (Prettier + lint-staged). No separate lint command — Prettier runs automatically on commit.

## Architecture

**Stack**: Next.js 16 App Router, React 19, Tailwind CSS v4, TinaCMS, Vercel

### Key directories

- `app/` — All routing, pages, components, and API routes
  - `app/blog/posts/` — MDX blog post files (frontmatter: `title`, `publishedAt`, `summary`, `image`, `tags[]`)
  - `app/projects/data.ts` — Hardcoded project entries (TypeScript array)
  - `app/components/` — Shared UI components
  - `app/lib/` — Utilities: `utils.shared.ts` (usable in both server/client), search helpers
  - `app/api/` — Serverless API routes: `/chat`, `/search`, `/generate-code`
  - `app/og/` — OpenGraph image generation
- `content/` — JSON data: `embeddings.json` (generated), `misc.json` (TinaCMS-managed)
- `tina/config.ts` — TinaCMS schema (Blog + Misc collections)
- `scripts/generate-embeddings.ts` — Pre-build script; outputs `content/embeddings.json`

### Content management

- **Blog**: Static MDX files in `app/blog/posts/`. Parsed with `gray-matter` + `next-mdx-remote`. Custom MDX components live in `app/components/mdx.tsx` (auto-slugified headings, Shiki syntax highlighting, internal vs external link detection).
- **Projects**: Static TypeScript array in `app/projects/data.ts`.
- **Misc links**: `content/misc.json`, edited via TinaCMS UI at `/admin`.

### Semantic search & AI chat

- `pnpm embed` runs `scripts/generate-embeddings.ts`, which calls the Gemini embedding API over all blog/project/misc content and writes `content/embeddings.json`.
- `/api/search` performs dot-product similarity search against those embeddings.
- `/api/chat` uses Gemini 2.5 Flash with tool calling — the model can invoke site search mid-conversation. Responses are cached in Vercel KV (24h TTL, keyed by embeddings hash + prompt). Rate-limited per IP (20 req/hour via KV).

### Styling

Tailwind CSS v4 configured inline in `app/global.css` via `@import`. Theme variables (light/dark colors, breakpoints) are defined there under `@theme`. Dark mode via `next-themes`.

Custom breakpoints: `navrow` at 28rem (nav switches from stacked to single row), `smplus` at 43rem.

All `--color-*` variables in `@theme` are usable directly as Tailwind utilities — e.g., `text-dark-primary`, `bg-dark-background`, `from-dark-secondary`. Prefer these over `[var(--color-*)]` arbitrary syntax.

### MDX custom components

Available for use in blog posts (`app/blog/posts/*.mdx`):

- `<OpenGistCode url="..." />` — fetches and renders a GitHub Gist file with syntax highlighting
- `<VibeSimulator />` — interactive AI app builder widget
- `<Callout>` — styled callout block

### Environment variables

| Variable                                         | Purpose                                                                           |
| ------------------------------------------------ | --------------------------------------------------------------------------------- |
| `GEMINI_API_KEY`                                 | Required — Gemini API for chat, search, embeddings                                |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_URL` | Vercel KV for rate limiting and response caching (optional — degrades gracefully) |

### next.config.ts highlights

- MDX page extensions enabled
- Gravatar remote image patterns allowed
- View transitions enabled (experimental)
- Redirect aliases: `/cv/ml`, `/cv/research`, etc. → external CV URLs
- CORS headers for Giscus comments CSS
