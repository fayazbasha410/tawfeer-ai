# Tawfeer توفير 🇦🇪

**UAE Trip Reduction & Emissions Platform**
Submitted to DAST 2026 — Dubai Award for Sustainable Transport, 14th Edition

## What this is

Most government service questions in the UAE don't actually need an office visit — but people default to driving in anyway, because it's not obvious what can be done online. Tawfeer is a chatbot that answers those questions directly (driving licenses, vehicle registration, fines, Salik, Darb, NOL cards, public transport) across all seven emirates, in English and Arabic, and — when a trip really is avoided — logs the distance, CO₂, fuel, and money saved.

When a service genuinely can't be done digitally (an eye test, a road test, anything requiring physical attendance), it doesn't just say "sorry, go in person." It suggests the nearest public transport option instead of driving, with an estimate of what that swap saves.

## How it works

- **Chat** — Groq (`llama-3.1-8b-instant`) answers using a small RAG layer over a hand-written UAE government services knowledge base, with guardrails against prompt injection, off-topic requests, and a handful of known false-positive traps (e.g. "pension" vs "suspension").
- **Impact tracking** — once a user confirms they skipped a trip, distance/CO₂/fuel/cost are calculated from real government service centre locations per emirate (haversine distance, UAE MoCCAE emissions methodology) and stored in Supabase.
- **Bilingual** — full English/Arabic support, including voice input with a correction map for common speech-to-text mishears of UAE-specific terms.
- **Admin dashboard** — a protected view into users, logged trips, and per-emirate breakdowns.

## Stack

- Node.js (>=22) + Express
- Groq API
- Supabase (Postgres)
- Vanilla JS/HTML/CSS on the frontend — no framework
- Playwright (E2E/API/UI tests) + Vitest (unit tests)

## Quick start

See [INSTALLATION.md](./INSTALLATION.md) for full setup instructions, including the environment variables and Supabase tables you'll need.

```bash
npm install
cp .env.example .env   # then fill in your keys — see INSTALLATION.md
npm start
```

The app runs at `http://localhost:3000`.

## Running the tests

```bash
npm run test:unit    # Vitest — pure logic, no network calls
npm run test:api     # Playwright — non-LLM API/auth/admin coverage
npm test             # full Playwright suite (uses real Groq calls)
```

## Project layout

```
src/
  routes/       — auth, impact, users
  tools/        — agent tools (fine checks, appointment booking)
  utils/        — carbon math, government centre data, public transport fallback
  data/         — policy knowledge base
  server.js     — main Express app + chat endpoint
public/
  pages/        — login, register, chat, admin
  js/, css/     — frontend logic and styling, i18n
tests/
  specs/        — Playwright specs (api, auth, admin, chat, trip, ui)
  unit/         — Vitest unit tests
eval/           — red-team and regression eval scripts
```

## Built by

Fayaz Basha Shaik — DAST 2026, Best (AI) Innovation in Transport category
