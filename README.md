# Personal Website

This is the repository for my personal website. Includes:

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4
- **Hosting**: Vercel
- **Content**: MDX blog posts + TinaCMS (dev-only visual editor)
- **AI**: Gemini 2.5 Flash — semantic chat, search, code generation
- **Comments**: Giscus (GitHub Discussions)

### Features

- AI chat widget — answers questions about me using semantic search over posts, projects, and profile
- Link previews — hover any link to see an OG preview card
- Command palette (`⌘K`) — navigate anywhere instantly
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

First, install the dependencies:

```bash
pnpm install
```

### Development

Then, run Next.js in development mode:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
TinaCMS visual editor is available at `/admin`.

### Testing

```bash
pnpm test         # Unit + integration tests (Vitest)
pnpm test:e2e     # E2E tests (Playwright)
```

### Deployment

This website is deployed on Vercel. Any push to the `main` branch will trigger a deployment.
Requires `GEMINI_API_KEY` env variable. Vercel KV is optional (caching + rate limiting).

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
