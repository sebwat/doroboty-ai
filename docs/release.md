# Release on Cloudflare

The app is published as static files on Cloudflare Workers (static assets only, no Worker script). [wrangler.jsonc](../wrangler.jsonc) points Cloudflare at the Vite build in `dist/`. Visitors' scenarios stay in their own browsers; publishing or rolling back changes no stored data.

## How a release happens

- The Cloudflare project `doroboty-ai` is connected to the GitHub repository `sebwat/doroboty-ai` through the “Cloudflare Workers & Pages” GitHub app.
- Every push to `main` starts a build on Cloudflare: install from `package-lock.json`, `npm run build`, `npx wrangler deploy` (the `wrangler` version comes from `package.json`).
- Build variable `NODE_VERSION=24` matches `.nvmrc`; check the Node version in the first build log.
- Merge to `main` only after CI (`./scripts/verify`) passes on the pull request.
- Owner of releases and incidents: Sebastian Watras.

## One-time setup (Cloudflare dashboard)

1. Workers & Pages → Create application → import a repository from GitHub.
2. Install the “Cloudflare Workers & Pages” GitHub app for `sebwat/doroboty-ai` only, then pick the repository.
3. Project name `doroboty-ai` (must equal `name` in `wrangler.jsonc`), branch `main`, build command `npm run build`, deploy command `npx wrangler deploy`.
4. Add build variable `NODE_VERSION` = `24`, then save and deploy.

## After each release

Run the [release smoke check](release-smoke-check.md) on the published `workers.dev` address.

## Rollback

1. Workers & Pages → `doroboty-ai` → Deployments.
2. On the last working version open the “…” menu → Rollback, confirm.
3. Repeat the smoke check on the restored version and record what failed.

Cloudflare keeps the 100 most recent versions for rollback. If the dashboard is unavailable, rebuild from the last good commit: revert the faulty commit on `main` and push.

## Capacity and cost

Requests to static assets are free and unlimited on Cloudflare. The free plan includes 3,000 build minutes a month and allows 20,000 files per version (25 MiB per file); the build has about 40 files.
