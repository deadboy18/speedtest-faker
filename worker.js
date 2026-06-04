/**
 * Speedtest Faker — Cloudflare Worker Proxy
 *
 * This tiny proxy lets the GitHub Pages frontend talk to Ookla's API
 * without CORS issues. Free tier: 100,000 requests/day.
 *
 * Deploy:
 *   npx wrangler deploy
 *
 * Or paste this into the Cloudflare Dashboard:
 *   Workers & Pages → Create → "Hello World" → replace code → Deploy
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request) {
    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // POST /generate → proxy to Ookla result API
    if (url.pathname === '/generate' && request.method === 'POST') {
      try {
        const body = await request.text();
        const res = await fetch('https://www.speedtest.net/api/api.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Speedtest',
            'Origin': 'https://www.speedtest.net',
            'Referer': 'https://www.speedtest.net',
          },
          body,
        });
        const text = await res.text();
        return new Response(text, {
          headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 502,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    }

    // GET /servers → proxy to Ookla server search API
    if (url.pathname === '/servers') {
      const search = url.searchParams.get('search') || '';
      const limit = url.searchParams.get('limit') || '20';
      const target = `https://www.speedtest.net/api/js/servers?engine=js&search=${encodeURIComponent(search)}&https_functional=true&limit=${limit}`;
      try {
        const res = await fetch(target, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.speedtest.net/',
            'Accept': 'application/json',
          },
        });
        const data = await res.text();
        return new Response(data, {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 502,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    }

    // Anything else
    return new Response('Speedtest Faker Proxy — use /servers or /generate', {
      status: 404,
      headers: CORS_HEADERS,
    });
  },
};
