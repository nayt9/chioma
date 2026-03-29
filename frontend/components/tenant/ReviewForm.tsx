'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/common/StarRating';
import { useTenantReview, useUpdateReview, useDeleteReview } from '@/lib/query/hooks/use-tenant-reviews';
import { Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
    reviewId?: string;
}

export function ReviewForm({ reviewId }: ReviewFormProps) {
    const router = useRouter();
    const { data: review, isLoading } = useTenantReview(reviewId || '');
    const updateReviewMutation = useUpdateReview();
    const deleteReviewMutation = useDeleteReview();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (review) {
            setRating(review.rating);
            setComment(review.comment);
        }
    }, [review]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewId || !comment.trim()) return;

        setIsSubmitting(true);
        try {
            await updateReviewMutation.mutateAsync({
                id: reviewId,
                payload: { rating, comment }
            });
            router.push('/tenant/reviews');
        } catch (error) {
            console.error('Failed to update review:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!reviewId || !confirm('Delete this review? This cannot be undone.')) return;

        try {
            await deleteReviewMutation.mutateAsync(reviewId);
            router.push('/tenant/reviews');
        } catch (error) {
            console.error('Failed to delete review:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 p-8">
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mr-3" />
                    <span className="text-neutral-500">Loading review...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                    {review ? `Edit Review` : 'Review Details'}
                </h1>
                <p className="text-neutral-600">
                    {review ? 'Update your review' : 'View your review'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                        Rating
                    </label>
                    <StarRating
                        value={rating}
                        onChange={setRating}
                        size={28}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                        Review
                    </label>
                    <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience..."
                        rows={8}
                        className="resize-none"
                        disabled={isSubmitting}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/tenant/reviews')}
                        disabled={isSubmitting}
                        className="flex-1 sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1 font-semibold sm:w-auto"
                        disabled={isSubmitting || !comment.trim()}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                    {review && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="sm:w-auto"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
