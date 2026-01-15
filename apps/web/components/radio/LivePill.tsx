import { Radio } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type LivePillProps = {
  className?: string;
  label?: string;
};

export function LivePill({
  className,
  label = 'EN DIRECT',
}: LivePillProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2',
        className
      )}
    >
      {/* Icône “radio” */}
      <Radio className="h-8 w-8 text-black" />

      {/* Badge live, le fond pulse doucement, le texte reste lisible */}
      <span
        className={cn(
          'inline-flex items-center rounded-[8px] px-3 py-1',
          'text-[11px] font-bold uppercase tracking-wide text-white',
          '[animation:livePulse_2s_ease-in-out_infinite]'
        )}
      >
        {label}
      </span>
    </div>
  );
}