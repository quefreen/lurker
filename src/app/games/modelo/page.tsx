export const dynamic = 'force-dynamic';
import { getMatchesForCarrossel, getProfitCardData } from '@/lib/queries';
import { calcCardState } from '@/lib/utils';
import DataPageV2 from '@/components/DataPageV2';
import { CarrosselJogos } from '@/components/CarrosselJogos';
import LandingMenu from '@/components/LandingMenu';
import type { MatchAnalysis } from '@/lib/types';

const MOCK_ANALYSIS: MatchAnalysis = {
  header: {
    match: 'Natus Vincere vs G2 Esports',
    event: 'PGL Bucharest Major 2026',
    date: '2026-05-10T18:00:00',
    format: 'BO3',
    analyst_date: '2026-05-09',
  },

  confidence_legend: {
    S: 'Altíssima convicção, edge > 15%',
    A: 'Alta convicção, edge 10–15%',
    B: 'Convicção moderada, edge 5–10%',
    C: 'Convicção baixa, edge < 5%',
  },

  context: {
    rankings: {
      navi: { position: 3 },
      g2:   { position: 7 },
    },
    recent_form: {
      navi: 'W W W L W (últimos 5 jogos)',
      g2:   'W L W W L (últimos 5 jogos)',
    },
    head_to_head: '4–2 favorável a NaVi nos últimos 6 confrontos diretos.',
  },

  bo3_probabilities: {
    team_a_total: 58,
    team_b_total: 42,
    over_2_5_maps: 67,
    navi_total: 58,
    g2_total: 42,
    summary: {
      navi_win: 58,
      g2_win: 42,
    },
  },

  entries_ranked: [
    {
      rank: 1,
      market_name: 'Over 2.5 Maps',
      odd: 1.78,
      implied_prob: 56.2,
      estimated_prob: 67.0,
      edge: 16.2,
      confidence: 'S',
      stake: 3,
      justification_points: [
        'NaVi e G2 têm histórico de ir a 3 mapas em 70% dos confrontos diretos.',
        'Ambos os times chegam com rosters completos sem substituições de última hora.',
        'Mapa 1 tende a ser equilibrado — G2 raramente cede 2-0.',
      ],
      verdict: 'Edge sólido. Favorito estrutural para o mercado de total de mapas.',
    },
    {
      rank: 2,
      market_name: 'Handicap -1.5 NaVi',
      odd: 2.90,
      implied_prob: 34.5,
      estimated_prob: 44.0,
      edge: 12.8,
      confidence: 'A',
      stake: 2,
      justification_points: [
        'NaVi 2-0 em 42% dos BO3 recentes quando favorito por mais de 10 pontos de rating.',
        'G2 tem dificuldade em Inferno e Anubis — dois dos prováveis mapas escolhidos por NaVi.',
      ],
      verdict: 'Edge presente, mas requer 2-0 — use exposição controlada.',
    },
    {
      rank: 3,
      market_name: 'Map 1 Total Over 26.5 Rounds',
      odd: 1.85,
      implied_prob: 54.1,
      estimated_prob: 62.5,
      edge: 8.4,
      confidence: 'B',
      stake: 2,
      justification_points: [
        'Últimos 4 encontros neste mapa terminaram com 27+ rounds.',
        'G2 joga lento no CT side — favorece rounds extras.',
      ],
      verdict: 'Edge moderado. Mapa 1 historicamente fechado entre as equipes.',
    },
    {
      rank: 4,
      market_name: 'NaVi Win Map 2',
      odd: 1.65,
      implied_prob: 60.6,
      estimated_prob: 66.0,
      edge: 6.4,
      confidence: 'B',
      stake: 1,
      justification_points: [
        'NaVi lidera o mapa 2 em séries quando vence o mapa 1 em 80% dos casos.',
        'G2 tende a cair psicologicamente após uma derrota na abertura.',
      ],
      verdict: 'Depende do resultado do mapa 1. Considere como part of parlay.',
    },
    {
      rank: 5,
      market_name: 'Handicap +1.5 G2',
      odd: 1.38,
      implied_prob: 72.5,
      estimated_prob: 78.0,
      edge: 5.5,
      confidence: 'B',
      stake: 1,
      justification_points: [
        'G2 ganha pelo menos um mapa em 76% dos BO3 disputados nesta temporada.',
        'Proteção inteligente para quem aposta no Over 2.5 Maps.',
      ],
      verdict: 'Hedge eficiente. Use junto com Over 2.5 Maps para cobertura.',
    },
    {
      rank: 6,
      market_name: 'Map 3 Total Over 25.5 Rounds',
      odd: 1.90,
      implied_prob: 52.6,
      estimated_prob: 57.0,
      edge: 4.4,
      confidence: 'C',
      stake: 1,
      justification_points: [
        'Se houver mapa 3, tende a ser decisivo e equilibrado.',
        'Edge baixo — somente se o mapa 3 for confirmado.',
      ],
      verdict: 'Edge marginal, contingente. Entrada apenas se Over 2.5 já estiver garantido.',
    },
    {
      rank: 7,
      market_name: 'NaVi Win at Least 1 Map',
      odd: 1.10,
      implied_prob: 90.9,
      estimated_prob: 96.0,
      edge: 5.0,
      confidence: 'C',
      stake: 1,
      justification_points: [
        'NaVi não cede 2-0 para G2 desde 2023.',
        'Odd muito baixa — retorno mínimo, use somente em parlay.',
      ],
      verdict: 'Quase certeza estatística, mas odd não justifica entrada isolada.',
    },
  ],

  recommendations: {
    entries_with_stakes: [
      { rank: 1 },
      { rank: 2 },
      { rank: 3 },
      { rank: 4 },
      { rank: 5 },
    ],
    scenario_analysis: [
      {
        name: 'PROVAVEL',
        probability: 44,
        description: 'NaVi vence 2-1 — série competitiva, G2 conquista Mapa 2, mas NaVi fecha no decisivo.',
        predicted_series_score: { team_1_score: 2, team_2_score: 1 },
      },
      {
        name: 'BOM',
        probability: 30,
        description: 'NaVi varre 2-0 — domínio total, G2 não consegue se adaptar ao ritmo imposto.',
        predicted_series_score: { team_1_score: 2, team_2_score: 0 },
      },
      {
        name: 'RUIM',
        probability: 18,
        description: 'G2 vence 2-1 — NaVi perde o fio no mapa 2 e G2 aproveita o embalo no decisivo.',
        predicted_series_score: { team_1_score: 1, team_2_score: 2 },
      },
      {
        name: 'PESSIMO',
        probability: 8,
        description: 'G2 varre 2-0 — colapso de NaVi, resultado improvável mas não impossível.',
        predicted_series_score: { team_1_score: 0, team_2_score: 2 },
      },
    ],
  },

  odds_movement: {
    public_split: {
      'OVER 2.5': '64%',
      'NaVi ML':  '71%',
      'G2 ML':    '29%',
    },
    line_movement: 'Over 2.5 abriu em 1.85, fechou em 1.78 — dinheiro pesado no Over.',
  },

  alerts: [
    'Verificar escalação confirmada de NaVi 2h antes — rumor de player doente.',
    'G2 jogou 3 partidas em 4 dias — possível fadiga no mapa 3.',
    'Over 2.5 com sharp money — linha caiu 7 pontos desde abertura.',
  ],

  do_not_recommend: [
    {
      market: 'Correct Score 2-0 NaVi',
      edge: -4.2,
      reason: 'Odd não compensa o risco. 2-0 improvável contra G2 em formato Major.',
    },
    {
      market: 'G2 Win Map 1',
      edge: -2.8,
      reason: 'NaVi historicamente dominante no mapa 1 como favorito — sem value.',
    },
    {
      market: 'Under 2.5 Maps',
      edge: -8.1,
      reason: 'Contra o movimento de mercado e contra o histórico dos times. Evitar.',
    },
  ],

  summary_table: [],
  disclaimer: 'Esta análise é apenas para fins educacionais. Aposte com responsabilidade.',
  veto_prediction: null,
  map_analysis: null,
};

export default async function ModeloPage() {
  const [matches, profit] = await Promise.all([
    getMatchesForCarrossel(),
    getProfitCardData(),
  ]);

  const cardState = calcCardState('S');

  return (
    <main className="min-h-screen">
      <LandingMenu />
      <CarrosselJogos
        matches={matches}
        balance={profit.balance}
        greens={profit.greens}
        totalEntries={profit.totalResolved}
        lastUpdated={profit.lastUpdated ?? undefined}
      />
      <DataPageV2
        analysis={MOCK_ANALYSIS}
        cardState={cardState}
        mode="teaser"
        teaserEntriesCount={MOCK_ANALYSIS.entries_ranked.length}
      />
    </main>
  );
}
