import Link from 'next/link';
import { Mic2 } from 'lucide-react';

import { PodcastCard } from '@/components/home/PodcastCard';

type PodcastItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  duration: string;
  listens?: number;
  category?: string;
};

type TrendingPodcastsSectionProps = {
  items: PodcastItem[];
};

export function TrendingPodcastsSection({ items }: TrendingPodcastsSectionProps) {
  return (
    <section className="space-y-4">
      {/* Header simple */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic2 className="h-5 w-5 text-gray-900" />
          <h2 className="text-sm font-semibold text-gray-900">Podcasts tendance</h2>
        </div>

        <Link
          href="/podcasts"
          className="text-sm font-medium text-gray-900 hover:underline"
        >
          Voir tout
        </Link>
      </div>

      {/* Slider horizontal */}
      <div
        className={`
          slider-scrollbar
          flex gap-6 overflow-x-auto pb-4
          scroll-smooth
        `}
      >
        {items.map((p) => (
          <PodcastCard
            key={p.id}
            title={p.title}
            subtitle={p.subtitle}
            imageUrl={p.imageUrl}
            duration={p.duration}
            listens={p.listens}
            category={p.category ?? 'Podcast'}
          />
        ))}

        <div className="w-1 shrink-0" />
      </div>
    </section>
  );
}