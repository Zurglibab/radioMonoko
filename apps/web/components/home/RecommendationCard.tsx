'use client';

import Image from 'next/image';
import {
  Heart,
  MessageCircle,
  Share2,
  Play,
  Clock3,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/utils/cn';

export type RecommendationItem = {
  id: string;
  type: 'Podcast' | 'Playlist' | 'Radio' | 'Livre audio' | string;
  title: string;
  subtitle: string;
  imageUrl: string;
  tag?: string;
  isLive?: boolean;
  duration?: string;
  listeners?: number;
  likes: number;
  comments?: number;
};

type RecommendationCardProps = {
  item: RecommendationItem;
  className?: string;
};

const formatNumber = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

export function RecommendationCard({ item, className }: RecommendationCardProps) {
  return (
    <article
      className={cn(
        'group overflow-hidden rounded-2xl border border-gray-200 bg-white',
        'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
        className
      )}
    >
      {/* Image + overlays */}
      <div className="relative h-[210px] w-full overflow-hidden">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />

        {/* voile léger pour la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* badges top */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-900 backdrop-blur">
            {item.type}
          </span>

          {item.tag && (
            <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {item.tag}
            </span>
          )}
        </div>

        {/* live badge top-right */}
        {item.isLive && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold text-white">
              <span className="h-2 w-2 rounded-full [animation:liveDotPulse_2s_ease-in-out_infinite]" />
              EN DIRECT
            </span>
          </div>
        )}

        {/* meta bas gauche (durée ou auditeurs) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white/90">
          {item.duration ? (
            <>
              <Clock3 className="h-3.5 w-3.5" />
              <span>{item.duration}</span>
            </>
          ) : item.listeners != null ? (
            <>
              <Users className="h-3.5 w-3.5" />
              <span>{formatNumber(item.listeners)} auditeurs</span>
            </>
          ) : null}
        </div>

        {/* play au hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            aria-label={`Lire ${item.title}`}
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full',
              'bg-black/70 text-white backdrop-blur',
              'shadow-xl ring-1 ring-white/20',
              'transition-transform duration-200 hover:scale-105'
            )}
          >
            <Play className="ml-0.5 h-6 w-6 fill-white" />
          </button>
        </div>
      </div>

      {/* texte */}
      <div className="px-5 py-4">
        <h3 className="text-base font-medium text-gray-900">{item.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{item.subtitle}</p>

        <div className="my-4 h-px bg-gray-200" />

        {/* actions */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-50"
            aria-label="Aimer"
          >
            <Heart className="h-4 w-4" />
            <span className="text-xs font-medium">{formatNumber(item.likes)}</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-50"
            aria-label="Commenter"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-medium">
              {formatNumber(item.comments ?? 0)}
            </span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-50"
            aria-label="Partager"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}