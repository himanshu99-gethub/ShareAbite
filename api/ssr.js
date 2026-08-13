// Vercel Serverless Function — wraps TanStack Start SSR server
// Vercel Node.js functions receive (req, res) — NOT Web API Request.
// We manually convert to/from Web API Request/Response for TanStack Start.

import server from '../dist/server/server.js';

export default async function handler(req, res) {
  try {
    // Build full URL
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers['host'] || 'localhost';
    const url = `${proto}://${host}${req.url}`;

    // Collect request body (for POST/PUT/PATCH)
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      if (chunks.length > 0) body = Buffer.concat(chunks);
    }

    // Build headers (filter out undefined values)
    const headers = {};
    for (const [key, val] of Object.entries(req.headers)) {
      if (val != null) headers[key] = Array.isArray(val) ? val.join(', ') : val;
    }

    // Convert to Web API Request and call TanStack Start server
    const webRequest = new Request(url, {
      method: req.method,
      headers,
      body,
      duplex: 'half',
    });

    const response = await server.fetch(webRequest);

    // Set response status & headers
    res.statusCode = response.status;
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }

    // Stream SSR response body to client
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }

    res.end();
  } catch (err) {
    console.error('[SSR] Error:', err);
    res.statusCode = 500;
    res.end(`Internal Server Error: ${err.message}`);
  }
}
