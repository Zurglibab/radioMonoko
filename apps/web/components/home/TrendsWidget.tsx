import { TrendingUp } from 'lucide-react';
import Image from 'next/image';


{/* listes de tendances */}
const TRENDS = [
  { id: 1, title: 'Nuit Électro', author: 'Club Vibes', listeners: 24500, growth: '+45%', image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=100&q=80' },
  { id: 2, title: 'Jazz du soir', author: 'Smooth Jazz Radio', listeners: 18230, growth: '+32%', image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=100&q=80' },
  { id: 3, title: 'Mindfulness Daily', author: 'Zen Podcast', listeners: 15600, growth: '+28%', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=100&q=80' },
  { id: 4, title: 'Tech News', author: 'Digital Today', listeners: 12800, growth: '+22%', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&q=80' },
];

export function TrendsWidget() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-5 flex items-center gap-2 font-bold text-gray-900">
        <TrendingUp className="h-5 w-5 text-gray-900" /> Tendances du moment
      </h3>
      <div className="space-y-5">
        {TRENDS.map((item, index) => (
          <div key={item.id} className="flex items-center gap-4 group cursor-pointer">
            <span className="w-4 text-center text-sm font-bold text-gray-300">{index + 1}</span>
            <div className="relative h-10 w-10 overflow-hidden rounded-md">
              <Image src={item.image} alt={item.title} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="truncate text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
              <p className="truncate text-xs text-gray-500">{item.author}</p>
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">
              {item.growth}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}