import 'dotenv/config';
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('❌  TURSO_DATABASE_URL ou TURSO_AUTH_TOKEN ausente no .env.local');
  process.exit(1);
}

const db = createClient({ url, authToken });

const steps = [
  {
    label: 'Adicionar coluna resolved_at',
    sql: `ALTER TABLE entries ADD COLUMN resolved_at TEXT DEFAULT NULL`,
  },
  {
    label: 'Preencher resolved_at das entries já resolvidas (retroativo)',
    sql: `UPDATE entries SET resolved_at = datetime('now') WHERE status IN ('green','red') AND resolved_at IS NULL`,
  },
  {
    label: 'Criar trigger trg_entries_resolved_at',
    sql: `CREATE TRIGGER IF NOT EXISTS trg_entries_resolved_at
          AFTER UPDATE OF status ON entries
          WHEN NEW.status IN ('green','red')
          BEGIN
            UPDATE entries SET resolved_at = datetime('now') WHERE id = NEW.id;
          END`,
  },
];

async function run() {
  for (const step of steps) {
    try {
      await db.execute(step.sql);
      console.log(`✅  ${step.label}`);
    } catch (err: any) {
      if (err?.message?.includes('duplicate column')) {
        console.log(`⏭️   ${step.label} — coluna já existe, pulando`);
      } else {
        console.error(`❌  ${step.label}\n    ${err?.message}`);
        process.exit(1);
      }
    }
  }
  console.log('\n✅  Migration 002 concluída.');
}

run();
