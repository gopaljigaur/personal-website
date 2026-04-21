# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (Next.js + TinaCMS visual editor)
pnpm build        # Generate embeddings, then Next.js build
pnpm start        # Run production server
pnpm embed        # Pre-compute Gemini embeddings (requires GEMINI_API_KEY)
pnpm test         # Run unit + integration tests (Vitest)
pnpm test:watch   # Vitest in watch mode
pnpm test:coverage # Coverage report
pnpm test:e2e     # E2E tests (Playwright, requires dev server)
```

Linting is enforced via Husky pre-commit hooks (Prettier + lint-staged). No separate lint command — Prettier runs automatically on commit.

### Testing

- **Unit tests**: `tests/unit/` — pure functions (`slugify`, `formatDate`, `extractHeadings`, `getRelatedPosts`, `decodeHtml`, `extractOg`, `dot`)
- **Integration tests**: `tests/integration/` — API route handlers with mocked dependencies (`@vercel/kv`, `fetch`)
- **E2E tests**: `tests/e2e/` — Playwright tests for blog TOC, tag filtering, link preview hover behavior
- CI runs unit+integration on every PR via `.github/workflows/ci.yml`; E2E runs against a production build
- Pure functions extracted to shared modules for testability: `decodeHtml`/`extractOg` → `app/lib/og-utils.ts`, `dot` exported from `app/lib/search.ts`

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

### Link preview system

Hovering external links shows an OG preview card; hovering internal blog links shows a post preview card. Both use a shared hook and portal component:

- `app/components/use-preview-card.tsx` — `usePreviewCard(cardWidth)` hook (positioning, show delay, scroll-to-hide) + `PreviewCardPortal` (renders into `document.body` via `createPortal` to avoid invalid HTML nesting inside `<p>` tags)
- `app/components/link-preview.tsx` — external links; fetches OG data from `/api/og-preview`, shows instantly with favicon+domain, upgrades with image/title/desc when data arrives
- `app/components/post-preview-link.tsx` — internal blog links; shows hero image, title, date, tags from props
- `app/api/og-preview/route.ts` — scrapes OG metadata server-side; KV-cached 7 days (`og:{sha256_16}`); rate-limited 60/hr per IP (`rl:og:{ip}`); SSRF-blocked private IPs
- Module-level `ogCache: Map` in `link-preview.tsx` shares fetched data across component instances on the same page
- Outside `.prose` context, wrap `<LinkPreview>` in `<span className="prose">` so `.prose a` styles apply naturally — do NOT replicate the styles inline

Cards are `pointer-events-none`, hidden on mobile (`hidden md:block`), positioned above the link (flips below when near top of viewport).

### TinaCMS heading IDs (critical gotcha)

TinaCMS passes context-provider-wrapped React elements as `children` to custom heading components — plain text extraction does NOT work. Heading components in `blog-post-client.tsx` use `useLayoutEffect` to **imperatively set `el.id`** from `el.textContent` after mount (no `useState`, no second render). This must run before the TOC's `useEffect` sets up the IntersectionObserver.

```tsx
useLayoutEffect(() => {
  const el = ref.current
  if (!el) return
  const slug = slugify(el.textContent ?? '')
  el.id = slug
  el.querySelector('a.anchor')?.setAttribute('href', `#${slug}`)
}, [])
```

This issue only affects the TinaCMS dev path. The MDX/production path (`mdx.tsx`) receives plain strings as children and works normally.

### Blog post client — allPosts prop

`BlogPostClient` receives `allPosts: BlogPost[]` from `page.tsx` (server component) to enable proper blog-to-blog link previews. The `tinaComponents` object (including the `a:` handler) is built inside the component via `useMemo([allPosts])` so it can look up post metadata for `/blog/[slug]` links.

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

KV key namespaces: `rl:{ip}` chat rate limit, `rl:gc:{ip}` generate-code, `rl:og:{ip}` OG preview; `cache:{hash}` chat responses, `og:{hash}` OG metadata (7d TTL).

### next.config.ts highlights

- MDX page extensions enabled
- Gravatar remote image patterns allowed
- View transitions enabled (experimental)
- `/admin` redirects to `/admin/index.html` (TinaCMS admin panel)
- `/cv` redirects to `/cv/ml`; `/cv/ml`, `/cv/research`, `/cv/ai`, `/cv/software`, `/cv/data` each redirect to their respective PDF
- `/colophon` — static page listing the tech stack; linked from footer and command palette
- CORS headers for Giscus comments CSS
