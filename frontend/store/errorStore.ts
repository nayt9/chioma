'use client';

import { create } from 'zustand';
import { withMiddleware } from './middleware';

// ─── Types ───────────────────────────────────────────────────────────────────

export type GlobalErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export type GlobalErrorCategory =
  | 'validation'
  | 'api'
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'server'
  | 'unknown';

export interface GlobalError {
  id: string;
  message: string;
  category: GlobalErrorCategory;
  severity: GlobalErrorSeverity;
  /** Auto-dismiss after ms. undefined = sticky. */
  autoDismissMs?: number;
  /** Original error for debugging */
  cause?: unknown;
  timestamp: number;
}

interface ErrorState {
  errors: GlobalError[];
}

interface ErrorActions {
  addError: (error: Omit<GlobalError, 'id' | 'timestamp'>) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
  getErrors: () => GlobalError[];
}

export type ErrorStore = ErrorState & ErrorActions;

// ─── Helpers ─────────────────────────────────────────────────────────────────

let errorCounter = 0;

function nextErrorId(): string {
  errorCounter += 1;
  return `err-${Date.now()}-${errorCounter}`;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useErrorStore = create<ErrorStore>()(
  withMiddleware(
    (set, get) => ({
      errors: [],

      addError: (error) => {
        const id = nextErrorId();
        set((state) => {
          state.errors.push({ ...error, id, timestamp: Date.now() });
        });
        return id;
      },

      removeError: (id) => {
        set((state) => {
          state.errors = state.errors.filter((e) => e.id !== id);
        });
      },

      clearErrors: () => {
        set((state) => {
          state.errors = [];
        });
      },

      getErrors: () => get().errors,
    }),
    'errors',
  ),
);

// ─── Convenience hook ────────────────────────────────────────────────────────

export function useError() {
  const { addError, removeError, clearErrors } = useErrorStore();
  return { addError, removeError, clearErrors };
}
