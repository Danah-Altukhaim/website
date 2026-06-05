'use client';

import { useI18n } from '@/lib/i18n';

// The admin site recognizes exactly four lifecycle statuses everywhere a
// status pill is shown (Social Allowance, Requests, Feedback, IT Helpdesk,
// Sport, Student Life clubs, Finance clearance, Retention outcomes). Each
// raw module-specific status (submitted/open/in_progress/resolved/etc.) is
// mapped to one of these four at the call site.
export type LifecycleStatus = 'not_started' | 'pending' | 'completed' | 'rejected';

const STYLE: Record<LifecycleStatus, string> = {
  not_started: 'bg-gray-100 text-gray-600',
  pending: 'bg-gold-50 text-gold-700',
  completed: 'bg-oasis-50 text-oasis-700',
  rejected: 'bg-danger-50 text-danger-700',
};

const LABEL_KEY: Record<LifecycleStatus, string> = {
  not_started: 'status.notStarted',
  pending: 'status.pending',
  completed: 'status.completed',
  rejected: 'status.rejected',
};

interface StatusBadgeProps {
  status: LifecycleStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusBadge({ status, size = 'sm', className = '' }: StatusBadgeProps) {
  const { t } = useI18n();
  const sizeCls = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`${sizeCls} rounded font-medium ${STYLE[status]} ${className}`.trim()}>
      {t(LABEL_KEY[status])}
    </span>
  );
}
