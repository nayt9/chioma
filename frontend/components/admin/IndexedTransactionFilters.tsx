'use client';

import { Calendar, Filter, Search, X } from 'lucide-react';
import type { IndexedTransactionStatus } from '@/types';

export interface IndexedTransactionFiltersValue {
  page: number;
  limit: number;
  search: string;
  status: IndexedTransactionStatus | '';
  startDate: string;
  endDate: string;
}

interface IndexedTransactionFiltersProps {
  filters: IndexedTransactionFiltersValue;
  hasFilters: boolean;
  resultCount: number;
  onChange: (
    field: keyof Omit<IndexedTransactionFiltersValue, 'page' | 'limit'>,
    value: string,
  ) => void;
  onClear: () => void;
}

export function IndexedTransactionFilters({
  filters,
  hasFilters,
  resultCount,
  onChange,
  onClear,
}: IndexedTransactionFiltersProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Filter className="h-5 w-5 text-cyan-300" />
            Filter Indexed Activity
          </h2>
          <p className="mt-1 text-sm text-blue-100/60">
            Narrow indexed blockchain records by status, date window, and
            transaction ID.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100/60">
            {resultCount} visible
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100/80 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="group relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200/35 transition group-focus-within:text-cyan-300" />
          <input
            type="text"
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Search ID, hash, account..."
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-blue-100/30 focus:border-cyan-300/60 focus:bg-slate-950/85"
          />
        </label>

        <select
          value={filters.status}
          onChange={(event) => onChange('status', event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:bg-slate-950/85"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="indexed">Indexed</option>
          <option value="confirmed">Confirmed</option>
          <option value="failed">Failed</option>
        </select>

        <label className="group relative">
          <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200/35 transition group-focus-within:text-cyan-300" />
          <input
            type="date"
            value={filters.startDate}
            onChange={(event) => onChange('startDate', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:bg-slate-950/85 [color-scheme:dark]"
          />
        </label>

        <label className="group relative">
          <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200/35 transition group-focus-within:text-cyan-300" />
          <input
            type="date"
            value={filters.endDate}
            onChange={(event) => onChange('endDate', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:bg-slate-950/85 [color-scheme:dark]"
          />
        </label>
      </div>
    </section>
  );
}
