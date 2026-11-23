from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Destination(Base):
    __tablename__ = "destinations"

    slug: Mapped[str] = mapped_column(String(80), primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    country: Mapped[str] = mapped_column(String(120))
    region: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    source_url: Mapped[str] = mapped_column(Text)


class TripBrief(Base):
    __tablename__ = "trip_briefs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    token_hash: Mapped[str] = mapped_column(String(64))
    prompt: Mapped[str] = mapped_column(Text)
    destination_slug: Mapped[str | None] = mapped_column(ForeignKey("destinations.slug"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
