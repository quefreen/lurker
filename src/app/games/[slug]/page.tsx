import { getMatchBySlug, getMatchesForCarrossel } from '@/lib/queries';
import { notFound } from 'next/navigation';
import { calcCardState } from '@/lib/utils';
import DataPageV2 from '@/components/DataPageV2';
import { CarrosselJogosV2 } from '@/components/CarrosselJogosV2';
import { SiteNavSmart } from '@/components/SiteNavSmart';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GamePage({ params }: PageProps) {
  const { slug } = await params;

  const [data, matches] = await Promise.all([
    getMatchBySlug(slug),
    getMatchesForCarrossel(),
  ]);

  if (!data) notFound();

  const { match, analysis } = data;
  const cardState = calcCardState(match.confidence);

  return (
    <main className="min-h-screen" style={{ background: '#0F100A' }}>
      <SiteNavSmart />
      <CarrosselJogosV2 matches={matches} />
      <DataPageV2
        analysis={analysis}
        cardState={cardState}
        coverImage={match.cover_image}
        mode="full"
      />
    </main>
  );
}
