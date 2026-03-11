/**
 * Cloudflare Worker: transparent proxy to landrecords.karnataka.gov.in
 *
 * Railway (or any client) sends requests here; the Worker forwards them
 * to the Karnataka site and returns the response.  Cloudflare edge IPs
 * are not blocked by the site.
 *
 * Usage from Railway server.js:
 *   PROXY_CF_URL=https://geodocs-proxy.<your-subdomain>.workers.dev
 *   fetch(`${PROXY_CF_URL}/service3/`, { ... })
 */

const TARGET = 'https://landrecords.karnataka.gov.in';

const HOP_HEADERS = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade', 'host',
]);

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Optional auth: if AUTH_TOKEN secret is set, require it
    if (env.AUTH_TOKEN) {
      const token = request.headers.get('x-proxy-token');
      if (token !== env.AUTH_TOKEN) {
        return new Response(JSON.stringify({ error: 'unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const url = new URL(request.url);
    const targetUrl = `${env.TARGET_ORIGIN || TARGET}${url.pathname}${url.search}`;

    // Build forwarded headers, skip hop-by-hop
    const headers = new Headers();
    for (const [key, value] of request.headers) {
      if (!HOP_HEADERS.has(key.toLowerCase()) && !key.toLowerCase().startsWith('cf-') && key.toLowerCase() !== 'x-proxy-token') {
        headers.set(key, value);
      }
    }
    headers.set('Host', 'landrecords.karnataka.gov.in');
    headers.set('Origin', TARGET);
    headers.set('Referer', `${TARGET}/service3/`);
    // Pass through client IP to avoid CF security blocks
    const clientIP = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
    if (clientIP) {
      headers.set('CF-Connecting-IP', clientIP);
      headers.set('True-Client-IP', clientIP);
      headers.set('X-Forwarded-For', clientIP);
    }
    // Add common browser headers if not present
    if (!headers.has('X-Requested-With')) headers.set('X-Requested-With', 'XMLHttpRequest');

    const init = {
      method: request.method,
      headers,
      redirect: 'manual', // Don't follow redirects; let the caller handle them
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = request.body;
      init.duplex = 'half';
    }

    try {
      const response = await fetch(targetUrl, init);

      // Build response headers, skip hop-by-hop
      const respHeaders = new Headers();
      for (const [key, value] of response.headers) {
        if (!HOP_HEADERS.has(key.toLowerCase())) {
          respHeaders.set(key, value);
        }
      }
      // Allow CORS from anywhere
      respHeaders.set('Access-Control-Allow-Origin', '*');
      respHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      respHeaders.set('Access-Control-Allow-Headers', '*');
      respHeaders.set('Access-Control-Expose-Headers', 'Content-Type, Content-Disposition, Content-Length');

      // For redirects, rewrite Location to point back through the proxy
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
          let rewritten = location;
          if (location.startsWith(TARGET)) {
            rewritten = location.replace(TARGET, url.origin);
          } else if (location.startsWith('/')) {
            rewritten = `${url.origin}${location}`;
          }
          respHeaders.set('location', rewritten);
        }
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: respHeaders,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
