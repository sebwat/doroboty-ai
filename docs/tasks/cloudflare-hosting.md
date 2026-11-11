# Publish on Cloudflare Workers

## Intent and scope

The production-readiness report left five preparation items open until hosting was chosen: repeatable release, rollback, capacity, incident owner and recovery plan. The owner chose Cloudflare (existing account). New static projects go to Workers with static assets; Pages is no longer the recommended start.

## Behavior

1. `wrangler.jsonc` serves `dist/` as static assets, without a Worker script. HashRouter needs no rewrites.
2. `wrangler` is a pinned dev dependency, so Cloudflare builds use the version from the lockfile.
3. `docs/release.md` describes the one-time dashboard setup, releases from `main`, rollback, capacity and the owner; the smoke check links to it.
4. No app behavior changes. FEATURES.md was reviewed and did not need updating.

## Acceptance criteria

- [x] `npx wrangler deploy --dry-run` reads the build from `dist/` with no bindings.
- [x] `./scripts/verify` passes.
- [ ] First Cloudflare build and deploy from `main` succeed and the release smoke check passes on the published address.
- [ ] A rollback in the dashboard is tried once and the smoke check passes on the restored version.
