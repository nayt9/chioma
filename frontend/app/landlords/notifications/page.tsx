'use client';

import Link from 'next/link';
import { Bell, ChevronRight, Settings2 } from 'lucide-react';
import { useState } from 'react';
import type { ComponentType } from 'react';
import { useAuth } from '@/store/authStore';
import NotificationsList from '@/components/landlord/NotificationsList';
import NotificationSettings from '@/components/landlord/NotificationSettings';

type ActiveTab = 'notifications' | 'settings';

export default function LandlordNotificationsPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('notifications');

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 text-slate-200">
        Loading landlord notifications...
      </div>
    );
  }

  if (!user || user.role !== 'landlord') {
    return (
      <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-8 text-amber-50">
        <h1 className="text-2xl font-semibold">Landlord access required</h1>
        <p className="mt-3 text-sm text-amber-100/80">
          This page is limited to authenticated landlord accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-sm text-slate-300"
      >
        <Link href="/landlords" className="transition hover:text-white">
          Landlord Portal
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-500" />
        <span className="text-white">Notifications</span>
      </nav>

      <header className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
              <Bell className="h-3.5 w-3.5" />
              Landlord Notifications
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
              Stay on top of property activity
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Review incoming alerts, triage unread updates, and configure how
              Chioma should notify you about payments, maintenance issues,
              tenants, and system events.
            </p>
          </div>

          <div className="inline-flex w-full rounded-2xl border border-white/10 bg-slate-950/40 p-1.5 sm:w-auto">
            <TabButton
              icon={Bell}
              label="Notifications"
              active={activeTab === 'notifications'}
              onClick={() => setActiveTab('notifications')}
            />
            <TabButton
              icon={Settings2}
              label="Settings"
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            />
          </div>
        </div>
      </header>

      {activeTab === 'notifications' ? (
        <NotificationsList userId={user.id} />
      ) : (
        <NotificationSettings userId={user.id} />
      )}
    </div>
  );
}

type TabButtonProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
};

function TabButton({ icon: Icon, label, active, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition sm:flex-none ${
        active
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-950/30'
          : 'text-slate-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
