from uuid import uuid4

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import build_engine
from app.main import create_app
from app.models import TripBrief


@pytest.fixture
def db_url(tmp_path, monkeypatch):
    url = f"sqlite:///{tmp_path}/test.db"
    monkeypatch.setenv("DATABASE_URL", url)
    command.upgrade(Config("alembic.ini"), "head")
    return url


@pytest.fixture
def api(db_url):
    with TestClient(create_app(db_url)) as client:
        yield client


def test_catalog_and_health(api):
    assert api.get("/api/health").json() == {"status": "ok"}
    places = api.get("/api/destinations").json()
    assert {p["slug"] for p in places} == {"ooty", "kyoto", "dolomites", "reykjavik"}
    assert all(p["provenance"] == "reference" and p["source_url"].startswith("https://") for p in places)
    assert [p["name"] for p in api.get("/api/destinations", params={"q": "REYKJAVIK"}).json()] == ["Reykjavík"]
    assert api.get("/api/destinations", params={"q": "%"}).json() == []


@pytest.mark.parametrize("payload", [
    {"prompt": " \n "}, {"prompt": "a" * 4001}, {"prompt": "Trip", "destination_slug": "unknown"},
])
def test_invalid_briefs(api, payload):
    assert api.post("/api/briefs", json=payload).status_code == 422


def test_save_and_reopen_after_restart(api, db_url):
    response = api.post("/api/briefs", json={"prompt": " Four days in Ooty ", "destination_slug": "ooty"})
    assert response.status_code == 201
    assert response.headers["cache-control"] == "no-store"
    receipt = response.json()
    path = response.headers["location"]
    assert receipt["prompt"] == "Four days in Ooty"
    assert receipt["created_at"].endswith("Z")
    for headers in [{}, {"Authorization": "Bearer wrong"}]:
        denied = api.get(path, headers=headers)
        assert denied.status_code == 404
        assert "Four days" not in denied.text
    with TestClient(create_app(db_url)) as reopened:
        found = reopened.get(path, headers={"Authorization": f"Bearer {receipt['token']}"})
    assert found.status_code == 200
    assert found.json() == {k: v for k, v in receipt.items() if k != "token"}
    engine = build_engine(db_url)
    with Session(engine) as session:
        assert session.scalar(select(TripBrief.token_hash)) != receipt["token"]
    engine.dispose()


def test_distinct_briefs_are_private(api):
    one, two = [api.post("/api/briefs", json={"prompt": "Nature trip"}).json() for _ in range(2)]
    headers = {"Authorization": f"Bearer {one['token']}"}
    assert api.get(f"/api/briefs/{two['id']}", headers=headers).status_code == 404
    assert api.get(f"/api/briefs/{uuid4()}", headers=headers).status_code == 404
    assert api.get("/api/briefs").status_code == 405


def test_readiness_rejects_unmigrated_db(tmp_path):
    with TestClient(create_app(f"sqlite:///{tmp_path}/blank.db")) as client:
        assert client.get("/api/health").status_code == 503


def test_migration_round_trip(db_url):
    config = Config("alembic.ini")
    command.downgrade(config, "base")
    command.upgrade(config, "head")
    command.check(config)
