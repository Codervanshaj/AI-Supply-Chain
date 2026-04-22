# SupplyChain AI SaaS

Production-oriented supply chain optimization platform built with:

- `Next.js 16` for the web application
- `FastAPI 0.133.x` for domain APIs and AI orchestration
- `PostgreSQL 18` for relational storage
- `Redis` for caching and async jobs
- `OpenAI Responses API` for the read-only AI assistant

## Monorepo layout

```text
apps/
  web/      Next.js application
  api/      FastAPI application
  worker/   Background jobs and scheduled tasks
packages/
  ui/       Shared React UI primitives
  types/    Shared TypeScript contracts
```

## Local development

### Web

```bash
npm install
npm run dev:web
```

### API

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -e .[dev]
uvicorn app.main:app --reload
```

### Worker

```bash
cd apps/worker
python -m venv .venv
.venv\Scripts\activate
pip install -e .[dev]
python -m worker.main
```

## Environment

Copy:

- `.env.example` to `.env` for shared local values
- `apps/web/.env.local.example` to `apps/web/.env.local`
- `apps/api/.env.example` to `apps/api/.env`
- `apps/worker/.env.example` to `apps/worker/.env`

## Seed demo data

```bash
cd apps/api
python -m app.scripts.seed_demo
```

## Deployment targets

- Web: `Vercel`
- API, Worker, Postgres, Redis, Storage: `Railway`

## Important note about authentication

The frontend is already integrated for `Clerk`, but local builds do not crash if Clerk keys are missing.

That means:

- local development and CI can still build the app without auth secrets
- once you add real Clerk keys in Vercel, Clerk auth becomes active
- this is a safe fallback, not a bug

If you want, Clerk can be made mandatory later so builds fail unless keys are present.

## What works right now

- the Next.js app builds successfully
- the FastAPI backend starts with seeded demo data
- the worker package is set up
- frontend tests pass
- backend tests pass
- the dashboard and assistant UI run against seeded/demo-backed APIs

## What still needs account/infrastructure setup

- GitHub remote repository creation and push
- Vercel project creation and environment variables
- Railway services for API, worker, Postgres, and Redis
- Clerk project keys
- OpenAI API key
- production database and Redis connections
