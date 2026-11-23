from datetime import UTC, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class DestinationView(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slug: str
    name: str
    country: str
    region: str
    description: str
    latitude: float
    longitude: float
    source_url: str
    provenance: Literal["reference"] = "reference"


class BriefInput(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    prompt: str = Field(min_length=1, max_length=4000)
    destination_slug: str | None = Field(default=None, min_length=1, max_length=80)


class BriefView(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    prompt: str
    destination_slug: str | None
    created_at: datetime

    @field_validator("created_at")
    @classmethod
    def normalize_time(cls, value: datetime) -> datetime:
        # SQLite returns the UTC timestamp without its timezone marker.
        return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


class BriefReceipt(BriefView):
    token: str
