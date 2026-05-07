-- Migration 001: tabela de entries para cálculo do Skin in the Game
--
-- Execute via Turso CLI:
--   turso db shell <DB_NAME> < src/lib/migrations/001_create_entries.sql
--
-- Ou via HTTP API / Turso dashboard (cole o conteúdo abaixo).

CREATE TABLE IF NOT EXISTS entries (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  match_slug   TEXT    NOT NULL,
  market_name  TEXT    NOT NULL,
  odd          REAL    NOT NULL,
  stake        REAL    NOT NULL,
  -- 'default' = pendente | 'green' = lucro | 'red' = loss
  status       TEXT    NOT NULL DEFAULT 'default'
                       CHECK (status IN ('default', 'green', 'red')),
  created_at   TEXT    DEFAULT (datetime('now')),
  FOREIGN KEY (match_slug) REFERENCES matches(slug) ON DELETE CASCADE,
  UNIQUE (match_slug, market_name)
);

CREATE INDEX IF NOT EXISTS idx_entries_slug   ON entries(match_slug);
CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
