'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, Filter, X } from 'lucide-react';
import NotificationItem from '@/components/notifications/NotificationItem';
import {
  selectUnreadCount,
  useNotificationStore,
} from '@/store/notificationStore';

type FilterValue = 'all' | 'unread';

export function NotificationCenter() {
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore(selectUnreadCount);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const isLoaded = useNotificationStore((s) => s.isLoaded);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<FilterValue>('all');

  useEffect(() => {
    if (!isLoaded) {
      fetchNotifications().catch(() => undefined);
    }
  }, [fetchNotifications, isLoaded]);

  const visibleNotifications = useMemo(
    () =>
      filter === 'unread'
        ? notifications.filter((notification) => !notification.read)
        : notifications,
    [filter, notifications],
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
        aria-label={`Open notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 flex w-[min(92vw,380px)] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Notification Center
              </h3>
              <p className="text-xs text-blue-100/45">
                {unreadCount > 0
                  ? `${unreadCount} unread updates`
                  : 'All caught up'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100/70 transition hover:bg-white/5 hover:text-white"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Read all
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/10 p-2 text-blue-100/70 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <Filter className="h-4 w-4 text-blue-100/45" />
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'border border-white/10 bg-white/5 text-blue-100/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filter === 'unread'
                  ? 'bg-blue-500 text-white'
                  : 'border border-white/10 bg-white/5 text-blue-100/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              Unread
            </button>
          </div>

          <div className="max-h-[28rem] overflow-y-auto divide-y divide-white/5">
            {visibleNotifications.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-blue-100/45">
                No notifications in this view.
              </div>
            ) : (
              visibleNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onToggleRead={markAsRead}
                  variant="full"
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
