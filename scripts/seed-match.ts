/**
 * Insere um arquivo JSON de análise no banco Turso.
 *
 * Uso:
 *   npx tsx scripts/seed-match.ts <caminho-do-json> [slug] [confidence]
 *
 * Exemplo:
 *   npx tsx scripts/seed-match.ts parivision-vs-vitality-pgl-cluj-napoca-2026-22-02.json
 *
 * O slug é derivado automaticamente do nome do arquivo se não fornecido.
 * A confidence padrão é 'A' se não fornecida.
 */

import { createClient } from '@libsql/client'
import fs from 'fs'
import path from 'path'

// ── Carregar .env.local manualmente ──────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv()

// ── Validar args ──────────────────────────────────────────────────────────────
const [, , filePath, slugArg, confidenceArg] = process.argv

if (!filePath) {
  console.error('Uso: npx tsx scripts/seed-match.ts <arquivo.json> [slug] [S|A|B|C]')
  process.exit(1)
}

const absPath = path.resolve(process.cwd(), filePath)
if (!fs.existsSync(absPath)) {
  console.error(`Arquivo não encontrado: ${absPath}`)
  process.exit(1)
}

// ── Derivar slug a partir do nome do arquivo ──────────────────────────────────
const slug = slugArg ?? path.basename(absPath, '.json')

// ── Ler e parsear o JSON ──────────────────────────────────────────────────────
const raw = JSON.parse(fs.readFileSync(absPath, 'utf-8'))

// ── Extrair metadados do match ────────────────────────────────────────────────
const matchStr: string = raw.header?.match ?? raw.match ?? ''
const parts = matchStr.split(' vs ')
const teamA = parts[0]?.trim() ?? slug
const teamB = parts[1]?.trim() ?? ''

const tournament: string = raw.header?.event ?? raw.tournament ?? ''
const matchDate: string = raw.header?.date ?? raw.date ?? new Date().toISOString()
const confidence: string = confidenceArg ?? raw.entries_ranked?.[0]?.confidence ?? 'A'

// ── Conectar ao Turso ─────────────────────────────────────────────────────────
const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !authToken) {
  console.error('TURSO_DATABASE_URL e TURSO_AUTH_TOKEN devem estar no .env.local')
  process.exit(1)
}

const db = createClient({ url, authToken })

// ── Sortear cover da pasta public/covers ──────────────────────────────────────
function pickRandomCover(): string {
  const coversDir = path.resolve(process.cwd(), 'public', 'covers')
  const files = fs.readdirSync(coversDir).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
  if (files.length === 0) return ''
  const picked = files[Math.floor(Math.random() * files.length)]
  return `/covers/${picked}`
}

// ── Inserir no banco ──────────────────────────────────────────────────────────
async function main() {
  console.log(`\nInserindo: ${slug}`)
  console.log(`  Times: ${teamA} vs ${teamB}`)
  console.log(`  Torneio: ${tournament}`)
  console.log(`  Data: ${matchDate}`)

  // Garantir que a coluna cover_image existe (migração idempotente)
  try {
    await db.execute(`ALTER TABLE matches ADD COLUMN cover_image TEXT`)
  } catch {
    // Coluna já existe — ignorar
  }

  const coverImage = pickRandomCover()
  if (coverImage) console.log(`  Cover: ${coverImage}`)

  // Upsert em matches — cover_image só é definido no INSERT, nunca sobrescrito
  await db.execute({
    sql: `INSERT INTO matches (slug, team_a, team_b, tournament, match_date, status, confidence, cover_image)
          VALUES (?, ?, ?, ?, ?, 'open', ?, ?)
          ON CONFLICT(slug) DO UPDATE SET
            team_a = excluded.team_a,
            team_b = excluded.team_b,
            tournament = excluded.tournament,
            match_date = excluded.match_date,
            confidence = excluded.confidence`,
    args: [slug, teamA, teamB, tournament, matchDate, confidence, coverImage],
  })

  // Upsert em match_analysis
  await db.execute({
    sql: `INSERT INTO match_analysis (slug, data)
          VALUES (?, ?)
          ON CONFLICT(slug) DO UPDATE SET data = excluded.data`,
    args: [slug, JSON.stringify(raw)],
  })

  console.log(`\nOK — acesse: /games/${slug}\n`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Erro ao inserir:', err)
  process.exit(1)
})
