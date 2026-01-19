'use client';

import Image from 'next/image';
import { Play, Clock3, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type PodcastCardProps = {
  title: string;
  subtitle: string;
  imageUrl: string;
  duration: string;
  listens?: number;
  category?: string;
  className?: string;
};

const formatListens = (value?: number) => {
  if (!value) return '';
  return new Intl.NumberFormat('fr-FR').format(value);
};

export function PodcastCard({
  title,
  subtitle,
  imageUrl,
  duration,
  listens,
  category = 'Podcast',
  className,
}: PodcastCardProps) {
  return (
    <article
      className={cn(
        'group w-[280px] shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm',
        'transition-shadow hover:shadow-md',
        className
      )}
    >
      {/* Image (hover = zoom + play) */}
      <div className="relative h-[160px] w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="280px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />

        {/* Petit badge catégorie */}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-900 backdrop-blur">
          {category}
        </span>

        {/* Play (au hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            aria-label={`Lire ${title}`}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              'bg-black/60 text-white backdrop-blur',
              'shadow-lg ring-1 ring-white/20',
              'transition-transform duration-200 hover:scale-105'
            )}
          >
            <Play className="ml-0.5 h-5 w-5 fill-white" />
          </button>
        </div>
      </div>

      {/* Texte */}
      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>

        {/* Meta */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Clock3 className="h-4 w-4" />
            <span>{duration}</span>
          </div>

          {listens ? (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              <span>{formatListens(listens)} écoutes</span>
            </div>
          ) : (
            <span className="opacity-70">—</span>
          )}
        </div>
      </div>
    </article>
  );
}