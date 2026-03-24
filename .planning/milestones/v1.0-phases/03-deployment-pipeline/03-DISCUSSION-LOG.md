# Phase 3: Deployment Pipeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-23
**Areas discussed:** 404.html SPA workaround, Build minification, Workflow trigger scope, GitHub repo / Pages setup

---

## 404.html SPA Workaround

**Q:** How should the 404.html SPA workaround be implemented?

| Option                 | Description                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| ✅ Simple copy         | CI copies `dist/index.html` → `dist/404.html` after build. No JS redirect needed.                      |
| Simple redirect script | 404.html encodes path into query string, redirects to `/`, index.html restores URL via sessionStorage. |

**Selected:** Simple copy
**Rationale:** Portfolio site — the brief 404 intermediate state is invisible to users. No extra JS on initial load.

---

## Build Minification

**Q:** vite.config.ts has `minify: false` with a "re-enable for production" comment. What should CI do?

| Option                 | Description                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| Remove `minify: false` | Vite defaults to true for production — cleanest config.                 |
| ✅ Keep it off for now | Leave `minify: false`, update comment. Re-enable after confirming live. |

**Selected:** Keep it off for now
**Rationale:** Easier to debug if something breaks on first deploy. Re-enable once site is confirmed working.

---

## Workflow Trigger Scope

**Q:** What should trigger the deploy workflow?

**User clarification:** Familiar with GitLab CI manual deploy gates for higher environments. Wants the GitHub Actions equivalent.

| Option                             | Description                                                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `workflow_dispatch` only           | Manual trigger only — exact GitLab `when: manual` equivalent.                                                          |
| Auto on main + `workflow_dispatch` | Auto-deploy on push, plus manual override.                                                                             |
| ✅ Auto + environment gate         | Build runs automatically on push to main. Deploy job requires manual approval via GitHub Environment protection rules. |

**Selected:** Auto + environment gate
**Additional requirement raised:** Ability to rollback to a previous build.

**Rollback design agreed:**

- `deploy.yml` uploads `dist/` as an artifact after each build
- `rollback.yml` is a `workflow_dispatch`-only workflow that takes a `run_id` input and redeploys that artifact
- GitHub's Deployments tab provides built-in audit log (no extra tooling needed)
- Artifact retention: 30 days (rollback window)

---

## GitHub Repo / Pages Setup

**Q:** What is the current state of the GitHub repo and Pages configuration?

**User:** The repo exists (it's this repo — `notTag/nicktagportal`). CNAME file has not been added yet. Pages source not configured yet.

**Agreed setup:**

- CNAME file created in `apps/shell/public/` as part of this phase
- Plan includes one-time manual checklist:
  1. Set Pages source to "GitHub Actions" in repo settings
  2. Enter custom domain `nicktag.tech` in Pages settings after CNAME is pushed
  3. Create `production` environment with required reviewer
  4. Confirm DNS records point to GitHub Pages IPs

**Repo:** `notTag/nicktagportal`
