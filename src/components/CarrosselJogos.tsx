'use client'

import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FixedProfitCard } from '@/components/ProfitCard';
import { GameCardItem, mockGameCards, type GameCardData } from '@/components/GameCard';

interface CarrosselProps {
  matches?: GameCardData[];
  balance?: number;
  greens?: number;
  totalEntries?: number;
  lastUpdated?: string;
}

export function CarrosselJogos({ matches, balance = 0, greens = 0, totalEntries = 0, lastUpdated }: CarrosselProps) {
  const cards = matches ?? mockGameCards;

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', slidesToScroll: 1, loop: false });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="w-full flex items-center justify-center p-6" style={{ background: '#05060f' }}>
      <div className="w-full max-w-[1200px] flex flex-col gap-[24px] lg:flex-row lg:items-stretch lg:gap-[24px]">
        {/* Left: header + carousel */}
        <div className="flex flex-col gap-[4px] flex-1 min-w-0">
          <div className="flex items-center justify-between w-full">
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '24px', color: '#ffffff', lineHeight: 'normal' }}>
              Next games data indicators betting
            </span>
            <div className="flex gap-[12px] items-center p-[12px] shrink-0">
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="flex items-center justify-center rounded-full size-[24px] transition-opacity"
                style={{ background: '#242424', opacity: canScrollPrev ? 1 : 0.4, cursor: canScrollPrev ? 'pointer' : 'not-allowed' }}
                aria-label="Previous"
              >
                <ChevronLeft size={14} color="#ffffff" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="flex items-center justify-center rounded-full size-[24px] transition-opacity"
                style={{ background: '#242424', opacity: canScrollNext ? 1 : 0.4, cursor: canScrollNext ? 'pointer' : 'not-allowed' }}
                aria-label="Next"
              >
                <ChevronRight size={14} color="#ffffff" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-[24px]">
              {cards.map((card) => (
                <div key={card.slug} className="shrink-0 basis-full sm:basis-[calc(50%-12px)] lg:basis-[calc(25%-18px)]">
                  <GameCardItem card={card} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Profit Card */}
        <div className="w-full lg:w-[218px] shrink-0 self-stretch flex flex-col">
          <FixedProfitCard balance={balance} greens={greens} totalEntries={totalEntries} lastUpdated={lastUpdated} />
        </div>
      </div>
    </div>
  );
}
