# Personal Website

Repository for [gopalji.me](https://gopalji.me). Includes:

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4
- **Hosting**: Vercel
- **Content**: MDX blog posts + TinaCMS (dev-only visual editor)
- **AI**: Gemini (model fallback chain) — semantic chat, search, code generation
- **Comments**: Giscus (GitHub Discussions)

### Features

- AI chat widget — answers questions about me using semantic search over posts, projects, and profile; model fallback chain: `gemini-3-flash-preview` → `gemini-2.5-flash` → `gemini-3.1-flash-lite-preview`
- Vibe coder — generates UI mockups from a prompt (`gemini-3.1-flash-lite-preview`)
- GitHub Gist embeds — syntax-highlighted code blocks fetched via `/api/gist` proxy
- Link previews — hover any link to see an OG preview card
- Command palette (`⌘K`) — navigate anywhere instantly
- Newsletter subscription
- Table of contents with active heading tracking
- Pre-computed Gemini embeddings for semantic search (no external vector DB)

### Pages

- Home
- Blog (filterable by tag)
- Projects
- Misc (bookmarks)
- CV
- Colophon (tech stack)

### Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). TinaCMS visual editor at `/admin`.

### Testing

```bash
pnpm test         # Unit + integration tests (Vitest)
pnpm test:e2e     # E2E tests (Playwright)
```

### Environment Variables

| Variable                                                                        | Required | Purpose                                                                       |
| ------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `GEMINI_API_KEY`                                                                | Yes      | Chat, search, embeddings                                                      |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_URL`, `KV_REST_API_READ_ONLY_TOKEN` | No       | Rate limiting + response caching — set automatically by Vercel KV integration |
| `RESEND_API_KEY`                                                                | No       | Contact form + newsletter emails                                              |
| `CRON_SECRET`                                                                   | No       | Authenticates cron job endpoint + HMAC-signs unsubscribe tokens               |

### Deployment

Deployed on Vercel. Push to `main` triggers a deployment.

### License

MIT — see [LICENSE](LICENSE).
