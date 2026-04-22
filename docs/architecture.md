# Architecture

## Services

- `apps/web`: Next.js control tower UI deployed to Vercel
- `apps/api`: FastAPI domain API, analytics, and AI orchestration deployed to Railway
- `apps/worker`: Redis-backed RQ worker for retraining and scheduled reports deployed to Railway

## Data flow

1. Users authenticate through Clerk in the web app.
2. The frontend calls FastAPI endpoints for dashboards, analytics, and AI.
3. FastAPI reads operational data from Postgres and computes predictions and recommendations.
4. Background jobs trigger forecast refreshes and report generation through Redis/RQ.
5. The AI assistant uses structured system context to answer questions through OpenAI Responses API or a deterministic fallback.

## Core modules

- Demand forecasting
- Inventory optimization
- Supplier risk analysis
- Logistics delay prediction
- Predictive maintenance
- AI assistant

