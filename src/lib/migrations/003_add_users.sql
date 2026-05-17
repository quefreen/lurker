-- Migration 003: tabela de usuários para controle de plano (Clerk + Stripe)
--
-- Execute via Turso CLI:
--   turso db shell <DB_NAME> < src/lib/migrations/003_add_users.sql

CREATE TABLE IF NOT EXISTS users (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_id            TEXT    UNIQUE NOT NULL,
  email               TEXT    NOT NULL,
  plan                TEXT    NOT NULL DEFAULT 'free'
                              CHECK (plan IN ('free', 'pro')),
  stripe_customer_id  TEXT,
  created_at          TEXT    DEFAULT (datetime('now')),
  updated_at          TEXT    DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
