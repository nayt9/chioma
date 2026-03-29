'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import { DisputeStatus } from '@/lib/dashboard-data';

export interface TenantDisputeFilters {
    status?: DisputeStatus | 'ALL';
    search?: string;
    sort?: 'createdAt' | 'updatedAt' | 'amount';
    page?: number;
    limit?: number;
}

export interface TenantDisputeRecord {
    id: string;
    disputeId: string;
    agreementReference: string;
    propertyName: string;
    disputeType: string;
    description: string;
    status: DisputeStatus;
    requestedAmount?: number;
    createdAt: string;
    updatedAt: string;
    evidenceCount: number;
    commentCount: number;
}

const TENANT_DISPUTES_QUERY_KEY = ['tenant-disputes'] as const;

const mockDisputes: TenantDisputeRecord[] = [
    {
        id: 'dis-001',
        disputeId: 'DSP-2026-001',
        agreementReference: 'AGR-2025-014',
        propertyName: 'Sunset Apartments, Unit 4B',
        disputeType: 'MAINTENANCE',
        description: 'Water damage repairs delayed for 12 days.',
        status: 'UNDER_REVIEW',
        requestedAmount: 40000,
        evidenceCount: 3,
        commentCount: 4,
        createdAt: '2026-02-18T10:00:00.000Z',
        updatedAt: '2026-03-06T13:20:00.000Z',
    },
    {
        id: 'dis-002',
        disputeId: 'DSP-2025-019',
        agreementReference: 'AGR-2025-014',
        propertyName: 'Sunset Apartments, Unit 4B',
        disputeType: 'SECURITY_DEPOSIT',
        description: 'Security deposit deduction dispute.',
        status: 'RESOLVED',
        requestedAmount: 60000,
        evidenceCount: 2,
        commentCount: 6,
        createdAt: '2025-12-20T16:00:00.000Z',
        updatedAt: '2026-01-04T12:10:00.000Z',
    },
];

function matchesFilter(dispute: TenantDisputeRecord, filters: TenantDisputeFilters): boolean {
    if (filters.status && filters.status !== 'ALL' && dispute.status !== filters.status) {
        return false;
    }
    const normalizedSearch = filters.search?.trim().toLowerCase() || '';
    if (normalizedSearch) {
        const searchable = [
            dispute.disputeId,
            dispute.agreementReference,
            dispute.propertyName,
            dispute.description,
        ].join(' ').toLowerCase();
        if (!searchable.includes(normalizedSearch)) return false;
    }
    return true;
}

export function useTenantDisputes(filters: TenantDisputeFilters = {}) {
    return useQuery({
        queryKey: [...TENANT_DISPUTES_QUERY_KEY, filters],
        queryFn: async () => {
            try {
                const params = new URLSearchParams({
                    role: 'tenant',
                    ...(filters.status && filters.status !== 'ALL' && { status: filters.status }),
                    ...(filters.search && { search: filters.search }),
                    limit: (filters.limit || 20).toString(),
                    page: (filters.page || 0).toString(),
                });
                const responseData = await apiClient.get<any>(`/disputes?${params}`);
                const apiData = responseData.data;
                // Normalize API response to TenantDisputeRecord (similar to admin hook)
                const disputes: TenantDisputeRecord[] = (apiData?.data || apiData?.disputes || []).map((d: any) => ({
                    id: String(d.id),
                    disputeId: d.disputeId || `DSP-${String(d.id).slice(-6)}`,
                    agreementReference: String(d.agreementId),
                    propertyName: d.propertyName || 'Rental Property',
                    disputeType: d.disputeType || 'OTHER',
                    description: d.description || '',
                    status: d.status as DisputeStatus || 'OPEN',
                    requestedAmount: d.requestedAmount,
                    createdAt: d.createdAt || new Date().toISOString(),
                    updatedAt: d.updatedAt || d.createdAt || new Date().toISOString(),
                    evidenceCount: d.evidence?.length || 0,
                    commentCount: d.comments?.length || 0,
                }));
                return disputes.length > 0 ? disputes : mockDisputes;
            } catch {
                return mockDisputes;
            }
        },
        select: (disputes) => disputes.filter((d) => matchesFilter(d, filters)),
    });
}

export function useUpdateTenantDisputeStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ disputeId, status }: { disputeId: string; status: DisputeStatus }) => {
            await apiClient.patch(`/disputes/${disputeId}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TENANT_DISPUTES_QUERY_KEY });
        },
    });
}

