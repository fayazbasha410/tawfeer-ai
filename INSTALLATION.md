# Installation Guide

This walks through getting Tawfeer running locally from a fresh clone.

## Before you start

You'll need:

- **Node.js 22 or later** (the app uses features from `@supabase/supabase-js`'s realtime client that require native `WebSocket` support, which only exists from Node 22 onward — it will crash on Node 20 or earlier)
- A **Groq API key** — free tier is enough for local development. Get one at [console.groq.com](https://console.groq.com)
- A **Supabase project** — free tier works fine. Create one at [supabase.com](https://supabase.com)

## 1. Clone and install

```bash
git clone https://github.com/fayazbasha410/tawfeer-ai.git
cd tawfeer-ai
npm install
```

## 2. Set up your environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

| Variable | Where to get it |
|---|---|
| `GROQ_API_KEY` | Groq console → API Keys |
| `SUPABASE_URL` | Supabase project → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase project → Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_KEY` | Supabase project → Settings → API → `service_role` key (keep this one secret — it bypasses row-level security) |
| `ADMIN_KEY` | Any string you choose — this protects the admin dashboard, it's not tied to Supabase |

## 3. Set up your Supabase tables

The app expects three tables in your Supabase project:

- `users` — registered accounts (name, email, emirate, password hash, created_at)
- `trips_prevented` — each logged trip (user, centre visited, distance/CO₂/fuel/money saved, timestamp)
- `cumulative_impact` — running totals used for the live counter on the login/register pages

There's no migration file included in this repo yet, so you'll need to create these tables manually in the Supabase Table Editor, matching the fields referenced in `src/routes/*.js` and `src/utils/govCentres.js`. If you're setting this up for the first time, it's worth writing a proper SQL migration file and adding it to the repo so the next person doesn't have to reverse-engineer the schema from the code.

## 4. Run it

```bash
npm start
```

The app will be running at `http://localhost:3000`. You should be able to register a new account and start chatting.

## 5. Running tests (optional, but recommended before contributing)

```bash
npm run test:unit
```
Runs Vitest against pure logic (carbon math, government centre lookups, etc.) — no network calls, safe to run anytime.

```bash
npm run test:api
```
Runs the Playwright specs that don't touch the LLM (auth, admin, some API/chat validation) — fast, and won't use any Groq quota.

```bash
npm test
```
Runs the full Playwright suite, including everything that calls Groq for real. This will use up some of your daily API quota, so don't run it repeatedly without reason.

## Troubleshooting

**Server crashes immediately with a WebSocket error.** You're probably on Node 20 or earlier — check with `node -v` and upgrade to 22+.

**Chat requests fail with a 500 and `"error": "LLM unavailable"`.** Almost always means `GROQ_API_KEY` is missing, wrong, or you've hit Groq's rate limit for your account tier — check the Groq console for current usage before assuming it's a code bug.

**Login/register fails but the server is running fine.** Double-check `SUPABASE_URL` and the two Supabase keys — a typo there is the most common cause.
