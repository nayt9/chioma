'use client';

import React from 'react';
import { ErrorToast } from './ErrorToast';
import type { GlobalError } from '@/store/errorStore';

interface ErrorContainerProps {
  errors: GlobalError[];
  onRemove: (id: string) => void;
}

export function ErrorContainer({ errors, onRemove }: ErrorContainerProps) {
  if (errors.length === 0) return null;

  return (
    <div
      aria-label="Error notifications"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
    >
      {errors.map((error) => (
        <div key={error.id} className="pointer-events-auto">
          <ErrorToast error={error} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
