import Image from 'next/image';
import { Play, Heart, MessageSquare, Share2, Clock, Music } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';

interface ContentCardProps {
  type: 'Podcast' | 'Playlist' | 'Livre audio';
  title: string;
  subtitle: string;
  imageUrl: string;
  duration?: string;
  trackCount?: number;
  likes: number;
  comments?: number;
}

export function ContentCard({
  type,
  title,
  subtitle,
  imageUrl,
  duration,
  trackCount,
  likes,
  comments = 0,
}: ContentCardProps) {
  return (
    <div className="group flex flex-col gap-3 cursor-pointer">
      {/* Container Image avec effet Hover */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Overlay sombre au hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Badges (Top Left & Top Right) */}
        <div className="absolute left-3 top-3">
          <Badge variant="glass" className="bg-white/90 text-xs font-bold text-gray-900 shadow-sm">
            {type}
          </Badge>
        </div>

        {/* Indicateur Durée ou Pistes (Bottom Left) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-white drop-shadow-md">
          {type === 'Playlist' ? <Music className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
          <span>{type === 'Playlist' ? `${trackCount} morceaux` : duration}</span>
        </div>

        {/* Bouton Play Flottant (apparaît au hover) */}
        <button className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-indigo-700 hover:scale-110">
          <Play className="ml-1 h-5 w-5 fill-current" />
        </button>
      </div>

      {/* Info Content */}
      <div className="space-y-1">
        <h4 className="font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {title}
        </h4>
        <p className="text-sm text-gray-500 line-clamp-1">{subtitle}</p>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto pt-1">
        <div className="flex items-center gap-1 hover:text-gray-600 transition-colors">
          <Heart className="h-4 w-4" />
          <span>{likes}</span>
        </div>
        <div className="flex items-center gap-1 hover:text-gray-600 transition-colors">
          <MessageSquare className="h-4 w-4" />
          <span>{comments}</span>
        </div>
        <button className="ml-auto hover:text-gray-900 transition-colors">
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}