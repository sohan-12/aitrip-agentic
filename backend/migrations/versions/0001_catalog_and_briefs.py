"""Create the destination reference catalog and private trip briefs."""
import sqlalchemy as sa
from alembic import op

revision = "0001_catalog_and_briefs"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    destinations = op.create_table(
        "destinations",
        sa.Column("slug", sa.String(80), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("country", sa.String(120), nullable=False),
        sa.Column("region", sa.String(120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("source_url", sa.Text(), nullable=False),
    )
    op.bulk_insert(destinations, [
        dict(slug="ooty", name="Ooty", country="India", region="Tamil Nadu",
             description="A hill town in the Nilgiris, known for tea gardens and the mountain railway.",
             latitude=11.4102, longitude=76.6950, source_url="https://nilgiris.nic.in/tourism/"),
        dict(slug="kyoto", name="Kyoto", country="Japan", region="Kansai",
             description="Temple gardens, wooden townhouses and forest trails in Japan’s former capital.",
             latitude=35.0116, longitude=135.7681, source_url="https://kyoto.travel/en/"),
        dict(slug="dolomites", name="Dolomites", country="Italy", region="Italian Alps",
             description="Limestone peaks and high Alpine valleys in northeastern Italy.",
             latitude=46.4983, longitude=11.8514, source_url="https://whc.unesco.org/en/list/1237/"),
        dict(slug="reykjavik", name="Reykjavík", country="Iceland", region="Capital Region",
             description="A harbor city with geothermal pools, museums and a walkable historic center.",
             latitude=64.1466, longitude=-21.9426, source_url="https://visitreykjavik.is/"),
    ])
    op.create_table(
        "trip_briefs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("token_hash", sa.String(64), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column("destination_slug", sa.String(80), sa.ForeignKey("destinations.slug")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade():
    op.drop_table("trip_briefs")
    op.drop_table("destinations")
