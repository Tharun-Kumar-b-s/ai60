import postgres from 'postgres';

declare global {
  // eslint-disable-next-line no-var
  var __ai60_sql: ReturnType<typeof postgres> | undefined;
}

/** Lazy, server-only DB client. Never import this from a client component. */
export function getSql() {
  if (globalThis.__ai60_sql) return globalThis.__ai60_sql;
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const sql = postgres(url, {
    ssl: process.env.DATABASE_SSL === 'disable' ? false : 'require',
    max: 1,          // serverless: one connection per instance
    prepare: false,  // required for pooled (pgbouncer) connections
  });
  globalThis.__ai60_sql = sql;
  return sql;
}
