'use client';

import type {
  IndexedTransactionBlockchainConfirmation,
  IndexedTransactionStatus,
} from '@/types';

interface IndexedTransactionStatusProps {
  status: IndexedTransactionStatus;
  confirmation: IndexedTransactionBlockchainConfirmation;
}

const STATUS_STYLES: Record<IndexedTransactionStatus, string> = {
  pending: 'border-blue-400/20 bg-blue-400/10 text-blue-200',
  indexed: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
  confirmed: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  failed: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
};

const CONFIRMATION_LABELS: Record<
  IndexedTransactionBlockchainConfirmation,
  string
> = {
  confirmed: 'Blockchain confirmed',
  unconfirmed: 'Awaiting confirmation',
  failed: 'Confirmation failed',
};

export function IndexedTransactionStatus({
  status,
  confirmation,
}: IndexedTransactionStatusProps) {
  return (
    <div>
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${STATUS_STYLES[status]}`}
      >
        {status}
      </span>
      <div className="mt-2 text-xs text-blue-100/55">
        {CONFIRMATION_LABELS[confirmation]}
      </div>
    </div>
  );
}
