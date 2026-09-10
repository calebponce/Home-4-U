"""Merge the analysis and project-name migration branches.

Revision ID: 20260909_0005
Revises: 20260508_0004, 20260512_0003
Create Date: 2026-09-09 00:05:00.000000
"""
from __future__ import annotations


revision = "20260909_0005"
down_revision = ("20260508_0004", "20260512_0003")
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Join the two branches without changing the schema."""


def downgrade() -> None:
    """Restore the two independent migration heads."""
