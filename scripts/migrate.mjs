// Usage: node scripts/migrate.mjs [--seed]
// Runs db/schema.sql (idempotent). With --seed, also loads demo data.
import postgres from 'postgres';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

dotenv.config({ path: '.env.local' });
const seed = process.argv.includes('--seed');
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!url) {
  console.log('[db] No DATABASE_URL set. Skipping migration.');
  process.exit(seed ? 1 : 0);
}

const root = path.dirname(fileURLToPath(import.meta.url));
const sql = postgres(url, {
  ssl: process.env.DATABASE_SSL === 'disable' ? false : 'require',
  max: 1, prepare: false, onnotice: () => {},
});

try {
  console.log('[db] Applying schema...');
  await sql.unsafe(readFileSync(path.join(root, '../db/schema.sql'), 'utf8'));
  console.log('[db] Schema OK');
  if (seed) {
    console.log('[db] Loading DEMO data...');
    await sql.unsafe(readFileSync(path.join(root, '../db/seed.sql'), 'utf8'));
    console.log('[db] Demo data loaded');
  }
} catch (e) {
  console.error('[db] Migration failed:', e.message);
  process.exit(1);
} finally {
  await sql.end();
}
