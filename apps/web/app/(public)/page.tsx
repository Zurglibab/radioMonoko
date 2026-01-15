import { StationCard } from '@/components/radio/StationCard';
import { LivePill } from '@/components/radio/LivePill';

// Pour l'instant je “mock” 3 stations en attendant l'API.
// (Je garde ça ici pour prototyper la landing.)
const FEATURED_STATIONS = [
  {
    id: '1',
    title: 'Jazz & Soul FM',
    description: 'Les meilleurs classiques du jazz et de la soul, 24h/24.',
    genre: 'Jazz',
    listenerCount: 12543,
    isLive: true,
    coverUrl:
      'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Indie Découverte',
    description: 'Découvrez les nouveaux talents de la scène indie internationale.',
    genre: 'Indie',
    listenerCount: 8234,
    isLive: true,
    coverUrl:
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Électro Pulse',
    description: 'Les sons électroniques les plus innovants du moment.',
    genre: 'Électro',
    listenerCount: 15789,
    isLive: true,
    coverUrl:
      'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Bloc “Radios en direct” (header + cartes) */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        {/* Titre + petit badge live */}
        <div className="mb-10 text-center space-y-4">
          {/* Le LivePill gère le style + le pulse, je le centre juste ici */}
          <div className="flex justify-center">
            <LivePill />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            Radios en direct
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            Découvrez nos stations phares et rejoignez des milliers d'auditeurs passionnés dès maintenant.
          </p>
        </div>

        {/* Cartes des stations (responsive) */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_STATIONS.map((station) => (
            <StationCard
              key={station.id}
              title={station.title}
              description={station.description}
              coverUrl={station.coverUrl}
              listenerCount={station.listenerCount}
              genre={station.genre}
              isLive={station.isLive}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
