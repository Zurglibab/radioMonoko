import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  leftIcon?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', leftIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {/* Icône à gauche (optionnelle). je la rend “non cliquable” pour éviter de gêner le focus. */}
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          type={type}
          className={cn(
            // Base
            'h-10 w-full rounded-full border border-gray-200 bg-gray-100 px-3 py-2 text-sm',
            'placeholder:text-gray-500',
            // Focus / disabled
            'ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            // Si on a une icône, on décale le padding à gauche
            leftIcon ? 'pl-10' : 'pl-3',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';