'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { api, type AdmissionApplicant } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';

const STAGE_ORDER: AdmissionApplicant['stage'][] = ['admission', 'academic', 'admission_approval', 'registration', 'completed'];
const STAGE_STYLE: Record<AdmissionApplicant['stage'], string> = {
  admission: 'bg-gold-50 text-gold-700',
  academic: 'bg-pair-50 text-pair-700',
  admission_approval: 'bg-pair-50 text-pair-700',
  registration: 'bg-oasis-50 text-oasis-700',
  completed: 'bg-gray-100 text-gray-600',
};

const DOC_KEYS = [
  'civil_id', 'passport', 'equivalency', 'high_school',
  'father_civil_id', 'declaration', 'payment_proof',
  'puc_declaration', 'placement_test',
];

export default function AdmissionsPage() {
  const { t, locale, dir } = useI18n();
  const [applicants, setApplicants] = useState<AdmissionApplicant[] | null>(null);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<AdmissionApplicant | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [decisionComment, setDecisionComment] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(false);
    api.getAdmissionApplicants().then((d) => setApplicants(d as AdmissionApplicant[])).catch(() => setError(true));
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const decide = async (decision: 'approve' | 'reject') => {
    if (!selected) return;
    if (!decisionComment.trim()) {
      showToast(t('admissions.commentRequired'));
      return;
    }
    setBusy(decision);
    try {
      await api.decideAdmission(selected.id, decision, decisionComment);
      const nextStage: AdmissionApplicant['stage'] = decision === 'reject'
        ? selected.stage
        : (STAGE_ORDER[Math.min(STAGE_ORDER.indexOf(selected.stage) + 1, STAGE_ORDER.length - 1)]);
      const updated = applicants?.map((a) => a.id === selected.id ? { ...a, stage: nextStage } : a) ?? null;
      setApplicants(updated);
      setSelected(updated?.find((a) => a.id === selected.id) ?? null);
      setDecisionComment('');
      showToast(decision === 'approve' ? t('admissions.approved') : t('admissions.rejected'));
    } finally {
      setBusy(null);
    }
  };

  const generateLetter = async () => {
    if (!selected) return;
    setBusy('letter');
    try {
      await api.generateAcceptanceLetter(selected.id);
      const updated = applicants?.map((a) => a.id === selected.id ? { ...a, acceptance_letter_generated: true } : a) ?? null;
      setApplicants(updated);
      setSelected(updated?.find((a) => a.id === selected.id) ?? null);
      showToast(t('admissions.letterGenerated'));
    } finally {
      setBusy(null);
    }
  };

  const docCounts = useMemo(() => {
    if (!selected) return { ok: 0, missing: 0, flagged: 0 };
    return {
      ok: selected.documents.filter((d) => d.status === 'uploaded').length,
      missing: selected.documents.filter((d) => d.status === 'missing').length,
      flagged: selected.documents.filter((d) => d.status === 'flagged').length,
    };
  }, [selected]);

  if (error) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={load} retryLabel={t('common.retry')} />;

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-1">{t('admissions.title')}</h1>
      <p className="text-sm text-[#737477] mb-6">{t('admissions.subtitle')}</p>

      {toast && (
        <div className="mb-4 bg-pair-50 border border-pair-200 rounded-lg px-4 py-2 text-sm text-pair-700">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          {!applicants ? (
            <SkeletonTable rows={5} cols={5} />
          ) : applicants.length === 0 ? (
            <EmptyState title={t('common.noData')} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#737477] border-b bg-gray-50">
                    <th className="px-3 py-3 text-start font-medium">{t('admissions.applicantName')}</th>
                    <th className="px-3 py-3 text-start font-medium">{t('admissions.category')}</th>
                    <th className="px-3 py-3 text-start font-medium">{t('admissions.major')}</th>
                    <th className="px-3 py-3 text-start font-medium">{t('admissions.workflowStage')}</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => { setSelected(a); setDecisionComment(''); }}
                      className={`border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 ${
                        selected?.id === a.id ? 'bg-pair-50' : ''
                      }`}
                    >
                      <td className="px-3 py-3">
                        <p className="font-medium">{locale === 'ar' ? a.applicant_name_ar : a.applicant_name_en}</p>
                        <p className="text-xs font-mono text-[#737477]">{a.id}</p>
                      </td>
                      <td className="px-3 py-3 text-[#222]">{t(`admissions.cat.${a.category}`)}</td>
                      <td className="px-3 py-3 text-[#737477] text-xs">{a.major}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${STAGE_STYLE[a.stage]}`}>
                          {t(`admissions.stage.${a.stage}`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-lg font-bold">{locale === 'ar' ? selected.applicant_name_ar : selected.applicant_name_en}</h2>
                <p className="text-xs font-mono text-[#737477] mt-1">{selected.id}</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#737477]">{t('admissions.category')}</dt>
                    <dd className="font-medium">{t(`admissions.cat.${selected.category}`)}</dd>
                  </div>
                  {selected.transferred_from && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-[#737477]">{t('admissions.transferFrom')}</dt>
                      <dd className="font-medium text-end">{selected.transferred_from}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#737477]">{t('admissions.major')}</dt>
                    <dd className="font-medium text-end">{selected.major}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#737477]">{t('admissions.semesterAdmitted')}</dt>
                    <dd className="font-medium">{selected.semester_admitted}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#737477]">{t('admissions.entryLevel')}</dt>
                    <dd className="font-medium">{selected.entry_level}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#737477]">{t('admissions.workflowStage')}</dt>
                    <dd>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STAGE_STYLE[selected.stage]}`}>
                        {t(`admissions.stage.${selected.stage}`)}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#737477]">
                    {t('admissions.documents')}
                  </h3>
                  <span className="text-xs text-[#737477]">
                    {docCounts.ok}/{selected.documents.length}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {DOC_KEYS.map((k) => {
                    const d = selected.documents.find((x) => x.key === k);
                    if (!d) return null;
                    const dotClass =
                      d.status === 'uploaded' ? 'bg-oasis-500'
                      : d.status === 'flagged' ? 'bg-gold-500'
                      : 'bg-danger-500';
                    const labelKey =
                      d.status === 'uploaded' ? 'admissions.docUploaded'
                      : d.status === 'flagged' ? 'admissions.docFlagged'
                      : 'admissions.docMissing';
                    return (
                      <li key={k} className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
                          <span className="truncate">{t(`admissions.docs.${k}`)}</span>
                        </span>
                        <span className="text-xs text-[#737477] shrink-0">{t(labelKey)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {selected.stage !== 'completed' && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                  <textarea
                    value={decisionComment}
                    onChange={(e) => setDecisionComment(e.target.value)}
                    placeholder={t('admissions.commentRequired')}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => decide('approve')}
                      disabled={busy !== null || docCounts.missing > 0}
                      className="flex-1 px-3 py-2 bg-pair-600 text-white rounded-lg text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
                    >
                      {t('admissions.approve')}
                    </button>
                    <button
                      onClick={() => decide('reject')}
                      disabled={busy !== null}
                      className="flex-1 px-3 py-2 border border-danger-200 text-danger-700 rounded-lg text-sm font-medium hover:bg-danger-50 disabled:opacity-50"
                    >
                      {t('admissions.reject')}
                    </button>
                  </div>
                  <button
                    onClick={generateLetter}
                    disabled={busy !== null || selected.acceptance_letter_generated || docCounts.missing > 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    {selected.acceptance_letter_generated ? '✓ ' + t('admissions.letterGenerated') : t('admissions.generateLetter')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-[#737477] text-sm">
              {locale === 'ar' ? 'اختر مقدم طلب لعرض التفاصيل' : 'Select an applicant to view details'}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
