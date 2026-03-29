'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface TenantReviewFilters {
    rating?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface TenantReviewRecord {
    id: string;
    reviewId: string;
    target: string;
    targetRole: 'LANDLORD' | 'AGENT';
    propertyName: string;
    rating: number;
    comment: string;
    status: 'PUBLISHED' | 'PENDING' | 'FLAGGED';
    context: 'LEASE' | 'MAINTENANCE';
    createdAt: string;
    updatedAt: string;
    responseCount: number;
}

const TENANT_REVIEWS_QUERY_KEY = ['tenant-reviews'] as const;

const mockReviews: TenantReviewRecord[] = [
    {
        id: 'rev-001',
        reviewId: 'RVW-2026-001',
        target: 'James Adebayo',
        targetRole: 'LANDLORD',
        propertyName: 'Sunset Apartments, Unit 4B',
        rating: 5,
        comment: 'Great landlord! Quick communication and repairs handled promptly.',
        status: 'PUBLISHED',
        context: 'LEASE',
        responseCount: 1,
        createdAt: '2026-02-20T12:30:00Z',
        updatedAt: '2026-02-20T12:30:00Z',
    },
    {
        id: 'rev-002',
        reviewId: 'RVW-2026-002',
        target: 'Facility Ops Team',
        targetRole: 'AGENT',
        propertyName: 'Sunset Apartments, Unit 4B',
        rating: 4,
        comment: 'Maintenance response good after escalation.',
        status: 'PUBLISHED',
        context: 'MAINTENANCE',
        responseCount: 0,
        createdAt: '2026-01-10T09:00:00Z',
        updatedAt: '2026-01-10T09:00:00Z',
    },
];

export function useTenantReviews(filters: TenantReviewFilters = {}) {
    return useQuery({
        queryKey: [...TENANT_REVIEWS_QUERY_KEY, filters],
        queryFn: async () => {
            try {
                const params = new URLSearchParams({
                    role: 'tenant',
                    ...(filters.rating && { rating: filters.rating }),
                    ...(filters.status && { status: filters.status }),
                    ...(filters.search && { search: filters.search }),
                    limit: (filters.limit || 20).toString(),
                    page: (filters.page || 0).toString(),
                });
                const responseData = await apiClient.get(`/reviews?${params}`);
                const apiData = responseData.data;
                const reviews: TenantReviewRecord[] = (apiData?.data || apiData?.reviews || []).map((r: any) => ({
                    id: String(r.id),
                    reviewId: r.reviewId || `RVW-${String(r.id).slice(-6)}`,
                    target: r.targetName || r.reviewee?.name || 'Target',
                    targetRole: r.targetRole || 'LANDLORD',
                    propertyName: r.propertyName || 'Property',
                    rating: r.rating || 5,
                    comment: r.comment || r.content || '',
                    status: r.status || 'PUBLISHED',
                    context: r.context || 'LEASE',
                    createdAt: r.createdAt || new Date().toISOString(),
                    updatedAt: r.updatedAt || r.createdAt || new Date().toISOString(),
                    responseCount: r.responses?.length || 0,
                }));
                return reviews.length > 0 ? reviews : mockReviews;
            } catch {
                return mockReviews;
            }
        },
    });
}

export function useTenantReview(id: string) {
    return useQuery({
        queryKey: ['tenant-review', id],
        enabled: !!id,
        queryFn: async () => {
            try {
                const responseData = await apiClient.get(`/reviews/${id}`);
                const apiData: any = responseData.data;
                return {
                    id: String(apiData.id),
                    reviewId: apiData.reviewId || `RVW-${String(apiData.id).slice(-6)}`,
                    target: apiData.targetName || apiData.reviewee?.name || 'Target',
                    targetRole: apiData.targetRole || 'LANDLORD',
                    propertyName: apiData.propertyName || 'Property',
                    rating: apiData.rating || 5,
                    comment: apiData.comment || '',
                    status: apiData.status || 'PUBLISHED',
                    context: apiData.context || 'LEASE',
                    createdAt: apiData.createdAt || new Date().toISOString(),
                    updatedAt: apiData.updatedAt || apiData.createdAt || new Date().toISOString(),
                };
            } catch {
                return mockReviews[0];
            }
        },
    });
}

export function useCreateReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { rating: number; comment: string; targetId: string; context: string }) => {
            await apiClient.post('/reviews', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TENANT_REVIEWS_QUERY_KEY });
        },
    });
}

export function useUpdateReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: { rating: number; comment: string } }) => {
            await apiClient.put(`/reviews/${id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TENANT_REVIEWS_QUERY_KEY });
        },
    });
}

export function useDeleteReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/reviews/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TENANT_REVIEWS_QUERY_KEY });
        },
    });
}
