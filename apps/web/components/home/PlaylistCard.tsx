'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type PlaylistCardProps = {
  title: string;
  subtitle: string;
  imageUrl: string;
  trackCount: number;
  className?: string;
};

export function PlaylistCard({
  title,
  subtitle,
  imageUrl,
  trackCount,
  className,
}: PlaylistCardProps) {
  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-gray-200 bg-white',
        'transition-all duration-300 ease-out',
        'hover:scale-[1.02] hover:shadow-lg',
        className
      )}
    >
      {/* Zone image */}
      <div className="relative h-[260px] w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />

        {/* overlay pour que le texte reste lisible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent opacity-95" />

        {/* Play au hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            aria-label={`Lire la playlist ${title}`}
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

        {/* Texte sur l’image */}
        <div className="absolute bottom-0 left-0 w-full p-4">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-white/85">{subtitle}</p>
          <p className="mt-3 text-xs font-medium text-white/80">
            {trackCount} morceaux
          </p>
        </div>
      </div>

      {/* Bas blanc comme sur la maquette */}
      <div className="h-12 bg-white" />
    </article>
  );
}