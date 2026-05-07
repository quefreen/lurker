-- src/lib/schema.sql
-- Tabela 1: índice dos jogos (alimenta o carrossel)
CREATE TABLE matches (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT UNIQUE NOT NULL,
  team_a       TEXT NOT NULL,
  team_b       TEXT NOT NULL,
  tournament   TEXT NOT NULL,
  match_date   TEXT NOT NULL,
  status       TEXT DEFAULT 'open',
  confidence   TEXT DEFAULT 'C',
  cover_image  TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);

-- Tabela 2: análise completa (alimenta a DataPage)
CREATE TABLE match_analysis (
  slug         TEXT PRIMARY KEY REFERENCES matches(slug),
  data         TEXT NOT NULL,  
  updated_at   TEXT DEFAULT (datetime('now'))
);