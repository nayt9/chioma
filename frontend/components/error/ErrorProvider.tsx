'use client';

import React from 'react';
import { useErrorStore } from '@/store/errorStore';
import { ErrorContainer } from './ErrorContainer';

interface ErrorProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the app and renders the global error container.
 * Place this near the root layout so all errors surface in one place.
 */
export function ErrorProvider({ children }: ErrorProviderProps) {
  const errors = useErrorStore((s) => s.errors);
  const removeError = useErrorStore((s) => s.removeError);

  return (
    <>
      {children}
      <ErrorContainer errors={errors} onRemove={removeError} />
    </>
  );
}
