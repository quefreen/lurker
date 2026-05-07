// src/scripts/add-match.ts

import * as fs from 'fs';
import path from 'path';
import { db } from '../lib/db';
import { MatchAnalysis } from '../lib/types';

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('❌ Erro: Por favor, forneça o caminho para o arquivo JSON.');
    process.exit(1);
  }

  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    console.log(`📖 Lendo o arquivo: ${absolutePath}`);
    
    const fileContent = fs.readFileSync(absolutePath, 'utf-8');
    const analysis: MatchAnalysis = JSON.parse(fileContent);

    // 💡 A SUA IDEIA AQUI: Extrair o slug diretamente do nome do arquivo
    // Isso transforma "./Navi-vs-G2-pgl-cluj-napoca-2026-18-02.json" 
    // em "Navi-vs-G2-pgl-cluj-napoca-2026-18-02"
    const slug = path.basename(filePath, '.json');

    // 1. Extrair os dados da seção 'header' para o resumo
    const header = analysis.header;
    
    let teamA = "Time A";
    let teamB = "Time B";

    if (header && header.match && header.match.includes(' vs ')) {
      const parts = header.match.split(' vs ');
      teamA = parts[0].trim();
      teamB = parts[1].trim();
    }

    const tournament = header ? header.event : "Torneio Desconhecido";
    const matchDate = header ? header.date : new Date().toISOString();

    // 2. Pegar a confiança da melhor entrada para o card state
    const bestEntry = analysis.entries_ranked && analysis.entries_ranked.length > 0 
        ? analysis.entries_ranked[0] 
        : null;
    const confidence = bestEntry ? bestEntry.confidence : 'C';

    console.log(`⏳ Inserindo jogo: ${teamA} vs ${teamB}`);
    console.log(`🔗 URL gerada: /games/${slug}`);

    // 3. Inserir no banco de dados
    await db.batch([
      {
        sql: `INSERT INTO matches (slug, team_a, team_b, tournament, match_date, confidence, status)
              VALUES (?, ?, ?, ?, ?, ?, 'open')
              ON CONFLICT(slug) DO UPDATE SET
              team_a = excluded.team_a,
              team_b = excluded.team_b,
              tournament = excluded.tournament,
              match_date = excluded.match_date,
              confidence = excluded.confidence,
              status = 'open'`,
        args: [slug, teamA, teamB, tournament, matchDate, confidence]
      },
      {
        sql: `INSERT INTO match_analysis (slug, data) 
              VALUES (?, ?)
              ON CONFLICT(slug) DO UPDATE SET 
              data = excluded.data,
              updated_at = datetime('now')`,
        args: [slug, fileContent]
      }
    ]);

    console.log(`✅ Sucesso! Análise salva no Turso com o slug: ${slug}`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Ocorreu um erro ao processar e inserir no banco:', error);
    process.exit(1);
  }
}

main();