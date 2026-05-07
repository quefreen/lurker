// src/lib/db.ts
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL ?? 'libsql://placeholder';
const authToken = process.env.TURSO_AUTH_TOKEN ?? '';

export const db = createClient({ url, authToken });