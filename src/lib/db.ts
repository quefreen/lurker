// src/lib/db.ts
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Essa verificação ajuda a evitar erros silenciosos caso você esqueça de preencher o .env
if (!url || !authToken) {
  throw new Error("As variáveis TURSO_DATABASE_URL e TURSO_AUTH_TOKEN estão faltando no .env.local");
}

export const db = createClient({
  url,
  authToken,
});