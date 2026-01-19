import Link from 'next/link';
import { Music2 } from 'lucide-react';

import { PlaylistCard } from '@/components/home/PlaylistCard';

type PlaylistItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  trackCount: number;
};

type TrendingPlaylistsSectionProps = {
  items: PlaylistItem[];
};

export function TrendingPlaylistsSection({ items }: TrendingPlaylistsSectionProps) {
  return (
    <section
      className="
        bg-[#F6F7F9]
        px-4 py-6 sm:px-6
        border border-gray-100
      "
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music2 className="h-5 w-5 text-gray-900" />
          <h2 className="text-sm font-semibold text-gray-900">Playlists du moment</h2>
        </div>

        <Link href="/playlists" className="text-sm font-medium text-gray-900 hover:underline">
          Voir tout
        </Link>
      </div>

      {/* cards */}
      <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((pl) => (
          <PlaylistCard
            key={pl.id}
            title={pl.title}
            subtitle={pl.subtitle}
            imageUrl={pl.imageUrl}
            trackCount={pl.trackCount}
          />
        ))}
      </div>
    </section>
  );
}