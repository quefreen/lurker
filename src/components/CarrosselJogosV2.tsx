'use client'

import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GameCardItemV2, type GameCardData } from '@/components/GameCardV2';
import { mockGameCards } from '@/components/GameCard';

interface CarrosselProps {
  matches?: GameCardData[];
}

export function CarrosselJogosV2({ matches }: CarrosselProps) {
  const cards = (matches ?? mockGameCards).filter(c => c.cardState !== 'cyan');

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
    <div className="w-full flex items-center justify-center p-6" style={{ background: '#0F100A' }}>
      <div className="w-full max-w-[996px] flex flex-col gap-[12px]">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <span style={{ fontFamily: "'Geist', sans-serif", fontWeight: 500, fontSize: '24px', color: '#ffffff', lineHeight: 'normal' }}>
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

        {/* Carousel: 4 cards */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-[12px]">
            {cards.map((card) => (
              <div key={card.slug} style={{ flex: '0 0 calc(25% - 9px)', minWidth: 0 }}>
                <GameCardItemV2 card={card} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
