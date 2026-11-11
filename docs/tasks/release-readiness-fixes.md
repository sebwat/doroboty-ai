# Release readiness fixes (local preparation run)

## Intent and scope

A local production-readiness audit (`docs/production-readiness.html`) of commit `a9caa17` found:

- No catch-all for unexpected render errors: a crash leaves a blank page with no message and no way to keep the scenario.
- The repository gate failed on a Windows clone: `core.autocrlf=true` checks files out with CRLF, which breaks `format:check`, `design-system:check` and `verify:packet` (byte/hash comparisons). The generated readiness report was also checked by Prettier.
- No written check for right after a release.
- While running the browser suite, a P2 regression appeared: at 320px the third record tab (“Pytania o projekt”) extended past the viewport.

## Behavior

1. An unexpected render error shows a Polish recovery screen: what happened, that the saved scenario was not changed, and actions to download the raw save (only when one exists), reload, or return to the homepage. Nothing is logged, because the save can contain private free text. Reset stays in settings, behind its confirmation.
2. `.gitattributes` keeps LF on every platform. `docs/production-readiness.html` is excluded from Prettier; it is rendered by its own tool.
3. `docs/release-smoke-check.md` lists the short check after publishing and the rollback condition.
4. Below 480px record tabs tighten spacing and wrap their labels so three tabs fit 320px.

## Acceptance criteria

- [x] Forced render error shows the recovery screen; the save is byte-identical afterwards; download is offered; returning home recovers (e2e).
- [x] No element of the employer record extends past the viewport from 1280px down to 320px (existing e2e).
- [x] `format:check`, `design-system:check`, `verify:packet` pass on a Windows clone.
- [x] FEATURES.md updated (SYS-12).
- [ ] `./scripts/verify` passes: browser tests need a provisioned Playwright Chromium; locally the suite ran on installed Microsoft Edge instead.
