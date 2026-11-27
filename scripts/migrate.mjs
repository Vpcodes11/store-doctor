#!/usr/bin/env node
// Applies database migrations during the build.
// - Production (Vercel production, or any non-Vercel build): DATABASE_URL is required. Without it the
//   build stops, so Vercel keeps serving the previous deployment instead of a site with no database.
// - Vercel preview builds without a database: migrations are skipped so the preview still builds.
import { spawnSync } from 'node:child_process';

const env = { ...process.env };
const isPreview = env.VERCEL === '1' && env.VERCEL_ENV !== 'production';

if (!env.DATABASE_URL) {
  if (isPreview) {
    console.warn('[migrate] DATABASE_URL is not set: skipping migrations for this preview build.');
    process.exit(0);
  }
  console.error(
    '\n[migrate] DATABASE_URL is not set, so the database cannot be prepared.\n' +
      '          In Vercel: Project → Storage → create/connect a Neon database (it sets DATABASE_URL\n' +
      '          and DATABASE_URL_UNPOOLED), then redeploy. See MANUAL-STEPS.md step 3.\n',
  );
  process.exit(1);
}
// Neon's Vercel integration sets both; anywhere else one direct URL is enough.
if (!env.DATABASE_URL_UNPOOLED) env.DATABASE_URL_UNPOOLED = env.DATABASE_URL;

const r = spawnSync('npx', ['prisma', 'migrate', 'deploy'], { stdio: 'inherit', env });
process.exit(r.status ?? 1);
