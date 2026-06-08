'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import type { StudentDirectoryEntry, EnrollmentStatus } from '@/lib/student-records';

const STUDENTS_KEY = ['students', 'directory'] as const;

const statusColor = (s: EnrollmentStatus) => {
  switch (s) {
    case 'enrolled': return 'bg-oasis-100 text-oasis-700';
    case 'probation': return 'bg-gold-100 text-gold-700';
    case 'suspended': return 'bg-danger-100 text-danger-700';
    case 'withdrawn': return 'bg-gray-100 text-gray-600';
    default: return 'bg-blue-100 text-blue-700';
  }
};

const gpaColor = (g: number) =>
  g >= 3 ? 'text-oasis-600' : g >= 2 ? 'text-gold-600' : 'text-danger-600';

export default function StudentsDirectoryPage() {
  const { t, locale, dir } = useI18n();
  const isAr = locale === 'ar';
  const [search, setSearch] = useState('');

  const { data, isError, refetch } = useQuery<StudentDirectoryEntry[]>({
    queryKey: STUDENTS_KEY,
    queryFn: () => api.getStudentRecords() as Promise<StudentDirectoryEntry[]>,
  });

  const students = data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      s.name_en.toLowerCase().includes(q) ||
      s.name_ar.includes(search.trim()) ||
      s.student_number.includes(q),
    );
  }, [students, search]);

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;
  if (!data) return <SkeletonPage />;

  const thAlign = isAr ? 'text-right' : 'text-left';

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold">{t('students.title')}</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">{t('students.subtitle')}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <input
          type="text"
          autoFocus
          placeholder={t('students.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t('students.noResults')} description={t('students.emptyHint')} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 text-xs text-gray-500">
            {t('students.resultsCount', { count: filtered.length })}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className={`${thAlign} text-gray-500 border-b border-gray-100`}>
                <th className="px-4 py-2 font-medium">{t('students.colName')}</th>
                <th className="px-4 py-2 font-medium">{t('students.colProgram')}</th>
                <th className="px-4 py-2 font-medium">{t('students.colGpa')}</th>
                <th className="px-4 py-2 font-medium">{t('students.colStatus')}</th>
                <th className="px-4 py-2 font-medium">{t('students.colFlags')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <Link href={`/students/${s.id}`} className="font-medium text-pair-700 hover:underline">
                      {isAr ? s.name_ar : s.name_en}
                    </Link>
                    <span className="block text-xs text-gray-400">#{s.student_number}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {isAr ? s.program_ar : s.program_en}
                    <span className="block text-xs text-gray-400">{t(`students.level.${s.level}`)} · {s.cohort_year}</span>
                  </td>
                  <td className={`px-4 py-3 font-semibold ${gpaColor(s.gpa_cumulative)}`}>{s.gpa_cumulative.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(s.enrollment_status)}`}>
                      {t(`students.status.${s.enrollment_status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {s.active_warnings > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs bg-gold-100 text-gold-700">
                          {t('students.flagWarnings', { count: s.active_warnings })}
                        </span>
                      )}
                      {s.active_holds > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs bg-danger-100 text-danger-700">
                          {t('students.flagHolds', { count: s.active_holds })}
                        </span>
                      )}
                      {s.balance > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                          {t('students.flagBalance')}
                        </span>
                      )}
                      {s.active_warnings === 0 && s.active_holds === 0 && s.balance <= 0 && (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>
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
