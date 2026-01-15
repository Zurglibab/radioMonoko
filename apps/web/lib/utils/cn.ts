import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Petit helper pour combiner des classes Tailwind sans se prendre la tête.
// clsx gère les conditions, twMerge évite les classes en doublon.
export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}