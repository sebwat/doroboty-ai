// Cloudflare Worker in front of the static build: sends plain-HTTP page requests to HTTPS,
// everything else is served from the assets in dist/ (see wrangler.jsonc and docs/release.md).
type Env = { ASSETS: { fetch(request: Request): Promise<Response> } };

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function httpsRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.protocol !== "http:" || LOCAL_HOSTS.has(url.hostname)) return null;
  url.protocol = "https:";
  return Response.redirect(url.toString(), 301);
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    const redirect = httpsRedirect(request);
    return redirect ? Promise.resolve(redirect) : env.ASSETS.fetch(request);
  },
};
