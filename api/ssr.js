// Vercel Serverless Function — wraps TanStack Start SSR server
// This file imports the built server bundle and exposes it as a Vercel function.
// NOTE: dist/server/server.js is generated during `npm run build` (before this is bundled)

import server from '../dist/server/server.js';

export default async function handler(request) {
  return await server.fetch(request);
}

export const config = {
  runtime: 'nodejs20.x',
};
