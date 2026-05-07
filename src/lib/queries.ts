// src/lib/queries.ts
import { db } from "./db";
import { CardState, MatchRow, MatchAnalysis } from "./types";

export interface MatchCardData {
  slug: string;
  teamA: string;
  teamB: string;
  tournament: string;
  matchDate: string;
  cardState: CardState;
  entriesCount: number;
}

function statusToCardState(status: string): CardState {
  switch (status) {
    case 'open':    return 'yellow';
    case 'closed':  return 'gold';
    case 'balance': return 'cyan';
    default:        return 'neutral';
  }
}

export async function getMatchesForCarrossel(): Promise<MatchCardData[]> {
  try {
    const result = await db.execute(`
      SELECT
        m.slug,
        m.team_a,
        m.team_b,
        m.tournament,
        m.match_date,
        m.status,
        COALESCE(json_array_length(json_extract(ma.data, '$.entries_ranked')), 0) AS entries_count
      FROM matches m
      LEFT JOIN match_analysis ma ON m.slug = ma.slug
      ORDER BY m.match_date DESC
    `);

    return (result.rows as any[]).map((row) => ({
      slug: row.slug,
      teamA: row.team_a,
      teamB: row.team_b,
      tournament: row.tournament,
      matchDate: row.match_date,
      cardState: statusToCardState(row.status),
      entriesCount: Number(row.entries_count),
    }));
  } catch {
    return [];
  }
}

// Busca jogos para o carrossel (apenas dados básicos)
export async function getUpcomingMatches(): Promise<MatchRow[]> {
  const result = await db.execute(
    "SELECT * FROM matches WHERE status = 'upcoming' ORDER BY match_date ASC"
  );
  return result.rows as unknown as MatchRow[];
}

export interface ProfitCardData {
  balance: number;
  greens: number;
  totalResolved: number;
  lastUpdated: string | null;
}

// Calcula todos os dados do Profit Card em uma única query.
// Win rate = greens / (greens + reds). Entries 'default' são ignoradas.
export async function getProfitCardData(): Promise<ProfitCardData> {
  try {
    const result = await db.execute(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'green' THEN (odd - 1) * stake ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN status = 'red'   THEN stake             ELSE 0 END), 0) AS balance,
        COALESCE(SUM(CASE WHEN status = 'green' THEN 1 ELSE 0 END), 0)               AS greens,
        COALESCE(SUM(CASE WHEN status IN ('green','red') THEN 1 ELSE 0 END), 0)      AS total_resolved,
        MAX(CASE WHEN status IN ('green','red') THEN COALESCE(resolved_at, created_at) END) AS last_updated
      FROM entries
    `);
    const row = result.rows[0] as any;
    return {
      balance:       row?.balance       != null ? parseFloat(Number(row.balance).toFixed(2))  : 0,
      greens:        row?.greens        != null ? Number(row.greens)        : 0,
      totalResolved: row?.total_resolved != null ? Number(row.total_resolved) : 0,
      lastUpdated:   row?.last_updated  ?? null,
    };
  } catch {
    return { balance: 0, greens: 0, totalResolved: 0, lastUpdated: null };
  }
}

/** @deprecated use getProfitCardData() */
export async function getSkinInTheGameBalance(): Promise<number> {
  return (await getProfitCardData()).balance;
}

// Atualiza o status de uma entry e registra resolved_at quando green/red.
export async function updateEntryStatus(
  matchSlug: string,
  marketName: string,
  status: 'green' | 'red' | 'default'
): Promise<void> {
  await db.execute({
    sql: `UPDATE entries
          SET status      = ?,
              resolved_at = CASE WHEN ? IN ('green','red') THEN datetime('now') ELSE NULL END
          WHERE match_slug = ? AND market_name = ?`,
    args: [status, status, matchSlug, marketName],
  });
}

// Sincroniza entries de um analysis JSON para a tabela entries.
// Entradas já existentes (match_slug + market_name) são ignoradas para preservar status.
export async function syncEntriesFromAnalysis(
  slug: string,
  entries: Array<{ market_name: string; odd: number; stake: number }>
): Promise<void> {
  if (entries.length === 0) return;
  const placeholders = entries.map(() => '(?, ?, ?, ?, \'default\')').join(', ');
  const args = entries.flatMap((e) => [slug, e.market_name, e.odd, e.stake]);
  await db.execute({
    sql: `INSERT INTO entries (match_slug, market_name, odd, stake, status)
          VALUES ${placeholders}
          ON CONFLICT(match_slug, market_name) DO NOTHING`,
    args,
  });
}

// Busca a análise completa de um jogo específico e sincroniza entries automaticamente
export async function getMatchBySlug(slug: string) {
  const result = await db.execute({
    sql: `
      SELECT m.*, ma.data
      FROM matches m
      JOIN match_analysis ma ON m.slug = ma.slug
      WHERE m.slug = ?`,
    args: [slug],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const analysis = JSON.parse(row.data as string) as MatchAnalysis;

  // Sincroniza entries da análise para a tabela entries (idempotente — preserva status)
  try {
    const allEntries: any[] = (analysis as any).entries_ranked ?? [];
    const recStakesRaw: any[] = (analysis as any).recommendations?.entries_with_stakes ?? [];
    const recRankSet = new Set(
      recStakesRaw
        .map((r: any) => {
          if (typeof r === 'string') { const m = r.match(/^#(\d+)/); return m ? parseInt(m[1]) : null; }
          return r?.rank ?? null;
        })
        .filter((v): v is number => v != null)
    );
    const activeEntries = recRankSet.size > 0
      ? allEntries.filter((e: any) => recRankSet.has(e.rank))
      : allEntries.filter((e: any) => (e.confidence ?? '') !== 'SEM EDGE');

    const toSync = activeEntries
      .map((e: any) => ({
        market_name: e.market_name ?? e.market ?? '',
        odd: Number(e.odd ?? 0),
        stake: Number(e.stake ?? 1),
      }))
      .filter((e) => e.market_name);

    if (toSync.length > 0) await syncEntriesFromAnalysis(slug, toSync);
  } catch {
    // Falha silenciosa — não bloqueia a renderização da página
  }

  return {
    match: row as unknown as MatchRow,
    analysis,
  };
}