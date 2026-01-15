'use client';
import React from 'react';
import Image from 'next/image';
import { X, Search, Bell, User } from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { NavbarLinks, NavItem } from '@/components/layout/NavbarLinks';

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
};

export function MobileNav({ open, onClose, items }: MobileNavDrawerProps) {
  if (!open) return null;

  return (
    <div className="md:hidden">
      {/* Overlay */}
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-label="Fermer le menu"
      />

      {/* Drawer */}
      <div className="fixed left-0 top-0 z-50 h-full w-[86%] max-w-[360px] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <div className="flex items-center gap-2">
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
            <span className="text-base font-bold text-black">RadioMonoco</span>
          </div>

          <button
            type="button"
            className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-4">
          {/* Search mobile */}
          <Input
            placeholder="Rechercher radio, podcast, artiste..."
            leftIcon={<Search className="h-4 w-4" />}
          />

          {/* Links */}
          <nav className="mt-5 space-y-1" aria-label="Navigation mobile">
            <NavbarLinks items={items} variant="mobile" onNavigate={onClose} />
          </nav>

          {/* Quick actions */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Bell className="h-5 w-5 text-gray-500" />
              Notifications
              <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                3
              </span>
            </button>

            <button
              type="button"
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <User className="h-5 w-5 text-gray-500" />
              Mon profil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}