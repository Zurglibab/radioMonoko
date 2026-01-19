import { Radio, Star } from 'lucide-react';
import { StationCard } from '@/components/radio/StationCard';;
import { CategoriesWidget  } from '@/components/home/CategoriesWidget';
import { TrendsWidget } from '@/components/home/TrendsWidget';
import { ForYouCard } from '@/components/home/ForYouCard';
import { TrendingPodcastsSection } from '@/components/home/TrendingPodcastsSection';
import { TrendingPlaylistsSection } from '@/components/home/TrendingPlaylistsSection';
import { AudioNewsSection } from '@/components/home/AudioNewsSection';
import { RecommendationsSection } from '@/components/home/RecommendationsSection';

const FEATURED_STATIONS = [
  { id: '1', title: 'Jazz & Soul FM', description: 'Les meilleurs classiques du jazz et de la soul.', genre: 'Jazz', listenerCount: 12543, isLive: true, coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80' },
  { id: '2', title: 'Indie Découverte', description: 'Nouveaux talents de la scène indie.', genre: 'Indie', listenerCount: 8234, isLive: true, coverUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&q=80' },
  { id: '3', title: 'Électro Pulse', description: 'Sons électroniques innovants.', genre: 'Électro', listenerCount: 15789, isLive: true, coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80' },
];

const PODCASTS = [
  { id: 'p1', title: "L'avenir de l'IA et la créativité", subtitle: 'Tech Tomorrow', imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80', duration: '45 min', listens: 28500, category: 'Technologie' },
  { id: 'p2', title: 'Voyage sonore en Islande', subtitle: 'Monde Audio', imageUrl: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=1200&q=80', duration: '32 min', listens: 15200, category: 'Voyage' },
  { id: 'p3', title: 'Histoire du Jazz Moderne', subtitle: 'Jazz Stories', imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&q=80', duration: '52 min', listens: 12800, category: 'Musique' },
  { id: 'p4', title: 'Méditation et bien-être', subtitle: 'Zen & Co', imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80', duration: '28 min', listens: 9100, category: 'Bien-être' },
  { id: 'p5', title: 'Culture & société', subtitle: 'Voix du monde', imageUrl: 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?w=1200&q=80', duration: '39 min', listens: 10400, category: 'Culture' },
];

const PLAYLISTS = [
  { id: 'pl1', type: 'Playlist', title: 'Concentration profonde', subtitle: 'Pour booster votre productivité', imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80', trackCount: 42, likes: 3420 },
  { id: 'pl2', type: 'Playlist', title: 'Workout Energy', subtitle: 'Rythmes pour le sport', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', trackCount: 35, likes: 4200 },
  { id: 'pl3', type: 'Playlist', title: 'Soirée Chill', subtitle: 'Détente après le travail', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80', trackCount: 28, likes: 1567 },
  { id: 'pl4', type: 'Playlist', title: 'Indie Gems 2025', subtitle: 'Les pépites indie', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80', trackCount: 50, likes: 1120 },
];

const AUDIO_NEWS = [
  {  id: 'n1', title: "Les dernières avancées en matière d'intelligence...",  source: 'Tech News Audio',  duration: '8 min',  publishedAgo: 'Il y a 2 heures',  imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80' },
  {  id: 'n2',  title: 'Économie : Analyse des marchés financiers',  source: 'Éco Info',  duration: '12 min',  publishedAgo: 'Il y a 4 heures',  imageUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=300&q=80' },
  {  id: 'n3',  title: 'Culture : Retour sur le festival de Cannes',  source: 'Culture Audio',  duration: '15 min',  publishedAgo: 'Il y a 6 heures',  imageUrl: 'https://images.unsplash.com/photo-1520342868574-5fa3804e551c?w=300&q=80' },
];

const RECOMMENDATIONS = [
  { id: 'r1', type: 'Podcast', tag: 'Photographie', title: 'Les secrets de la photographie nocturne', subtitle: 'Photo Academy', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80', duration: '42 min', likes: 1250, comments: 87 },
  { id: 'r2', type: 'Playlist', tag: 'Pop', title: 'Summer Vibes 2025', subtitle: 'DJ Sunshine', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', duration: '2h 15min', likes: 3420, comments: 156 },
  { id: 'r3', type: 'Radio', title: 'Classique Matinal', subtitle: 'Radio Classique', imageUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200&q=80', listeners: 8234, isLive: true, likes: 892, comments: 45 },
  { id: 'r4', type: 'Livre audio', tag: 'Littérature', title: 'Le Petit Prince', subtitle: 'Antoine de Saint-Exupéry', imageUrl: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=1200&q=80', duration: '3h 45min', likes: 2100, comments: 234 },
  { id: 'r5', type: 'Podcast', tag: 'Business', title: 'Startup Stories', subtitle: 'Business Talks', imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80', duration: '38 min', likes: 1567, comments: 92 },
  { id: 'r6', type: 'Playlist', tag: 'Sport', title: 'Workout Motivation', subtitle: 'Fitness Beats', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80', duration: '1h 30min', likes: 4200, comments: 210 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero stations live */}
      <section className="border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/50">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mb-10 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 ring-1 ring-red-100/50">
                <Radio className="h-3 w-3 animate-pulse" />
                EN DIRECT
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Radios en direct
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-gray-500">
              Découvrez nos stations phares et rejoignez des milliers d&apos;auditeurs.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_STATIONS.map((station) => (
              <StationCard key={station.id} {...station} />
            ))}
          </div>
        </div>
      </section>

      {/* Main + sidebar */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-16 lg:col-span-9">
            {/* Podcasts tendance */}
            <TrendingPodcastsSection items={PODCASTS} />

            {/* Playlists */}
            <TrendingPlaylistsSection items={PLAYLISTS} />

            {/* News audio */}
            <AudioNewsSection items={AUDIO_NEWS} />

            {/* Recommendations */}
            <RecommendationsSection items={RECOMMENDATIONS} />
          </div>

          {/* Widgets */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-8">
              <CategoriesWidget />
              <TrendsWidget />
              <ForYouCard />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}