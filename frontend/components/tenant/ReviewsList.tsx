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
import { Search, Filter, Loader2, Star, Edit3, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StarRating } from '@/components/common/StarRating';
import { useTenantReviews, TenantReviewRecord } from '@/lib/query/hooks/use-tenant-reviews';
import { format, formatDistanceToNow } from 'date-fns';

interface ReviewsListProps {
    className?: string;
}

export function ReviewsList({ className = '' }: ReviewsListProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [ratingFilter, setRatingFilter] = React.useState<string>('ALL');
    const [globalFilter, setGlobalFilter] = React.useState('');

    const { data: reviews = [], isLoading, error } = useTenantReviews({
        rating: ratingFilter === 'ALL' ? undefined : ratingFilter,
        search: globalFilter,
    });

    const columns = React.useMemo<ColumnDef<TenantReviewRecord>[]>(
        () => [
            {
                accessorKey: 'target',
                header: 'Reviewed',
                cell: ({ row }) => <div className="font-medium">{row.getValue('target')}</div>,
            },
            {
                accessorKey: 'propertyName',
                header: 'Property',
                cell: ({ row }) => <div className="text-sm">{row.getValue('propertyName')}</div>,
            },
            {
                accessorKey: 'rating',
                header: 'Rating',
                cell: ({ row }) => <StarRating value={row.getValue('rating')} readonly />,
                sortingFn: 'alphanumeric',
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const status = row.getValue('status');
                    return (
                        <Badge variant={status === 'PUBLISHED' ? 'default' : 'secondary'}>
                            {status}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'comment',
                header: 'Review',
                cell: ({ row }) => (
                    <div className="max-w-md truncate" title={row.getValue('comment')}>
                        {row.getValue('comment')}
                    </div>
                ),
            },
            {
                accessorKey: 'createdAt',
                header: 'Date',
                cell: ({ row }) => formatDistanceToNow(new Date(row.getValue('createdAt')), { addSuffix: true }),
                sortingFn: 'datetime',
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <div className="flex gap-1">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={`/tenant/reviews/${row.original.id}`}>
                                <Edit3 className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ),
            },
        ],
        []
    );

    const table = useReactTable({
        data: reviews,
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
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Failed to load reviews</h3>
                <p className="text-neutral-500 mb-6 max-w-sm">There was an issue fetching your reviews. Please refresh.</p>
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
                            placeholder="Search reviews..."
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(String(e.target.value))}
                            className="pl-10 w-full"
                        />
                    </div>
                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                        <SelectTrigger className="w-full sm:w-32">
                            <SelectValue placeholder="All Ratings" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Ratings</SelectItem>
                            <SelectItem value="5">5 Stars</SelectItem>
                            <SelectItem value="4">4 Stars</SelectItem>
                            <SelectItem value="3">3 Stars</SelectItem>
                            <SelectItem value="2">2 Stars</SelectItem>
                            <SelectItem value="1">1 Star</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <span>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                    <Filter className="w-4 h-4" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mr-3" />
                        <span className="text-neutral-500">Loading your reviews...</span>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="p-16 text-center border-2 border-dashed border-neutral-200 rounded-3xl">
                        <Star className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2">No reviews yet</h3>
                        <p className="text-neutral-500 mb-6">Your review history will appear here.</p>
                        <Button variant="outline" asChild>
                            <Link href="/tenant/reviews/new">
                                Write Your First Review
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-5 border-b border-neutral-50">
                            <h3 className="text-lg font-semibold text-neutral-900">Your Reviews</h3>
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
