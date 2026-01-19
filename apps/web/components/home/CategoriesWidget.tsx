import { Music, Mic, Radio, BookOpen, TrendingUp, ChevronRight } from "lucide-react";

{/*Liste des catégories affichées */}
const CATEGORIES = [
  { label: "Musique", count: 2450, icon: Music, color: "text-blue-500" },
  { label: "Podcasts", count: 1823, icon: Mic, color: "text-purple-500" },
  { label: "Radios", count: 456, icon: Radio, color: "text-green-500" },
  { label: "Livres Audio", count: 892, icon: BookOpen, color: "text-orange-500" },
  { label: "Actualités", count: 634, icon: TrendingUp, color: "text-red-500" },
];

export function CategoriesWidget() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
        <span className="text-orange-500">🔥</span> Catégories populaires
      </h3>

      <div className="space-y-3">
        {/* On parcourt les catégories pour afficher chaque ligne */}
        {CATEGORIES.map((cat) => (
          <a key={cat.label} href="#" className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 ${cat.color} group-hover:scale-110 transition-transform`}
              >
                <cat.icon className="h-4 w-4" />
              </div>

              <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">
                {cat.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                {cat.count}
              </span>

              <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-gray-500" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
