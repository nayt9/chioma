import type { IndexedTransaction, IndexedTransactionStats } from '@/types';

export const STELLAR_EXPLORER_TX_BASE =
  'https://stellar.expert/explorer/public/tx';

function escapeCsvValue(value: unknown): string {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export function getIndexedTransactionExplorerUrl(
  transaction: Pick<IndexedTransaction, 'transactionHash'>,
): string {
  return `${STELLAR_EXPLORER_TX_BASE}/${transaction.transactionHash}`;
}

export function formatIndexedDuration(seconds: number): string {
  if (seconds <= 0) {
    return '0s';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

export function deriveIndexedTransactionStatsFromTransactions(
  transactions: IndexedTransaction[],
): IndexedTransactionStats {
  const stats: IndexedTransactionStats = {
    total: transactions.length,
    pending: 0,
    indexed: 0,
    confirmed: 0,
    failed: 0,
    averageIndexingTimeSeconds: 0,
    successRate: 0,
  };

  const durations: number[] = [];

  transactions.forEach((transaction) => {
    stats[transaction.indexingStatus] += 1;

    if (transaction.indexedAt) {
      durations.push(
        Math.max(
          0,
          Math.round(
            (new Date(transaction.indexedAt).getTime() -
              new Date(transaction.createdAt).getTime()) /
              1000,
          ),
        ),
      );
    }
  });

  if (durations.length > 0) {
    stats.averageIndexingTimeSeconds = Math.round(
      durations.reduce((sum, value) => sum + value, 0) / durations.length,
    );
  }

  stats.successRate =
    stats.total === 0
      ? 0
      : Math.round(((stats.confirmed + stats.indexed) / stats.total) * 100);

  return stats;
}

export function buildIndexedTransactionsCsv(
  transactions: IndexedTransaction[],
): string {
  const headers = [
    'ID',
    'Transaction Hash',
    'Type',
    'Status',
    'Ledger',
    'Amount',
    'Asset Code',
    'Source Account',
    'Destination Account',
    'Retry Count',
    'Indexed At',
    'Created At',
  ];

  const rows = transactions.map((transaction) => [
    escapeCsvValue(transaction.id),
    escapeCsvValue(transaction.transactionHash),
    escapeCsvValue(transaction.transactionType),
    escapeCsvValue(transaction.indexingStatus),
    escapeCsvValue(transaction.ledger),
    escapeCsvValue(transaction.amount),
    escapeCsvValue(transaction.assetCode),
    escapeCsvValue(transaction.sourceAccount),
    escapeCsvValue(transaction.destinationAccount ?? ''),
    escapeCsvValue(transaction.retryCount),
    escapeCsvValue(transaction.indexedAt ?? ''),
    escapeCsvValue(transaction.createdAt),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
