import os

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.engine import make_url


def database_url() -> str:
    url = os.environ.get("DATABASE_URL", "sqlite:///./aitrip.db")
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


def build_engine(url: str) -> Engine:
    sqlite = make_url(url).get_backend_name() == "sqlite"
    engine = create_engine(url, pool_pre_ping=True, connect_args={"check_same_thread": False} if sqlite else {})
    if sqlite:
        @event.listens_for(engine, "connect")
        def enable_foreign_keys(connection, _record):
            connection.execute("PRAGMA foreign_keys = ON")
    return engine
