import type { PostHog, PostHogConfig } from "posthog-js";

// Anonymous product analytics and error tracking in PostHog Cloud EU. Enabled only when the
// build has VITE_POSTHOG_KEY (set in Cloudflare, see docs/release.md); local builds and tests
// send nothing. No cookies or storage, no session replay, no person profiles.
// Autocapture records clicks on links and buttons only, so typed or displayed free text
// (applications, answers, notes) never leaves the browser.
// The library is loaded as a separate chunk after start, so it does not delay the app.
export const analyticsConfig: Partial<PostHogConfig> = {
  api_host: "https://eu.i.posthog.com",
  defaults: "2026-08-30",
  persistence: "memory",
  person_profiles: "never",
  capture_pageview: "history_change",
  autocapture: { dom_event_allowlist: ["click"], element_allowlist: ["a", "button"] },
  capture_exceptions: true,
  disable_session_recording: true,
  disable_surveys: true,
};

let client: PostHog | null = null;

export async function startAnalytics(key = import.meta.env.VITE_POSTHOG_KEY as string | undefined) {
  if (!key) return false;
  const { default: posthog } = await import("posthog-js");
  posthog.init(key, analyticsConfig);
  client = posthog;
  return true;
}

export function reportError(error: unknown) {
  client?.captureException(error);
}
