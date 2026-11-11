import { describe, expect, it } from "vitest";
import worker, { httpsRedirect } from "./index";

const assets = { fetch: async () => new Response("asset") };

describe("https redirect worker", () => {
  it("redirects plain HTTP to the same address over HTTPS", () => {
    const response = httpsRedirect(
      new Request("http://doroboty-ai.example.workers.dev/oferty?a=1"),
    );
    expect(response?.status).toBe(301);
    expect(response?.headers.get("location")).toBe(
      "https://doroboty-ai.example.workers.dev/oferty?a=1",
    );
  });

  it("serves assets for HTTPS and for local development", async () => {
    for (const url of ["https://doroboty-ai.example.workers.dev/", "http://localhost:8787/"]) {
      const response = await worker.fetch(new Request(url), { ASSETS: assets });
      expect(await response.text()).toBe("asset");
    }
  });
});
