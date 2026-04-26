'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { api, type StudentRequest, type RequestStatus, type RequestType } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

const REQUEST_TYPES: RequestType[] = [
  'twimc', 'twimc_balance', 'transcript', 'semester_withdrawal', 'college_withdrawal',
  'absence_excuse', 'expected_grad', 'puc_letter', 'puc_no_aid', 'industrial_cert',
  'lost_id', 'update_id_photo',
];

const STATUS_STYLE: Record<RequestStatus, string> = {
  submitted: 'bg-gold-50 text-gold-700',
  in_progress: 'bg-pair-50 text-pair-700',
  completed: 'bg-oasis-50 text-oasis-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

export default function RequestsPage() {
  const { t, locale, dir } = useI18n();
  const [requests, setRequests] = useState<StudentRequest[] | null>(null);
  const [error, setError] = useState(false);
  const [typeFilter, setTypeFilter] = useState<RequestType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setError(false);
    api.getRequests().then((d) => setRequests(d as StudentRequest[])).catch(() => setError(true));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!requests) return [];
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.student_id.toLowerCase().includes(q) ||
        r.student_name_en.toLowerCase().includes(q) ||
        r.student_name_ar.includes(q)
      );
    });
  }, [requests, typeFilter, statusFilter, search]);

  const fmtDate = (iso: string) => new Date(iso).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  if (error) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={load} retryLabel={t('common.retry')} />;

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-1">{t('requests.title')}</h1>
      <p className="text-sm text-[#737477] mb-6">{t('requests.subtitle')}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder={t('requests.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as RequestType | 'all')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">{t('requests.allTypes')}</option>
          {REQUEST_TYPES.map((rt) => (
            <option key={rt} value={rt}>{t(`requestType.${rt}`)}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'all')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">{t('requests.allStatuses')}</option>
          <option value="submitted">{t('status.pending')}</option>
          <option value="in_progress">{t('status.ongoing')}</option>
          <option value="completed">{t('status.resolved')}</option>
          <option value="cancelled">{t('status.inactive')}</option>
        </select>
      </div>

      {!requests ? (
        <SkeletonTable rows={6} cols={6} />
      ) : filtered.length === 0 ? (
        <EmptyState title={t('requests.noResults')} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#737477] border-b bg-gray-50">
                <th className="px-4 py-3 text-start font-medium">{t('requests.id')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('requests.student')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('requests.type')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('common.status')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('requests.assignedTo')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('requests.submittedAt')}</th>
                <th className="px-4 py-3 text-end font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-[#222]">{r.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{locale === 'ar' ? r.student_name_ar : r.student_name_en}</p>
                    <p className="text-xs text-[#737477]">{r.student_id}</p>
                  </td>
                  <td className="px-4 py-3 text-[#222]">{t(`requestType.${r.type}`)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[r.status]}`}>
                      {r.status === 'submitted' ? t('status.pending')
                        : r.status === 'in_progress' ? t('status.ongoing')
                        : r.status === 'completed' ? t('status.resolved')
                        : t('status.inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#737477] text-sm">
                    {r.assigned_to_en
                      ? (locale === 'ar' ? r.assigned_to_ar : r.assigned_to_en)
                      : <span className="italic">{t('requests.unassigned')}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#737477]">{fmtDate(r.submitted_at)}</td>
                  <td className="px-4 py-3 text-end">
                    <Link
                      href={`/requests/${r.id}`}
                      className="text-pair-600 hover:text-pair-700 text-sm font-medium"
                    >
                      {t('requests.openDetail')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
