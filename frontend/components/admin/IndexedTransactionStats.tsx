'use client';

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  ShieldCheck,
} from 'lucide-react';
import { formatIndexedDuration } from '@/lib/indexed-transactions';
import type { IndexedTransactionStats as IndexedTransactionStatsType } from '@/types';

interface IndexedTransactionStatsProps {
  stats?: IndexedTransactionStatsType;
  isLoading: boolean;
}

const STAT_STYLES = {
  blue: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
  emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  amber: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  rose: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
  violet: 'border-violet-400/20 bg-violet-400/10 text-violet-200',
  slate: 'border-white/10 bg-white/5 text-blue-100',
} as const;

export function IndexedTransactionStats({
  stats,
  isLoading,
}: IndexedTransactionStatsProps) {
  const cards = [
    {
      title: 'Total indexed flows',
      value: stats?.total ?? 0,
      caption: 'Transactions seen by the indexer',
      icon: Activity,
      tone: 'blue',
    },
    {
      title: 'Pending indexing',
      value: stats?.pending ?? 0,
      caption: 'Waiting to be processed by the indexer',
      icon: Clock3,
      tone: 'amber',
    },
    {
      title: 'Indexed records',
      value: stats?.indexed ?? 0,
      caption: 'Stored locally and awaiting confirmation',
      icon: DatabaseZap,
      tone: 'violet',
    },
    {
      title: 'Confirmed on chain',
      value: stats?.confirmed ?? 0,
      caption: 'Indexed transactions with successful chain confirmation',
      icon: ShieldCheck,
      tone: 'emerald',
    },
    {
      title: 'Failed indexing',
      value: stats?.failed ?? 0,
      caption: 'Transactions that need retry or investigation',
      icon: AlertTriangle,
      tone: 'rose',
    },
    {
      title: 'Average indexing time',
      value: formatIndexedDuration(stats?.averageIndexingTimeSeconds ?? 0),
      caption: `Success rate ${stats?.successRate ?? 0}%`,
      icon: CheckCircle2,
      tone: 'slate',
    },
  ] as const;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.title}
            className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/7"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`rounded-2xl border p-3 ${STAT_STYLES[card.tone]}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-100/50">
                Live
              </span>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-100/45">
                {card.title}
              </p>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {isLoading ? (
                  <span className="inline-block h-9 w-28 animate-pulse rounded-xl bg-white/10" />
                ) : (
                  card.value
                )}
              </div>
              <p className="mt-2 text-sm leading-6 text-blue-100/55">
                {card.caption}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
