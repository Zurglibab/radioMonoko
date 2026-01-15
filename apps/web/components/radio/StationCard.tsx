'use client';

import Image from 'next/image';
import { Play, Users } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

type StationCardProps = {
  title: string;
  description: string;
  coverUrl: string;
  listenerCount: number;
  genre: string;
  isLive?: boolean;
  className?: string;
};

const formatListeners = (count: number) =>
  new Intl.NumberFormat('fr-FR').format(count);

export function StationCard({
  title,
  description,
  coverUrl,
  listenerCount,
  genre,
  isLive = false,
  className,
}: StationCardProps) {
  return (
    <div
      className={cn(
        'group relative h-[520px] w-full cursor-pointer overflow-hidden rounded-2xl bg-gray-900',
        className
      )}
    >
      {/* Image de fond, on ajoute un petit zoom au hover */}
      <Image
        src={coverUrl}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
      />

      {/* Overlay, sinon le texte se perd selon la photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

      {/* Petit repère “live” en haut à droite */}
      {isLive && (
        <div className="absolute right-4 top-4 z-10">
          <Badge variant="live" className="shadow-lg">
            EN DIRECT
          </Badge>
        </div>
      )}

      {/* Play, je le montre seulement au hover pour garder la carte clean */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
        <button
          type="button"
          aria-label={`Lancer ${title}`}
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full',
            'bg-gray-900/40 text-white backdrop-blur-sm',
            'border border-white/20 shadow-xl',
            'transition-transform duration-300 hover:scale-110 hover:bg-black/60'
          )}
        >
          <Play className="ml-1 h-8 w-8 fill-white" />
        </button>
      </div>

      {/* Infos en bas de carte (genre, listeners, titre, description) */}
      <div className="absolute bottom-0 left-0 w-full p-6 transition-transform duration-300 group-hover:-translate-y-2">
        <div className="mb-3 flex items-center gap-3">
          <Badge variant="glass">{genre}</Badge>

          <div className="flex items-center gap-1.5 text-xs font-medium text-white/90">
            <Users className="h-3.5 w-3.5" />
            <span>{formatListeners(listenerCount)}</span>
          </div>
        </div>

        <h3 className="mb-1 text-xl font-bold leading-tight text-white">
          {title}
        </h3>

        <p className="line-clamp-2 text-sm text-gray-300">{description}</p>
      </div>
    </div>
  );
}