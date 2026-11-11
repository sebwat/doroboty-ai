# Release on Cloudflare

The app is published as static files on Cloudflare Workers. [wrangler.jsonc](../wrangler.jsonc) points Cloudflare at the Vite build in `dist/`. A small Worker ([src/worker](../src/worker/index.ts)) runs only for page requests and redirects plain `http://` to `https://`; build files (`/assets`, `/case`, `/company-logos`, `/cv`) are served without it. Visitors' scenarios stay in their own browsers; publishing or rolling back changes no stored data.

## How a release happens

- The Cloudflare project `doroboty-ai` is connected to the GitHub repository `sebwat/doroboty-ai` through the “Cloudflare Workers & Pages” GitHub app.
- Every push to `main` starts a build on Cloudflare: install from `package-lock.json`, `npm run build`, `npx wrangler deploy` (the `wrangler` version comes from `package.json`).
- Build variable `NODE_VERSION=24` matches `.nvmrc`; check the Node version in the first build log.
- Each pull request branch also gets a Cloudflare Preview build (`npx wrangler preview`, needs the `previews` block in `wrangler.jsonc`); its check and preview address appear on the pull request.
- Merge to `main` only after CI (`./scripts/verify`) passes on the pull request.
- Owner of releases and incidents: Sebastian Watras.

## One-time setup (Cloudflare dashboard)

1. Workers & Pages → Create application → import a repository from GitHub.
2. Install the “Cloudflare Workers & Pages” GitHub app for `sebwat/doroboty-ai` only, then pick the repository.
3. Project name `doroboty-ai` (must equal `name` in `wrangler.jsonc`), branch `main`, build command `npm run build`, deploy command `npx wrangler deploy`.
4. Add build variable `NODE_VERSION` = `24`, then save and deploy.

## After each release

Run the [release smoke check](release-smoke-check.md) on the published `workers.dev` address, and check that `http://` answers with a 301 redirect to `https://`.

## When something breaks

Signals: the smoke check fails, the address shows a blank page or the “Coś poszło nie tak” screen, a visitor reports a problem, or a Cloudflare build fails.

1. Diagnose (10 minutes at most): open the address in a private window and read the browser console; in Cloudflare open `doroboty-ai` → Deployments and the latest build log; on GitHub check the CI run of the last merged pull request. Note what failed and since which version.
2. If the newest version is the cause, or the cause is unclear, roll back (below). A failed build needs no rollback: the previous version stays published.
3. Fix the cause on a branch, pass CI, merge to `main` and repeat the smoke check.
4. Tell visitors when the address was shared and the outage lasts more than an hour: post a short note where the link was shared (course channel, message to test participants) saying what does not work and when it is expected back; post again when it works. There are no accounts or e-mail lists; visitors' saved scenarios stay in their browsers and are not affected.

## Rollback

1. Workers & Pages → `doroboty-ai` → Deployments.
2. On the last working version open the “…” menu → Rollback, confirm.
3. Repeat the smoke check on the restored version and record what failed.

Cloudflare keeps the 100 most recent versions for rollback. If the dashboard is unavailable, rebuild from the last good commit: revert the faulty commit on `main` and push.

## Capacity and cost

Requests to static assets are free and unlimited on Cloudflare. Page requests that run the redirect Worker count toward the free limit of 100,000 Worker requests a day (one or two per visit); above it those page requests get an error until midnight UTC, build files stay available. Cloudflare → `doroboty-ai` → Metrics shows the daily count. The free plan includes 3,000 build minutes a month and allows 20,000 files per version (25 MiB per file); the build has about 40 files.
