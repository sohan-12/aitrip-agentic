import hashlib
import json
import logging
import secrets
import time
import unicodedata
from collections.abc import Iterator
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from .database import build_engine, database_url
from .models import Destination, TripBrief
from .schemas import BriefInput, BriefReceipt, BriefView, DestinationView

logger = logging.getLogger("uvicorn.error")
bearer = HTTPBearer(auto_error=False)


def get_session(request: Request) -> Iterator[Session]:
    with Session(request.app.state.engine) as session:
        yield session


Database = Annotated[Session, Depends(get_session)]
Credentials = Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]


def search_key(text: str) -> str:
    decomposed = unicodedata.normalize("NFKD", text.casefold())
    return "".join(char for char in decomposed if not unicodedata.combining(char))


def digest(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_app(url: str | None = None) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.engine = build_engine(url or database_url())
        try:
            yield
        finally:
            app.state.engine.dispose()

    app = FastAPI(title="AITrip", version="0.1.0", lifespan=lifespan)

    @app.middleware("http")
    async def request_log(request: Request, call_next):
        start = time.monotonic()
        response = await call_next(request)
        route = request.scope.get("route")
        logger.info(json.dumps({
            "method": request.method,
            "route": getattr(route, "path", "unmatched"),
            "status": response.status_code,
            "duration_ms": round((time.monotonic() - start) * 1000, 2),
        }))
        if request.url.path.startswith("/api/briefs"):
            response.headers["Cache-Control"] = "no-store"
        return response

    @app.get("/api/health")
    def health(session: Database) -> dict[str, str]:
        try:
            session.execute(select(Destination.slug).limit(1))
            session.execute(select(TripBrief.id).limit(1))
        except SQLAlchemyError:
            raise HTTPException(503, "Database unavailable or migrations pending") from None
        return {"status": "ok"}

    @app.get("/api/destinations", response_model=list[DestinationView])
    def destinations(session: Database, q: Annotated[str, Query(max_length=120)] = ""):
        # This Phase 1 catalog is four curated references. Accent folding keeps
        # typeahead consistent on SQLite and PostgreSQL.
        query = search_key(q.strip())
        catalog = session.scalars(select(Destination).order_by(Destination.name))
        return [
            place for place in catalog
            if query in search_key(f"{place.name} {place.slug} {place.country} {place.region}")
        ]

    @app.post("/api/briefs", response_model=BriefReceipt, status_code=201)
    def create_brief(payload: BriefInput, response: Response, session: Database):
        if payload.destination_slug and not session.get(Destination, payload.destination_slug):
            raise HTTPException(422, "Unknown destination")
        token = secrets.token_urlsafe(32)
        brief = TripBrief(
            id=str(uuid4()), token_hash=digest(token), prompt=payload.prompt,
            destination_slug=payload.destination_slug, created_at=datetime.now(UTC),
        )
        session.add(brief)
        session.commit()
        response.headers["Location"] = f"/api/briefs/{brief.id}"
        return BriefReceipt(**BriefView.model_validate(brief).model_dump(), token=token)

    @app.get("/api/briefs/{brief_id}", response_model=BriefView)
    def read_brief(brief_id: UUID, session: Database, credentials: Credentials):
        brief = session.get(TripBrief, str(brief_id))
        if brief is None or credentials is None or not secrets.compare_digest(
            brief.token_hash, digest(credentials.credentials)
        ):
            raise HTTPException(404, "Brief unavailable")
        return brief

    return app


app = create_app()
