# nick-site

A personal portfolio and micro-frontend playground built as a Bun monorepo with a Vue 3 shell app. The shell app hosts micro-frontends via Module Federation — federation infrastructure is scaffolded upfront but the shell works as a polished standalone site from day one.

Live at [nicktag.tech](https://nicktag.tech)

## Tech Stack

- **Runtime / Package Manager:** Bun 1.1+
- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Build Tool:** Vite 6
- **Language:** TypeScript (strict mode)
- **Styling:** TailwindCSS v4 (CSS-first config)
- **Routing:** Vue Router 4 (HTML5 history mode)
- **State:** Pinia
- **Federation:** @originjs/vite-plugin-federation
- **Hosting:** GitHub Pages (migrating to AWS later)

## Monorepo Structure

```
nick-site/
├── apps/
│   └── shell/          # Vue 3 shell app (the main site)
├── packages/
│   ├── ui/             # Shared UI components (TheHeader, TheFooter, AppLayout)
│   └── types/          # Shared TypeScript types
├── .github/
│   └── workflows/
│       ├── deploy.yml  # Build + deploy on push to main
│       └── rollback.yml # Roll back to a previous deployment
└── package.json        # Bun workspace root
```

## Getting Started

```bash
# Install dependencies (from repo root)
bun install

# Start dev server
bun run dev

# Type-check
bun run typecheck

# Lint + format
bun run lint
bun run format

# Production build
bun run build
```

## Deployment

The site deploys automatically to GitHub Pages when you push to `main`.

### How It Works

1. **Push to main** — The `deploy.yml` workflow triggers automatically
2. **Build** — The build job checks out the repo, installs dependencies with Bun, and runs `bun run build` in `apps/shell`
3. **SPA routing** — After build, `index.html` is copied to `404.html` so GitHub Pages serves the app for all routes (not just `/`)
4. **Approval gate** — The deploy job pauses and waits for a required reviewer to approve in the GitHub Actions UI
5. **Deploy** — After approval, the built artifact is deployed to GitHub Pages

### Watching a Deploy

After pushing to main:

1. Go to the repo on GitHub → **Actions** tab
2. Click the running **"Deploy to GitHub Pages"** workflow
3. The **build** job runs automatically
4. The **deploy** job shows **"Waiting for review"** with a yellow clock icon
5. Click **"Review deployments"** → check **production** → **"Approve and deploy"**

### Rolling Back

If a deploy goes wrong:

1. Go to **Actions** tab → find the **deploy run** you want to roll back to
2. Copy the **run ID** from the URL (the number in `/actions/runs/123456789`)
3. Go to **Actions** → **Rollback Deployment** → **Run workflow**
4. Paste the run ID → click **Run workflow**
5. Approve the deployment when prompted

### First-Time Setup

Before the first deploy, configure these in your GitHub repo:

1. **Settings → Pages → Source** → select "GitHub Actions"
2. **Settings → Environments → New environment** → name it `production` → add yourself as a required reviewer
3. **Settings → Pages → Custom domain** → enter `nicktag.tech`
4. **DNS provider** → A records for `nicktag.tech` pointing to:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
