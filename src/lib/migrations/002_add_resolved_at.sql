-- Migration 002: adiciona resolved_at para rastrear quando entry virou green/red
--
-- Execute via Turso CLI:
--   turso db shell <DB_NAME> < src/lib/migrations/002_add_resolved_at.sql

ALTER TABLE entries ADD COLUMN resolved_at TEXT DEFAULT NULL;

-- Atualiza entradas já resolvidas com a data de hoje (retroativo)
UPDATE entries
SET resolved_at = datetime('now')
WHERE status IN ('green', 'red') AND resolved_at IS NULL;

-- Trigger: preenche resolved_at automaticamente ao marcar green ou red
CREATE TRIGGER IF NOT EXISTS trg_entries_resolved_at
  AFTER UPDATE OF status ON entries
  WHEN NEW.status IN ('green', 'red')
BEGIN
  UPDATE entries SET resolved_at = datetime('now') WHERE id = NEW.id;
END;
