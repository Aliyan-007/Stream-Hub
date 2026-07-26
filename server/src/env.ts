/**
 * env.ts — side-effect preload module
 *
 * This file MUST be imported first in server.ts so that dotenv populates
 * process.env before any other module (especially routes) reads env vars.
 *
 * When running via `npm run dev --workspace server` from the monorepo root,
 * process.cwd() === '<monorepo-root>' where our .env file lives.
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Debug: confirm key loaded (remove in production)
console.log(
  '[env] TMDB_API_KEY loaded:',
  process.env.TMDB_API_KEY ? `✅ (${process.env.TMDB_API_KEY.slice(0, 8)}...)` : '❌ MISSING'
);
