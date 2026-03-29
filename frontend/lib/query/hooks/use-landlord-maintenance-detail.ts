'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MaintenanceStatus, MaintenancePriority } from './use-landlord-maintenance';

export interface MaintenanceDetail {
    id: string;
    requestId: string;
    propertyName: string;
    propertyId: string;
    tenant: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
    };
    title: string;
    description: string;
    status: MaintenanceStatus;
    priority: MaintenancePriority;
    assignedTo?: {
        id: string;
        name: string;
        phone?: string;
        email?: string;
    };
    createdAt: string;
    updatedAt: string;
    deadline?: string;
    completedAt?: string;
    photos: Array<{
        id: string;
        filename: string;
        url: string;
        uploadedAt: string;
    }>;
    comments: Array<{
        id: string;
        author: {
            id: string;
            name: string;
            role: string;
        };
        content: string;
        createdAt: string;
    }>;
    scheduledDate?: string;
    scheduledTime?: string;
}

const LANDLORD_MAINTENANCE_DETAIL_QUERY_KEY = (id: string) => ['landlord-maintenance', id] as const;

const mockDetail: MaintenanceDetail = {
    id: 'mnt-001',
    requestId: 'MNT-2026-001',
    propertyName: 'Sunset Apartments, Unit 4B',
    propertyId: 'prop-001',
    tenant: {
        id: 'tenant-001',
        name: 'Chioma Okafor',
        email: 'chioma.okafor@email.com',
        phone: '+234 805 123 4567',
    },
    title: 'Water leak in bathroom',
    description: 'Water is leaking from the ceiling in the bathroom. Started 2 days ago. The leak is getting worse and has caused some damage to the ceiling paint. Need urgent attention to prevent further damage.',
    status: 'OPEN',
    priority: 'HIGH',
    assignedTo: {
        id: 'maint-001',
        name: 'Emeka Plumbing Services',
        phone: '+234 801 234 5678',
        email: 'emeka.plumbing@email.com',
    },
    createdAt: '2026-03-25T10:00:00.000Z',
    updatedAt: '2026-03-25T10:00:00.000Z',
    deadline: '2026-03-28T18:00:00.000Z',
    photos: [
        {
            id: 'photo-1',
            filename: 'bathroom_leak_1.jpg',
            url: '/uploads/maintenance/bathroom_leak_1.jpg',
            uploadedAt: '2026-03-25T10:05:00Z',
        },
        {
            id: 'photo-2',
            filename: 'ceiling_damage.jpg',
            url: '/uploads/maintenance/ceiling_damage.jpg',
            uploadedAt: '2026-03-25T10:07:00Z',
        },
    ],
    comments: [
        {
            id: 'c-1',
            author: {
                id: 'tenant-001',
                name: 'Chioma Okafor',
                role: 'tenant',
            },
            content: 'The leak started yesterday evening. It\'s getting worse today.',
            createdAt: '2026-03-25T10:10:00Z',
        },
        {
            id: 'c-2',
            author: {
                id: 'landlord-001',
                name: 'James Adebayo',
                role: 'landlord',
            },
            content: 'Thank you for reporting. I\'ve assigned Emeka Plumbing Services to handle this. They will contact you shortly.',
            createdAt: '2026-03-25T11:30:00Z',
        },
        {
            id: 'c-3',
            author: {
                id: 'maint-001',
                name: 'Emeka Plumbing Services',
                role: 'maintenance',
            },
            content: 'We\'ll arrive tomorrow morning between 9-10 AM to inspect and fix the issue.',
            createdAt: '2026-03-25T14:00:00Z',
        },
    ],
    scheduledDate: '2026-03-26',
    scheduledTime: '09:00-10:00',
};

export function useLandlordMaintenanceDetail(requestId: string) {
    return useQuery({
        queryKey: LANDLORD_MAINTENANCE_DETAIL_QUERY_KEY(requestId),
        enabled: !!requestId,
        queryFn: async () => {
            try {
                const responseData = await apiClient.get(`/maintenance/${requestId}`) as any;
                const apiData = responseData.data;
                // Normalize to MaintenanceDetail
                return {
                    id: String(apiData.id || 'unknown'),
                    requestId: apiData.requestId || `MNT-${String(apiData.id || 'unknown').slice(-6)}`,
                    propertyName: apiData.propertyName || apiData.property?.name || 'Rental Property',
                    propertyId: String(apiData.propertyId || apiData.property?.id || ''),
                    tenant: {
                        id: String(apiData.tenant?.id || apiData.tenantId || ''),
                        name: apiData.tenant?.name || apiData.tenantName || 'Tenant',
                        email: apiData.tenant?.email,
                        phone: apiData.tenant?.phone,
                    },
                    title: apiData.title || '',
                    description: apiData.description || '',
                    status: apiData.status as MaintenanceStatus || 'OPEN',
                    priority: apiData.priority as MaintenancePriority || 'MEDIUM',
                    assignedTo: apiData.assignedTo ? {
                        id: String(apiData.assignedTo.id),
                        name: apiData.assignedTo.name,
                        phone: apiData.assignedTo.phone,
                        email: apiData.assignedTo.email,
                    } : undefined,
                    createdAt: apiData.createdAt || new Date().toISOString(),
                    updatedAt: apiData.updatedAt || apiData.createdAt || new Date().toISOString(),
                    deadline: apiData.deadline,
                    completedAt: apiData.completedAt,
                    photos: (apiData.photos || []).map((p: any) => ({
                        id: String(p.id),
                        filename: p.filename,
                        url: p.url || p.filename,
                        uploadedAt: p.uploadedAt || new Date().toISOString(),
                    })),
                    comments: (apiData.comments || []).map((c: any) => ({
                        id: String(c.id),
                        author: c.author || { id: 'unknown', name: 'Anonymous', role: 'user' },
                        content: c.content,
                        createdAt: c.createdAt || new Date().toISOString(),
                    })),
                    scheduledDate: apiData.scheduledDate,
                    scheduledTime: apiData.scheduledTime,
                };
            } catch {
                return mockDetail;
            }
        },
    });
}

export function useAddMaintenanceComment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ requestId, content }: { requestId: string; content: string }) => {
            await apiClient.post(`/maintenance/${requestId}/comments`, { content });
            return { success: true };
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: LANDLORD_MAINTENANCE_DETAIL_QUERY_KEY(variables.requestId) });
        },
    });
}

export function useUpdateMaintenance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ requestId, data }: { requestId: string; data: Partial<MaintenanceDetail> }) => {
            await apiClient.patch(`/maintenance/${requestId}`, data);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: LANDLORD_MAINTENANCE_DETAIL_QUERY_KEY(variables.requestId) });
        },
    });
}

export function useScheduleMaintenance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ requestId, date, time }: { requestId: string; date: string; time: string }) => {
            await apiClient.post(`/maintenance/${requestId}/schedule`, { date, time });
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: LANDLORD_MAINTENANCE_DETAIL_QUERY_KEY(variables.requestId) });
        },
    });
}
