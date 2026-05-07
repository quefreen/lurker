// src/app/games/[slug]/page.tsx
import { getMatchBySlug, getMatchesForCarrossel, getProfitCardData } from '@/lib/queries';
import { notFound } from 'next/navigation';
import { calcCardState } from '@/lib/utils';
import { currentUser } from '@clerk/nextjs/server';
import DataPageV2 from '@/components/DataPageV2';
import { CarrosselJogos } from '@/components/CarrosselJogos';
import LandingMenu from '@/components/LandingMenu';
import type { MatchAnalysis } from '@/lib/types';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function GamePage({ params }: PageProps) {
  // 1. O Next.js pega o 'slug' direto da URL (ex: parivision-vs-vitality...)
  const { slug } = await params;
  const [data, matches, profit, user] = await Promise.all([
    getMatchBySlug(slug),
    getMatchesForCarrossel(),
    getProfitCardData(),
    currentUser(),
  ]);

  if (!data) {
    notFound();
  }

  const { match, analysis } = data;
  const cardState = calcCardState(match.confidence);

  const isAuthenticated = !!user;

  const teaserEntriesCount = (analysis.entries_ranked ?? []).length;

  const analysisToRender: MatchAnalysis = isAuthenticated ? analysis : {
    header:           analysis.header,
    context:          analysis.context,
    bo3_probabilities: (analysis as any).bo3_probabilities,
    odds_movement:    { public_split: (analysis as any).odds_movement?.public_split ?? {} },
    entries_ranked:   [],
    recommendations:  { scenario_analysis: [], entries_with_stakes: [] },
    alerts:           [],
    do_not_recommend: [],
    summary_table:    [],
    confidence_legend: {},
    veto_prediction:  null,
    map_analysis:     null,
  };

  return (
    <main className="min-h-screen">
      <LandingMenu />
      <CarrosselJogos matches={matches} balance={profit.balance} greens={profit.greens} totalEntries={profit.totalResolved} lastUpdated={profit.lastUpdated ?? undefined} />
      <DataPageV2
        analysis={analysisToRender}
        cardState={cardState}
        coverImage={match.cover_image}
        mode={isAuthenticated ? 'full' : 'teaser'}
        teaserEntriesCount={isAuthenticated ? undefined : teaserEntriesCount}
      />
    </main>
  );
}