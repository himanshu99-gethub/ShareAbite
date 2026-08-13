// Vercel Serverless Function — wraps TanStack Start SSR server
// .js files in api/ automatically run on Node.js on Vercel — no config needed.
// dist/server/server.js is generated during `npm run build`

import server from '../dist/server/server.js';

export default async function handler(request) {
  return await server.fetch(request);
}
