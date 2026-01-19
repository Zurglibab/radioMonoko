import Link from 'next/link';
import { Star } from 'lucide-react';

import { RecommendationCard, type RecommendationItem } from '@/components/home/RecommendationCard';

type RecommendationsSectionProps = {
  items: RecommendationItem[];
};

export function RecommendationsSection({ items }: RecommendationsSectionProps) {
  return (
    <section className="space-y-4">
      {/* header clean */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-gray-900" />
          <h2 className="text-sm font-semibold text-gray-900">
            Recommandations pour vous
          </h2>
        </div>

        <Link href="/recommendations" className="text-sm font-medium text-gray-900 hover:underline">
          Voir tout
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <RecommendationCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}