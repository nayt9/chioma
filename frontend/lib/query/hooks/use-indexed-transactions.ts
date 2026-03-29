'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '../keys';
import type {
  IndexedTransaction,
  IndexedTransactionStats,
  IndexedTransactionStatus,
  PaginatedResponse,
} from '@/types';

export interface IndexedTransactionListParams {
  page?: number;
  limit?: number;
  status?: IndexedTransactionStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

function buildQueryString(params: IndexedTransactionListParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export function useIndexedTransactions(
  params: IndexedTransactionListParams = {},
) {
  return useQuery({
    queryKey: queryKeys.indexedTransactions.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<
        PaginatedResponse<IndexedTransaction>
      >(`/indexed-transactions${buildQueryString(params)}`);
      return data;
    },
    refetchInterval: 15000,
  });
}

export function useIndexedTransaction(id: string | null) {
  return useQuery({
    queryKey: queryKeys.indexedTransactions.detail(id ?? ''),
    queryFn: async () => {
      const { data } = await apiClient.get<IndexedTransaction>(
        `/indexed-transactions/${id}`,
      );
      return data;
    },
    enabled: Boolean(id),
    refetchInterval: 15000,
  });
}

export function useIndexedTransactionStats() {
  return useQuery({
    queryKey: queryKeys.indexedTransactions.stats(),
    queryFn: async () => {
      const { data } = await apiClient.get<IndexedTransactionStats>(
        '/indexed-transactions/stats',
      );
      return data;
    },
    refetchInterval: 15000,
  });
}
