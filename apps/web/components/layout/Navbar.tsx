'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Menu, User } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { MobileNav } from '@/components/layout/MobileNav';
import { NavbarLinks, NAV_ITEMS } from '@/components/layout/NavbarLinks';
import { NavbarSearch } from '@/components/layout/NavbarSearch';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Menu burger + logo en mobile */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            aria-label="Aller à l'accueil"
          >
            <span className="relative h-7 w-7 overflow-hidden rounded-md bg-black">
              <Image
                src="/images/logo.png"
                alt="RadioMonoko"
                fill
                sizes="28px"
                className="object-contain"
                priority
              />
            </span>
            <span className="text-xl font-bold tracking-tight text-black">
              RadioMonoco
            </span>
          </Link>
        </div>

        {/* Navbar PC */}
        <nav className="hidden items-center gap-6 md:flex lg:gap-8" aria-label="Navigation principale">
          <NavbarLinks items={NAV_ITEMS} variant="desktop" />
        </nav>

        {/* Actions des intérractions mobile et PC */}
        <div className="flex items-center gap-3">
          <NavbarSearch />

          <button
            type="button"
            className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
              3
            </span>
          </button>

          <button
            type="button"
            className={cn(
              'h-9 w-9 overflow-hidden rounded-full bg-gray-200 transition-all',
              'hover:ring-2 hover:ring-indigo-500'
            )}
            aria-label="Profil"
          >
            <span className="flex h-full w-full items-center justify-center text-gray-500">
              <User className="h-5 w-5" />
            </span>
          </button>
        </div>
      </div>

      {/* Drawer mobile */}
      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        items={NAV_ITEMS}
      />
    </header>
  );
}