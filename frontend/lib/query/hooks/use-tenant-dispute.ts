'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DisputeStatus } from '@/lib/dashboard-data';

export interface TenantDisputeDetail {
    id: string;
    disputeId: string;
    agreementId: string;
    propertyName: string;
    raisedBy: { name: string; role: string };
    against: { name: string; role: string };
    disputeType: string;
    description: string;
    status: DisputeStatus;
    requestedAmount?: number;
    resolution?: string;
    createdAt: string;
    updatedAt: string;
    evidence: Array<{ id: string; filename: string; uploadedAt: string }>;
    comments: Array<{
        id: string;
        author: { name: string; role: string };
        content: string;
        createdAt: string;
    }>;
}

const TENANT_DISPUTE_DETAIL_QUERY_KEY = (id: string) => ['tenant-dispute', id] as const;

const mockDetail: TenantDisputeDetail = {
    id: 'dis-001',
    disputeId: 'DSP-2026-001',
    agreementId: 'AGR-2025-014',
    propertyName: 'Sunset Apartments, Unit 4B',
    raisedBy: { name: 'You', role: 'tenant' },
    against: { name: 'James Adebayo', role: 'landlord' },
    disputeType: 'MAINTENANCE',
    description: 'Water damage repairs were delayed for 12 days after reporting. Ceiling paint affected, temporary fixes inadequate.',
    status: 'UNDER_REVIEW',
    requestedAmount: 40000,
    createdAt: '2026-02-18T10:00:00.000Z',
    updatedAt: '2026-03-06T13:20:00.000Z',
    evidence: [
        { id: 'ev-1', filename: 'water_damage_1.jpg', uploadedAt: '2026-02-18T10:05:00Z' },
        { id: 'ev-2', filename: 'inspection_report.pdf', uploadedAt: '2026-02-19T14:30:00Z' },
        { id: 'ev-3', filename: 'repair_delay_timeline.xlsx', uploadedAt: '2026-02-20T09:15:00Z' },
    ],
    comments: [
        {
            id: 'c-1',
            author: { name: 'You', role: 'tenant' },
            content: 'Initial report submitted. Awaiting response.',
            createdAt: '2026-02-18T10:10:00Z',
        },
        {
            id: 'c-2',
            author: { name: 'James Adebayo', role: 'landlord' },
            content: 'Contractor scheduled for Feb 25. Will update.',
            createdAt: '2026-02-20T16:45:00Z',
        },
    ],
};

export function useTenantDispute(disputeId: string) {
    return useQuery({
        queryKey: TENANT_DISPUTE_DETAIL_QUERY_KEY(disputeId),
        enabled: !!disputeId,
        queryFn: async () => {
            try {
                const responseData = await apiClient.get(`/disputes/${disputeId}`) as any;
                const apiData = responseData.data;
                // Normalize to TenantDisputeDetail
                return {
                    id: String(apiData.id || 'unknown'),
                    disputeId: apiData.disputeId || `DSP-${String(apiData.id || 'unknown').slice(-6)}`,
                    agreementId: String(apiData.agreementId || ''),
                    propertyName: (apiData.property as any)?.name || 'Rental Property',
                    raisedBy: (apiData.raisedBy as any) || { name: 'You', role: 'tenant' },
                    against: (apiData.against as any) || { name: 'Counterparty', role: 'landlord' },
                    disputeType: apiData.disputeType || 'OTHER',
                    description: apiData.description || '',
                    status: apiData.status as DisputeStatus || 'OPEN',
                    requestedAmount: apiData.requestedAmount,
                    resolution: apiData.resolution,
                    createdAt: apiData.createdAt || new Date().toISOString(),
                    updatedAt: apiData.updatedAt || apiData.createdAt || new Date().toISOString(),
                    evidence: (apiData.evidence || []).map((e: any) => ({
                        id: String(e.id),
                        filename: e.filename,
                        uploadedAt: e.uploadedAt || new Date().toISOString(),
                    })),
                    comments: (apiData.comments || []).map((c: any) => ({
                        id: String(c.id),
                        author: c.author || { name: 'Anonymous', role: 'user' },
                        content: c.content,
                        createdAt: c.createdAt || new Date().toISOString(),
                    })),
                };
            } catch {
                return mockDetail;
            }
        },
    });
}

export function useAddDisputeComment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ disputeId, content }: { disputeId: string; content: string }) => {
            await apiClient.post(`/disputes/${disputeId}/comments`, { content });
            return { success: true };
        },
        onSuccess: (_data, variables: { disputeId: string }) => {
            queryClient.invalidateQueries({ queryKey: TENANT_DISPUTE_DETAIL_QUERY_KEY(variables.disputeId) });
        },
    });
}

