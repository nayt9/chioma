import { describe, expect, it } from 'vitest';
import {
  buildIndexedTransactionsCsv,
  deriveIndexedTransactionStatsFromTransactions,
  formatIndexedDuration,
  getIndexedTransactionExplorerUrl,
} from '@/lib/indexed-transactions';
import type { IndexedTransaction } from '@/types';

const baseTransaction: IndexedTransaction = {
  id: 'indexed-1',
  transactionHash: 'stellar-hash-123',
  ledger: 43210,
  ledgerCloseTime: '2026-03-27T10:00:00.000Z',
  successful: true,
  transactionType: 'payment',
  sourceAccount: 'GABC12345',
  destinationAccount: 'GXYZ67890',
  amount: '1500.5',
  assetCode: 'USD',
  assetIssuer: null,
  fee: '0.00001',
  memo: 'unit test',
  memoType: 'text',
  agreementId: null,
  propertyId: null,
  paymentId: null,
  depositId: null,
  operations: [{ type: 'payment' }],
  metadata: {
    retryCount: 2,
  },
  indexed: true,
  indexedAt: '2026-03-27T10:03:00.000Z',
  createdAt: '2026-03-27T10:01:00.000Z',
  indexingStatus: 'confirmed',
  retryCount: 2,
  blockNumber: 43210,
  blockchainConfirmation: 'confirmed',
  dataIndexed: 1,
};

describe('indexed transaction helpers', () => {
  it('returns explorer URL for an indexed transaction', () => {
    expect(getIndexedTransactionExplorerUrl(baseTransaction)).toBe(
      'https://stellar.expert/explorer/public/tx/stellar-hash-123',
    );
  });

  it('derives stats and average duration from indexed transaction rows', () => {
    const stats = deriveIndexedTransactionStatsFromTransactions([
      baseTransaction,
      {
        ...baseTransaction,
        id: 'indexed-2',
        indexingStatus: 'pending',
        indexedAt: null,
      },
      {
        ...baseTransaction,
        id: 'indexed-3',
        indexingStatus: 'failed',
        indexedAt: null,
      },
    ]);

    expect(stats).toEqual({
      total: 3,
      pending: 1,
      indexed: 0,
      confirmed: 1,
      failed: 1,
      averageIndexingTimeSeconds: 120,
      successRate: 33,
    });
  });

  it('builds CSV output with escaped values', () => {
    const csv = buildIndexedTransactionsCsv([
      {
        ...baseTransaction,
        memo: 'Memo "quoted"',
      },
    ]);

    expect(csv).toContain('"stellar-hash-123"');
    expect(csv).toContain('"indexed-1"');
  });

  it('formats short and long durations', () => {
    expect(formatIndexedDuration(45)).toBe('45s');
    expect(formatIndexedDuration(125)).toBe('2m 5s');
    expect(formatIndexedDuration(3660)).toBe('1h 1m');
  });
});
