"""add google_id and stripe columns

Revision ID: 002
Revises: 001
Create Date: 2026-08-22
"""
from alembic import op
import sqlalchemy as sa

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('users', sa.Column('google_id', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('stripe_customer_id', sa.String(255), nullable=True))
    op.create_unique_constraint('uq_users_google_id', 'users', ['google_id'])
    op.create_index('ix_users_google_id', 'users', ['google_id'])
    op.alter_column('users', 'password_hash', nullable=True)

def downgrade() -> None:
    op.alter_column('users', 'password_hash', nullable=False)
    op.drop_index('ix_users_google_id', 'users')
    op.drop_constraint('uq_users_google_id', 'users')
    op.drop_column('users', 'stripe_customer_id')
    op.drop_column('users', 'google_id')
