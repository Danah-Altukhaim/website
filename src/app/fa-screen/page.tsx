'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, type FaRoster } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonPage } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

type Decision = FaRoster['students'][0]['decision'];

export default function FaScreenPage() {
  const { t, locale, dir } = useI18n();
  const [rosters, setRosters] = useState<FaRoster[] | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(false);
    api.getFaRosters().then((d) => setRosters(d as FaRoster[])).catch(() => setError(true));
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const decide = async (rowId: string, decision: 'fa_admitted' | 'absence_removed') => {
    setBusy(rowId + decision);
    try {
      await api.decideFa(rowId, decision);
      const next: Decision = decision === 'fa_admitted' ? 'forwarded' : 'absence_removed';
      setRosters((prev) => prev?.map((r) => ({
        ...r,
        students: r.students.map((s) => s.id === rowId ? { ...s, decision: next } : s),
      })) ?? null);
      showToast(decision === 'fa_admitted' ? t('fa.faImposed') + ' · ' + t('fa.warningSent') : t('fa.absenceRemoved'));
    } finally {
      setBusy(null);
    }
  };

  if (error) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={load} retryLabel={t('common.retry')} />;
  if (!rosters) return <SkeletonPage />;

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-1">{t('fa.title')}</h1>
      <p className="text-sm text-[#737477] mb-6">{t('fa.subtitle')}</p>

      {toast && (
        <div className="mb-4 bg-pair-50 border border-pair-200 rounded-lg px-4 py-2 text-sm text-pair-700">
          {toast}
        </div>
      )}

      {rosters.length === 0 ? (
        <EmptyState title={t('common.noData')} />
      ) : (
        <div className="space-y-6">
          {rosters.map((r) => (
            <section key={r.course_code + r.section} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <header className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold">
                  {r.course_code} — {r.course_name}
                </h2>
                <p className="text-xs text-[#737477] mt-1">
                  {r.section} · {locale === 'ar' ? r.instructor_ar : r.instructor_en}
                </p>
              </header>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#737477] border-b">
                    <th className="px-4 py-3 text-start font-medium">{t('requests.student')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('fa.attendancePct')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('fa.absences')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('fa.assessmentScores')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('fa.totalGrade')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('fa.decision')}</th>
                  </tr>
                </thead>
                <tbody>
                  {r.students.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{locale === 'ar' ? s.name_ar : s.name_en}</p>
                        <p className="text-xs text-[#737477]">{s.student_id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${
                          s.attendance_pct < 65 ? 'text-danger-600' : 'text-gold-600'
                        }`}>
                          {s.attendance_pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#737477]">{s.absences}</td>
                      <td className="px-4 py-3 text-xs text-[#737477]">
                        {s.assessments.map((a) => `${a.label}: ${a.score}`).join(' · ')}
                      </td>
                      <td className="px-4 py-3 font-semibold">{s.total_grade}</td>
                      <td className="px-4 py-3">
                        {s.decision === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => decide(s.id, 'absence_removed')}
                              disabled={busy === s.id + 'absence_removed'}
                              className="px-2.5 py-1 bg-oasis-500 text-white rounded text-xs font-medium hover:bg-oasis-600 disabled:opacity-50"
                            >
                              {t('fa.removeAbsence')}
                            </button>
                            <button
                              onClick={() => decide(s.id, 'fa_admitted')}
                              disabled={busy === s.id + 'fa_admitted'}
                              className="px-2.5 py-1 bg-danger-500 text-white rounded text-xs font-medium hover:bg-danger-600 disabled:opacity-50"
                            >
                              {t('fa.admitFa')}
                            </button>
                          </div>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            s.decision === 'forwarded' ? 'bg-danger-50 text-danger-700'
                            : 'bg-oasis-50 text-oasis-700'
                          }`}>
                            {s.decision === 'forwarded' ? t('fa.goToRegistration')
                              : s.decision === 'absence_removed' ? t('fa.absenceRemoved')
                              : t('fa.faImposed')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
