// Cloudflare Pages Function, uploaded by `wrangler pages deploy` from the repo root.
// The project's own pages.dev address cannot be switched off, so send it to the real
// domain. Branch previews (<branch>.<project>.pages.dev) are a different host and are left alone.
const CANONICAL = {
  'wuzz-pos-stg.pages.dev': 'pos-stg.wuzz.care',
  'wuzz-admin-stg.pages.dev': 'admin-stg.wuzz.care',
};

export function onRequest({ request, next }) {
  const url = new URL(request.url);
  const host = CANONICAL[url.hostname];
  if (!host) return next();
  url.hostname = host;
  return Response.redirect(url.toString(), 301);
}
