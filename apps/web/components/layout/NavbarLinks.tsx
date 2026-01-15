import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

export type NavItem = {
  label: string;
  href: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Accueil', href: '/' },
  { label: 'Découvrir', href: '/feed' },
  { label: 'Ma Bibliothèque', href: '/library' },
  { label: 'Listes', href: '/lists/my-lists' },
  { label: 'Communauté', href: '/groups' },
];

function isRouteActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavbarLinksProps = {
  items: NavItem[];
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
};

export function NavbarLinks({
  items,
  variant = 'desktop',
  onNavigate,
}: NavbarLinksProps) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const active = isRouteActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              variant === 'desktop'
                ? cn(
                    'text-sm font-medium transition-colors hover:text-black',
                    active ? 'text-black' : 'text-gray-500'
                  )
                : cn(
                    'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-gray-100 text-black'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                  )
            )}
            aria-current={active ? 'page' : undefined}
          >
            <span>{item.label}</span>

            {variant === 'mobile' && active && (
              <span className="text-[10px] font-bold text-gray-500">ACTIF</span>
            )}
          </Link>
        );
      })}
    </>
  );
}