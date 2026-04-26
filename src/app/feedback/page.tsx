'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, type FeedbackEntry } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

const STATUS_STYLE: Record<FeedbackEntry['status'], string> = {
  open: 'bg-gold-50 text-gold-700',
  in_progress: 'bg-pair-50 text-pair-700',
  resolved: 'bg-oasis-50 text-oasis-700',
};

export default function FeedbackPage() {
  const { t, locale, dir } = useI18n();
  const [entries, setEntries] = useState<FeedbackEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<'complaint' | 'suggestion'>('complaint');
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(false);
    api.getFeedback().then((d) => setEntries(d as FeedbackEntry[])).catch(() => setError(true));
  }, []);

  useEffect(() => { load(); }, [load]);

  const resolve = async (id: string) => {
    setBusy(id);
    try {
      await api.resolveFeedback(id);
      setEntries((prev) => prev?.map((f) => f.id === id ? { ...f, status: 'resolved' } : f) ?? null);
    } finally {
      setBusy(null);
    }
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  if (error) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={load} retryLabel={t('common.retry')} />;

  const filtered = !entries ? [] : entries.filter((f) => f.type === tab);

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-1">{t('feedback.title')}</h1>
      <p className="text-sm text-[#737477] mb-6">{t('feedback.subtitle')}</p>

      <div className="flex gap-2 border-b border-gray-200 mb-4">
        <button
          onClick={() => setTab('complaint')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'complaint' ? 'text-pair-600 border-pair-600' : 'text-[#737477] border-transparent'
          }`}
        >
          {t('feedback.tabComplaints')} ({entries?.filter((f) => f.type === 'complaint').length ?? 0})
        </button>
        <button
          onClick={() => setTab('suggestion')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'suggestion' ? 'text-pair-600 border-pair-600' : 'text-[#737477] border-transparent'
          }`}
        >
          {t('feedback.tabSuggestions')} ({entries?.filter((f) => f.type === 'suggestion').length ?? 0})
        </button>
      </div>

      {!entries ? (
        <SkeletonTable rows={4} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState title={t('common.noData')} />
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{f.subject}</p>
                  <p className="text-xs text-[#737477] mt-0.5">
                    {locale === 'ar' ? f.student_name_ar : f.student_name_en}
                    {' · '}{f.student_id}
                    {' · '}{fmtDate(f.submitted_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-[#222]">
                    {t('feedback.routedTo')}: {f.department}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[f.status]}`}>
                    {f.status === 'resolved' ? t('feedback.resolved')
                      : f.status === 'in_progress' ? t('status.ongoing')
                      : t('status.pending')}
                  </span>
                </div>
              </div>
              <p className="text-sm text-[#222] mt-3 mb-4">{f.body}</p>
              <p className="text-xs text-[#737477] font-mono mb-3">{t('feedback.tracking')}: {f.id}</p>
              {f.status !== 'resolved' && (
                <button
                  onClick={() => resolve(f.id)}
                  disabled={busy === f.id}
                  className="px-3 py-1.5 bg-oasis-500 text-white rounded text-xs font-medium hover:bg-oasis-600 disabled:opacity-50"
                >
                  {t('feedback.markResolved')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
