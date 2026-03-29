import { Metadata } from 'next';
import Link from 'next/link';
import { MessageSquareQuote, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { ReviewsList } from '@/components/tenant/ReviewsList';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Reviews | Tenant Portal',
    description: 'Manage your review history.',
};

export default function TenantReviewsPage() {
    const { user, isAuthenticated, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'tenant') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-8">
                <div className="max-w-md text-center text-white">
                    <Star className="w-20 h-20 text-blue-400 mx-auto mb-6 opacity-75" />
                    <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
                    <p className="text-xl mb-8 text-blue-200/80">Reviews are only available to verified tenants.</p>
                    <Link href="/login">
                        <Button className="bg-white text-neutral-900 hover:bg-neutral-100 font-semibold px-8 h-12 text-lg">
                            Sign in as Tenant
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Breadcrumb */}
            <div className="mb-8 flex items-center text-sm text-neutral-400 space-x-2">
                <Link href="/tenant" className="hover:text-white transition-colors">
                    Overview
                </Link>
                <span>→</span>
                <span className="font-semibold text-white">Reviews</span>
            </div>

            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Reviews</h1>
                        <p className="text-xl text-blue-100">Your review history</p>
                    </div>
                    <Button asChild size="lg" className="shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30">
                        <Link href="/tenant/reviews/new">
                            <Plus className="w-5 h-5 mr-2" />
                            Write Review
                        </Link>
                    </Button>
                </div>

                <Suspense fallback={
                    <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-12 border border-white/20 flex items-center justify-center">
                        Loading your reviews...
                    </div>
                }>
                    <ReviewsList />
                </Suspense>
            </div>
        </>
    );
}
