'use client';

import React, { useState } from 'react';
import { Calendar, FileText, MessageCircle, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useTenantDispute, useAddDisputeComment } from '@/lib/query/hooks/use-tenant-dispute';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/store/authStore';

interface DisputeDetailProps {
    disputeId: string;
    className?: string;
}

export function DisputeDetail({ disputeId, className = '' }: DisputeDetailProps) {
    const { user } = useAuthStore();
    const [newComment, setNewComment] = useState('');
    const { data: dispute, isLoading, error } = useTenantDispute(disputeId);
    const addCommentMutation = useAddDisputeComment();

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !dispute || addCommentMutation.isPending) return;

        addCommentMutation.mutate(
            { disputeId: dispute.id, content: newComment.trim() },
            {
                onSuccess: () => setNewComment(''),
            }
        );
    };

    if (isLoading) {
        return (
            <div className={`bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 p-8 ${className}`}>
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mr-3" />
                    <span className="text-neutral-500">Loading dispute details...</span>
                </div>
            </div>
        );
    }

    if (error || !dispute) {
        return (
            <div className={`bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 p-8 ${className}`}>
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-neutral-200 rounded-3xl">
                    <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">Dispute not found</h3>
                    <p className="text-neutral-500 mb-6">The dispute details could not be loaded.</p>
                </div>
            </div>
        );
    }

    const statusConfig = {
        OPEN: { color: 'bg-amber-50 text-amber-800 border-amber-200', icon: Clock },
        'UNDER_REVIEW': { color: 'bg-blue-50 text-blue-800 border-blue-200', icon: Clock },
        RESOLVED: { color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
        REJECTED: { color: 'bg-red-50 text-red-800 border-red-200', icon: XCircle },
        WITHDRAWN: { color: 'bg-neutral-50 text-neutral-600 border-neutral-200', icon: XCircle },
    } as const;

    const StatusIcon = statusConfig[dispute.status]?.icon || Clock;

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-50 to-neutral-50 rounded-3xl p-8 border border-neutral-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border">
                                <StatusIcon size={20} className={`text-blue-500 ${statusConfig[dispute.status]?.color ? '' : ''}`} />
                            </div>
                            <div>
                                <Badge className={`font-semibold ${statusConfig[dispute.status]?.color || 'bg-neutral-100 text-neutral-800'}`}>
                                    {dispute.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                                    <Calendar size={14} />
                                    <span>Started {formatDistanceToNow(new Date(dispute.createdAt), { addSuffix: true })}</span>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 tracking-tight mb-3">
                            {dispute.disputeId} - {dispute.disputeType.replace('_', ' ')}
                        </h1>
                        <p className="text-lg text-neutral-700 leading-relaxed max-w-4xl">
                            {dispute.description}
                        </p>
                        {dispute.requestedAmount && (
                            <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-emerald-700">₦{dispute.requestedAmount.toLocaleString()}</span>
                                    <span className="text-sm font-medium text-emerald-700">claimed</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="text-right">
                            <div className="text-sm text-neutral-500">Agreement</div>
                            <div className="font-semibold text-neutral-900">{dispute.agreementId}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-neutral-500">Property</div>
                            <div className="font-semibold">{dispute.propertyName}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                    <Clock size={20} />
                    Timeline
                </h2>
                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                    Filed Dispute
                                </div>
                                <span className="text-sm text-neutral-500">
                                    {format(new Date(dispute.createdAt), 'MMM d, yyyy • h:mm a')}
                                </span>
                            </div>
                            <p className="text-neutral-900">Dispute opened by {dispute.raisedBy.name}</p>
                        </div>
                    </div>
                    {dispute.status !== 'OPEN' && (
                        <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl border">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                                        Status Updated
                                    </div>
                                    <span className="text-sm text-neutral-500">
                                        {format(new Date(dispute.updatedAt), 'MMM d, yyyy • h:mm a')}
                                    </span>
                                </div>
                                <p className="text-neutral-900">
                                    Status changed to <span className="font-semibold">{dispute.status}</span>
                                    {dispute.resolution && (
                                        <span>. {dispute.resolution}</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Evidence */}
            {dispute.evidence.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold text-neutral-900 mb-6">Evidence ({dispute.evidence.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dispute.evidence.map((evidence) => (
                            <div key={evidence.id} className="group bg-white hover:bg-neutral-50 rounded-2xl p-6 border border-neutral-100 hover:shadow-md transition-all cursor-pointer">
                                <div className="flex items-start gap-3 mb-2">
                                    <FileText size={16} className="text-neutral-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-neutral-900 truncate mb-1" title={evidence.filename}>{evidence.filename}</div>
                                        <div className="text-xs text-neutral-500">
                                            {formatDistanceToNow(new Date(evidence.uploadedAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-full justify-start">
                                    Download
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Comments */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
                        <MessageCircle size={20} />
                        Comments ({dispute.comments.length})
                    </h2>
                    {dispute.comments.length === 0 && (
                        <span className="text-sm text-neutral-500">Be first to comment</span>
                    )}
                </div>

                {/* Comments List */}
                <div className="space-y-4 mb-8">
                    {dispute.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 p-6 bg-white rounded-2xl border border-neutral-100">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <span className="font-semibold text-white text-xs">
                                    {comment.author.role.charAt(0)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="font-semibold text-neutral-900 truncate">{comment.author.name}</div>
                                    <span className="text-xs text-neutral-500">•</span>
                                    <span className="text-xs text-neutral-500">
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-neutral-800 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Comment Form */}
                {dispute.status !== 'RESOLVED' && dispute.status !== 'WITHDRAWN' && (
                    <form onSubmit={handleSubmitComment} className="p-6 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
                        <div className="flex gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <span className="font-semibold text-white text-xs">{user?.firstName?.[0] || 'U'}</span>
                            </div>
                            <div className="flex-1 space-y-3">
                                <Textarea
                                    placeholder="Add a comment or update..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="min-h-[100px] resize-none"
                                    disabled={addCommentMutation.isPending}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="ghost" onClick={() => setNewComment('')} disabled={addCommentMutation.isPending}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!newComment.trim() || addCommentMutation.isPending}
                                        className="font-semibold"
                                    >
                                        {addCommentMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Adding...
                                            </>
                                        ) : (
                                            'Add Comment'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

