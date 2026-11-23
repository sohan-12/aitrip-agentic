# Working on AITrip

Read the product specification, current implementation status and phase acceptance criteria before changing a user journey. Keep each change runnable through the normal UI or API. [Product specification](docs/PROJECT_SPEC.md) · [Implementation status](docs/IMPLEMENTATION_STATUS.md) · [Roadmap](docs/ROADMAP.md)

## Development conventions

- Implement the application in this repository. Use the two reference repositories to inform visual design. Write the backend, agent orchestration and UI components here.
- Keep the browser behind the FastAPI boundary for provider requests and credentials. Validate input on the server. Test changes to database schema through Alembic migrations.
- Represent trip constraints as typed fields. Use deterministic logic for arithmetic and scheduling. Keep structured model outputs subject to validation.
- Show the origin of each travel claim. Include a source and retrieval time for live information, or label a reference, estimate, recommendation or demonstration explicitly. Preserve uncertainty when evidence is missing.
- Scope access to each traveler's data. Keep private prompts, bearer tokens and provider secrets out of logs, source control and URLs.
- Derive execution telemetry from real workflow events. Show concise decisions, sources and outcomes. Keep revisions auditable and request traveler approval to apply them.
- Preserve keyboard access, visible focus, reduced-motion behavior and a usable page when WebGL or the API is unavailable.
- Run the checks that cover the changed journey and record any limitations in the implementation status. Use the startup instructions in the root README. [Testing](docs/TESTING.md)
