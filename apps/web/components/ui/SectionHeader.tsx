import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  href?: string;
}

export function SectionHeader({ title, icon, href = '#' }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {icon && <span className="text-gray-900">{icon}</span>}
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <Link 
        href={href} 
        className="text-sm font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
      >
        Voir tout
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}