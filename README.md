# AITrip

AITrip is a conversational travel planner for travelers with constraints on time, cost, transport and accessibility. This repository contains the fresh implementation of the project.

## Run locally

Use Python 3.12 and Node.js 24. From the repository root, start the API in one terminal.

```sh
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Start the frontend in another terminal from the repository root.

```sh
cd frontend
npm ci
npm run dev
```

Open the Vite address printed in the terminal. Search for Ooty, open its guide, choose **Plan this trip**, enter a request and save it. Use **Reopen last brief** in the same tab to retrieve it from the database.

SQLite works without environment variables or provider keys. To use PostgreSQL locally, copy `.env.example` to `.env`, choose a local URL-safe password for both password fields, and run `docker compose up -d --wait` from the project root. Export `DATABASE_URL` from that file in the API terminal before running the migration and server. Vite proxies API requests to port 8000 by default. Set `AITRIP_API_TARGET` to override it.

The four destination guides contain curated reference information and locally served illustrations. Phase 2 introduces intent parsing and LangGraph itinerary generation. [Architecture](docs/ARCHITECTURE.md) · [Tests](docs/TESTING.md) · [Roadmap](docs/ROADMAP.md)
