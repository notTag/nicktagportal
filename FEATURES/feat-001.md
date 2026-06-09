# [001] Add Unleash feature flagging

- Status: open
- Created: 2026-06-09
- Priority: med
- Bump: patch

## What

Integrate an Unleash feature-flag client (e.g. `@unleash/proxy-client-vue`) into the Vue 3 shell app so flags can gate features, routes, and federated remotes.

## Why

Toggle micro-frontends and experimental features safely without redeploys, enabling gradual rollout on the federated personal site.

## Done When

- [ ] Unleash client wired into the shell app
- [ ] A sample flag controls a visible feature/route and flips live without a rebuild
