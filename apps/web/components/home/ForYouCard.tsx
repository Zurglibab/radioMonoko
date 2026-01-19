import { Heart } from 'lucide-react';

export function ForYouCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 fill-black text-black" />
        <h3 className="text-sm font-semibold text-gray-900">Pour vous</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        Créez votre profil d&apos;écoute en likant et commentant vos contenus préférés
        pour recevoir des recommandations personnalisées.
      </p>
      <button
        type="button"
        className="mt-4 w-full rounded-xl bg-black py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-900 active:scale-[0.99]"
      >
        Commencer
      </button>
    </div>
  );
}