import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // évite le flash de police sur certains navigateurs
});

export const metadata: Metadata = {
  title: 'RadioMonoco',
  description: 'Votre plateforme de streaming audio communautaire',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr" className="h-full">
      <body
        className={[
          inter.className,
          'min-h-full bg-white text-gray-900 antialiased',
          'flex flex-col',
        ].join(' ')}
      >
        {/* Navbar : on la garde au niveau layout pour qu’elle reste partout */}
        <Navbar />

        {/* Zone principale : elle prend tout l’espace restant */}
        <main className="flex-1">{children}</main>

        {/* TODO: footer + liens utiles (quand la landing sera complète) */}
      </body>
    </html>
  );
}