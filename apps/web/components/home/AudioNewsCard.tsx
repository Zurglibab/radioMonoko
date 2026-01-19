'use client';

import Image from 'next/image';
import { Play, Clock3 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type AudioNewsItem = {
  id: string;
  title: string;
  source: string;
  duration: string;
  publishedAgo: string;
  imageUrl: string;
  href?: string;
};

type AudioNewsCardProps = {
  item: AudioNewsItem;
  className?: string;
};

export function AudioNewsCard({ item, className }: AudioNewsCardProps) {
  return (
    <article
      className={cn(
        'group flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4',
        'transition-all duration-200 hover:shadow-md',
        className
      )}
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            aria-label={`Lire : ${item.title}`}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              'bg-black/60 text-white backdrop-blur',
              'shadow-lg ring-1 ring-white/20'
            )}
          >
            <Play className="ml-0.5 h-4 w-4 fill-white" />
          </button>
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
          {item.title}
        </h3>

        <p className="mt-1 text-sm text-gray-500">{item.source}</p>

        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {item.duration}
          </span>
          <span className="text-gray-300">•</span>
          <span>{item.publishedAgo}</span>
        </div>
      </div>
    </article>
  );
}