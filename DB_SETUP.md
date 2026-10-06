# AI60 database setup (about 10 minutes)

## 1. Create the database (once)

### Option A (recommended): Neon via Vercel
1. Push the repo to GitHub and import it in Vercel (Add New > Project).
2. In the Vercel project: **Storage** tab > **Create Database** > **Neon** (Postgres) > free plan > connect to this project, all environments.
3. Vercel adds `DATABASE_URL` (and `DATABASE_URL_UNPOOLED`) automatically. If you only see `POSTGRES_URL`, that works too; the code falls back to it.

### Option B: Supabase
1. supabase.com > New project > save the DB password.
2. Project Settings > Database > Connection string > use the **Transaction pooler** (port 6543), NOT the direct connection (it is IPv6-only and fails on Vercel).
3. Add it in Vercel > Settings > Environment Variables as `DATABASE_URL`.

## 2. Other environment variables (Vercel > Settings > Environment Variables)
IP_HASH_SALT (random string), ADMIN_PASSWORD, MAX_REGS_PER_IP_PER_HOUR (optional), ANTHROPIC_API_KEY (Phase 7).

## 3. Tables are created automatically
`npm run build` runs `scripts/migrate.mjs` first, so every Vercel deploy applies db/schema.sql. It is idempotent.
If DATABASE_URL is missing, it skips instead of failing.

## 4. Load demo data (once, from your laptop)
    cp .env.example .env.local     # paste your DATABASE_URL
    npm install
    npm run db:seed
Every demo row has is_demo = true. Re-running replaces only demo rows, never real students.

## 5. Verify
Open https://YOUR-APP.vercel.app/api/health. Expect:
    {"ok":true,"extensions":["pgcrypto","pg_trgm"],"students":362}

## Troubleshooting
- extension not available: use Neon or Supabase (both support pgcrypto + pg_trgm).
- ENOTFOUND / timeout on Supabase: you used the direct URL; switch to the pooler URL.
- "prepared statement does not exist": the pooled URL requires prepare:false (already set in src/lib/db.ts).
- Build fails at migration: read the [db] message in the Vercel build log; fix the URL, redeploy.
- Registration says rate-limited during a live demo: raise MAX_REGS_PER_IP_PER_HOUR.
