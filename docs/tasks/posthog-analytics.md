# Anonymous analytics and error tracking in PostHog

## Intent and scope

Course quest (AIPH3, week 4): see a pageview and a click from the production address in PostHog. The production-readiness report also needs errors from visitors' browsers to be visible. Project rules for PostHog: Cloud EU, cookieless collection, no session replay, no person profiles, no PII.

## Behavior

1. `src/lib/analytics.ts` starts PostHog only when the build has `VITE_POSTHOG_KEY`; local builds, CI and e2e send nothing (network-independence checks stay valid).
2. Pageviews on every hash route change, autocapture of clicks on links and buttons only, and exception capture. Memory persistence (no cookies or local storage, so no consent banner), no session replay, no surveys, no person profiles.
3. Typed or displayed free text (applications, project answers, recruiting notes) is never captured: inputs and text areas are not in the autocapture allowlist.
4. The render error boundary reports the error itself; the saved scenario is never sent.
5. Session replay offered by the quest is intentionally not enabled (project rule).

## Acceptance criteria

- [x] Unit tests: off without a key; EU host, memory persistence, no replay or person profiles; clicks on links/buttons only; render errors reported once running.
- [x] FEATURES.md SYS-03 and SYS-12, docs/release.md and docs/architecture.md updated.
- [ ] `./scripts/verify` passes.
- [ ] `VITE_POSTHOG_KEY` set in Cloudflare; after deploy PostHog Activity shows a Pageview and an Autocapture click from the production address.
- [ ] A PostHog alert e-mails the owner when errors appear.
