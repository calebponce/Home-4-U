"""Add explicit project names.

Revision ID: 20260512_0003
Revises: 20260507_0002
Create Date: 2026-05-12 14:10:00.000000
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260512_0003"
down_revision = "20260507_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("room_projects", sa.Column("name", sa.String(length=160), nullable=True))
    op.execute(
        "UPDATE room_projects "
        "SET name = TRIM(room_type) || ' Project #' || id "
        "WHERE name IS NULL OR TRIM(name) = ''"
    )
    # SQLite does not support ``ALTER COLUMN ... SET NOT NULL`` directly.
    # Alembic batch mode rebuilds the table there and emits a regular alter on
    # databases that support it.
    with op.batch_alter_table("room_projects") as batch_op:
        batch_op.alter_column(
            "name",
            existing_type=sa.String(length=160),
            nullable=False,
        )


def downgrade() -> None:
    with op.batch_alter_table("room_projects") as batch_op:
        batch_op.drop_column("name")
