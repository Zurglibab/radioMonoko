import * as React from 'react';
import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'default' | 'live' | 'glass';

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: BadgeVariant;
};

const BADGE_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  glass: 'bg-white/90 backdrop-blur-sm text-gray-900 font-semibold',

  // Le style “live” : fond rouge + texte blanc.
  live: 'bg-red-600 text-white animate-pulse-slow',
};

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        BADGE_STYLES[variant],
        className
      )}
      {...props}
    >
      {/* Petit point “live” */}
      {variant === 'live' && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white" />
      )}

      {children}
    </div>
  );
}