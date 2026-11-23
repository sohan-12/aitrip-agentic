# Architecture

Phase 1 uses a React and TypeScript client and a FastAPI service. An API-owned destination catalog provides a small reference dataset, and a relational database holds traveler briefs. This lets a traveler discover a place, describe a trip and return to their saved request without provider credentials.

## Request flow

1. The Vite client renders the landing page and application routes. TanStack Query fetches referenced destinations from `GET /api/destinations`. The optional `q` parameter filters the available catalog. A destination carries its slug, region, country, coordinates, description, provenance and source URL.
2. The globe uses React Three Fiber and Three.js. Selecting a destination provides coordinates to the scene. The surrounding navigation and content are usable independently of the 3D renderer.
3. The planner sends the original prompt and optional destination slug to `POST /api/briefs`. FastAPI validates the request before SQLAlchemy persists it. The creation response supplies a UUID and a random bearer token. The database stores the token's SHA-256 digest. The prompt is limited to 4,000 characters and a supplied destination must belong to the catalog.
4. Reopening a brief calls `GET /api/briefs/{id}` with its credential in an Authorization bearer header. The browser retains its credential in session storage. Closing the session can lose access to the brief. Treat access to the token as access to the brief. This capability is scoped to one brief. Accounts, cross-device identity and consent-based preference memory belong to later phases.
5. Alembic owns schema evolution. The migrated catalog holds Ooty, Kyoto, the Dolomites and Reykjavík. A readiness check queries both catalog and brief tables. SQLite supports local development and PostgreSQL is the service database option. The API exposes its request and response schemas through FastAPI's OpenAPI document.

## Planned workflow boundary

Phase 2 will take a validated brief into a typed LangGraph state that carries facts, source provenance, costs, dates, conflicts and agent results. A supervisor will coordinate specialized nodes, bounded optimization and checkpoints. Provider adapters and model calls belong on the server. Agent events will drive the execution display. A later replanning workflow will compare an original itinerary with a proposal and persist an approved revision.
