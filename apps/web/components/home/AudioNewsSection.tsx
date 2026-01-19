import Link from 'next/link';
import { Newspaper } from 'lucide-react';

import { AudioNewsCard, type AudioNewsItem } from '@/components/home/AudioNewsCard';

type AudioNewsSectionProps = {
  items: AudioNewsItem[];
};

export function AudioNewsSection({ items }: AudioNewsSectionProps) {
  return (
    <section className="space-y-4">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-gray-900" />
          <h2 className="text-sm font-semibold text-gray-900">Actualités en audio</h2>
        </div>

        <Link href="/news" className="text-sm font-medium text-gray-900 hover:underline">
          Voir tout
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {items.map((item) => (
          <AudioNewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}