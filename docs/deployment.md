# Deployment Guide

## 1. What the Clerk note means

The app already supports Clerk authentication.

For local development and CI:

- if Clerk keys are missing, the app still builds
- the UI shows that auth is ready but not configured

For production:

- add Clerk keys in Vercel
- auth becomes active automatically

This was added intentionally so the project stays deployable and testable before secrets are connected.

## 2. Local run checklist

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
pip install -e .
python -m worker.main
```

## 3. Current project status

### Already working

- monorepo structure
- modern Next.js dashboard UI
- forecasting, inventory, suppliers, logistics, maintenance, reports, and assistant routes
- FastAPI endpoints
- seeded demo data
- AI assistant endpoint with OpenAI support and fallback behavior
- GitHub Actions CI file
- Docker and Railway deployment files

### Still to wire for full live production

- create GitHub repo and push code
- connect Vercel to the GitHub repo
- deploy API and worker to Railway
- provision Postgres and Redis in Railway
- add real environment variables
- connect Clerk
- connect OpenAI key

## 4. Required production environment variables

### Vercel

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `SENTRY_DSN` optional

### Railway API

- `DATABASE_URL`
- `REDIS_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `ALLOWED_ORIGINS`
- `CLERK_SECRET_KEY`

### Railway Worker

- `REDIS_URL`
- `API_BASE_URL`
- `WORKER_QUEUE`

## 5. Honest current maturity

This is a strong working foundation, not a fully finished enterprise platform yet.

What is real now:

- the app runs
- the UI works
- the APIs work
- the project builds and tests successfully

What is still MVP-grade:

- ML logic uses practical seeded/domain heuristics instead of full training pipelines
- some pages are foundation screens and need deeper workflows
- auth is integrated but still needs your real Clerk project configuration
- live deployment depends on your Vercel and Railway accounts

## 6. GitHub and Vercel

I can prepare everything locally, but I cannot create a GitHub repo or deploy to your Vercel account unless you provide account access or do the account-side clicks yourself.

The fastest path is:

1. Create an empty GitHub repo
2. Share the repo URL
3. I will give you the exact `git remote add` and `git push` commands, or do the local git setup part here if you want
4. Import that repo into Vercel
5. Add the environment variables
6. Deploy web
7. Deploy API and worker on Railway
