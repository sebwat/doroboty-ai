import { beforeEach, describe, expect, it, vi } from "vitest";

const posthog = vi.hoisted(() => ({ init: vi.fn(), captureException: vi.fn() }));
vi.mock("posthog-js", () => ({ default: posthog }));

import { analyticsConfig, reportError, startAnalytics } from "./analytics";

describe("analytics", () => {
  beforeEach(() => {
    posthog.init.mockClear();
    posthog.captureException.mockClear();
  });

  it("stays off without a project key", async () => {
    expect(await startAnalytics("")).toBe(false);
    reportError(new Error("x"));
    expect(posthog.init).not.toHaveBeenCalled();
    expect(posthog.captureException).not.toHaveBeenCalled();
  });

  it("starts in the EU without cookies, replay or person profiles", async () => {
    expect(await startAnalytics("phc_test")).toBe(true);
    expect(posthog.init).toHaveBeenCalledWith("phc_test", analyticsConfig);
    expect(analyticsConfig).toMatchObject({
      api_host: "https://eu.i.posthog.com",
      persistence: "memory",
      person_profiles: "never",
      disable_session_recording: true,
      capture_exceptions: true,
    });
  });

  it("captures clicks on links and buttons only", () => {
    expect(analyticsConfig.autocapture).toEqual({
      dom_event_allowlist: ["click"],
      element_allowlist: ["a", "button"],
    });
  });

  it("reports render errors once PostHog is running", async () => {
    await startAnalytics("phc_test");
    const error = new Error("render failed");
    reportError(error);
    expect(posthog.captureException).toHaveBeenCalledWith(error);
  });
});
