'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';

type NavbarSearchProps = {
  className?: string;
};

export function NavbarSearch({ className }: NavbarSearchProps) {
  return (
    <div className={cn('hidden w-[320px] lg:block', className)}>
      <Input
        placeholder="Rechercher radio, podcast, artiste..."
        leftIcon={<Search className="h-4 w-4" />}
      />
    </div>
  );
}