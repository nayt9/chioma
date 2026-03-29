'use client';

import React from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
} from '@tanstack/react-table';
import Link from 'next/link';
import { ChevronDown, Search, Filter, Loader2, Eye, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DisputeStatus } from '@/lib/dashboard-data';
import { useTenantDisputes, TenantDisputeRecord } from '@/lib/query/hooks/use-tenant-disputes';
import { format, formatDistanceToNow } from 'date-fns';

interface DisputesListProps {
    className?: string;
}

export function DisputesList({ className = '' }: DisputesListProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [statusFilter, setStatusFilter] = React.useState<DisputeStatus | 'ALL'>('ALL');
    const [globalFilter, setGlobalFilter] = React.useState('');

    const { data: disputes = [], isLoading, error } = useTenantDisputes({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: globalFilter,
    });

    const columns = React.useMemo<ColumnDef<TenantDisputeRecord>[]>(
        () => [
            {
                accessorKey: 'disputeId',
                header: 'Dispute ID',
                cell: ({ row }) => <div className="font-mono text-sm font-semibold">{row.getValue('disputeId')}</div>,
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const status = row.getValue('status') as DisputeStatus;
                    return (
                        <Badge variant={status === 'RESOLVED' ? 'default' : status === 'OPEN' ? 'destructive' : 'secondary'}>
                            {status.replace('_', ' ').toUpperCase()}
                        </Badge>
                    );
                },
                filterFn: (row, _, value) => row.getValue('status') === value,
            },
            {
                accessorKey: 'propertyName',
                header: 'Property',
                cell: ({ row }) => <div className="font-medium">{row.getValue('propertyName')}</div>,
            },
            {
                accessorKey: 'disputeType',
                header: 'Type',
                cell: ({ row }) => <span className="text-xs uppercase tracking-wider text-neutral-500">{row.getValue('disputeType')}</span>,
            },
            {
                accessorKey: 'description',
                header: 'Summary',
                cell: ({ row }) => (
                    <div className="max-w-md truncate" title={row.getValue('description')}>
                        {row.getValue('description')}
                    </div>
                ),
            },
            {
                accessorKey: 'requestedAmount',
                header: 'Amount',
                cell: ({ row }) => {
                    const amount = row.getValue('requestedAmount') as number | undefined;
                    return amount ? (
                        <div className="font-mono text-lg font-bold text-emerald-600">₦{amount.toLocaleString()}</div>
                    ) : (
                        <span className="text-sm text-neutral-500">-</span>
                    );
                },
            },
            {
                accessorKey: 'createdAt',
                header: 'Created',
                cell: ({ row }) => formatDistanceToNow(new Date(row.getValue('createdAt')), { addSuffix: true }),
                sortingFn: 'datetime',
            },
            {
                accessorKey: 'updatedAt',
                header: 'Updated',
                cell: ({ row }) => formatDistanceToNow(new Date(row.getValue('updatedAt')), { addSuffix: true }),
                sortingFn: 'datetime',
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Link href={`/tenant/disputes/${row.original.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                        </Link>
                    </Button>
                ),
            },
        ],
        []
    );

    const table = useReactTable({
        data: disputes,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
    });

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-neutral-200 rounded-3xl">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Failed to load disputes</h3>
                <p className="text-neutral-500 mb-6 max-w-sm">There was an issue fetching your disputes. Please refresh the page.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                            placeholder="Search disputes..."
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(String(e.target.value))}
                            className="pl-10 w-full"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DisputeStatus | 'ALL')}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                            <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <span>{disputes.length} dispute{disputes.length !== 1 ? 's' : ''}</span>
                    <Filter className="w-4 h-4" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mr-3" />
                        <span className="text-neutral-500">Loading your disputes...</span>
                    </div>
                ) : disputes.length === 0 ? (
                    <div className="p-16 text-center border-2 border-dashed border-neutral-200 rounded-3xl">
                        <Flag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2">No disputes yet</h3>
                        <p className="text-neutral-500 mb-6">All your rental agreements are running smoothly.</p>
                        <Button variant="outline">File a Dispute</Button>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-5 border-b border-neutral-50 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-neutral-900">Your Disputes</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id} className="text-neutral-500 font-semibold uppercase text-xs tracking-wider">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id} className="hover:bg-neutral-50/50 border-b border-neutral-50 transition-colors">
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {/* Pagination */}
                        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-neutral-500">
                                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
