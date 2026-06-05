'use client';

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, TRANSFER_INSTITUTIONS, type AdmissionApplicant } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import RejectReasonDialog from '@/components/RejectReasonDialog';

const APPLICANTS_KEY = ['admissions', 'applicants'] as const;

const STAGE_ORDER: AdmissionApplicant['stage'][] = ['admission', 'academic', 'admission_approval', 'registration', 'completed'];
const STAGE_STYLE: Record<AdmissionApplicant['stage'], string> = {
  admission: 'bg-gold-50 text-gold-700',
  academic: 'bg-pair-50 text-pair-700',
  admission_approval: 'bg-pair-50 text-pair-700',
  registration: 'bg-oasis-50 text-oasis-700',
  completed: 'bg-gray-100 text-gray-600',
};

// Photo sits at the top alongside the rest of the documents per feedback.
// White-background fix is applied later by IT before card printing.
const DOC_KEYS = [
  'photo', 'civil_id', 'passport', 'equivalency', 'high_school',
  'father_civil_id', 'declaration', 'payment_proof',
  'puc_declaration', 'placement_test',
];

export default function AdmissionsPage() {
  const { t, locale, dir } = useI18n();
  const qc = useQueryClient();
  const { data: applicants, isError, isLoading, refetch } = useQuery<AdmissionApplicant[]>({
    queryKey: APPLICANTS_KEY,
    queryFn: () => api.getAdmissionApplicants() as Promise<AdmissionApplicant[]>,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => applicants?.find((a) => a.id === selectedId) ?? null,
    [applicants, selectedId],
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [decisionComment, setDecisionComment] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [icCreated, setIcCreated] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const previewDoc = useMemo(() => {
    if (!selected || !previewKey) return null;
    return selected.documents.find((d) => d.key === previewKey) ?? null;
  }, [selected, previewKey]);
  const emptyForm = {
    name_en: '', name_ar: '', category: 'self_funded', major: '',
    semester_admitted: 'Fall 2026', entry_level: 'Level 1', transferred_from: '',
  };
  const [form, setForm] = useState(emptyForm);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const decide = async (decision: 'approve' | 'reject', reasonOverride?: string) => {
    if (!selected) return;
    const comment = decision === 'reject' ? (reasonOverride ?? '') : decisionComment;
    if (decision === 'approve' && !comment.trim()) {
      showToast(t('admissions.commentRequired'));
      return;
    }
    setBusy(decision);
    try {
      await api.decideAdmission(selected.id, decision, comment);
      const nextStage: AdmissionApplicant['stage'] = decision === 'reject'
        ? selected.stage
        : (STAGE_ORDER[Math.min(STAGE_ORDER.indexOf(selected.stage) + 1, STAGE_ORDER.length - 1)]);
      qc.setQueryData<AdmissionApplicant[]>(APPLICANTS_KEY, (prev) =>
        prev?.map((a) => a.id === selected.id ? { ...a, stage: nextStage } : a) ?? prev,
      );
      if (decision === 'approve') setDecisionComment('');
      showToast(decision === 'approve' ? t('admissions.approved') : t('admissions.rejected'));
    } finally {
      setBusy(null);
    }
  };

  const confirmRejectApplicant = async (reason: string) => {
    await decide('reject', reason);
    setRejectOpen(false);
  };

  const generateLetter = async () => {
    if (!selected) return;
    setBusy('letter');
    try {
      await api.generateAcceptanceLetter(selected.id);
      qc.setQueryData<AdmissionApplicant[]>(APPLICANTS_KEY, (prev) =>
        prev?.map((a) => a.id === selected.id ? { ...a, acceptance_letter_generated: true } : a) ?? prev,
      );
      showToast(t('admissions.letterGenerated'));
    } finally {
      setBusy(null);
    }
  };

  const createIndustrialCert = async () => {
    if (!selected) return;
    setBusy('industrial_cert');
    try {
      await api.createIndustrialCertRequest(selected.id);
      setIcCreated((prev) => new Set(prev).add(selected.id));
      showToast(t('admissions.industrialCertCreated'));
    } finally {
      setBusy(null);
    }
  };

  const generateSis = async () => {
    if (!selected) return;
    setBusy('sis');
    try {
      const res = await api.generateSisStudentId(selected.id) as { sis_student_id: string };
      qc.setQueryData<AdmissionApplicant[]>(APPLICANTS_KEY, (prev) =>
        prev?.map((a) => a.id === selected.id
          ? { ...a, sis_student_id: res.sis_student_id, stage: 'completed' }
          : a) ?? prev,
      );
      showToast(t('admissions.sisGenerated', { value: res.sis_student_id }));
    } finally {
      setBusy(null);
    }
  };

  const submitCreate = async () => {
    if (!form.name_en.trim() || !form.name_ar.trim() || !form.major.trim()) {
      showToast(t('admissions.createValidation'));
      return;
    }
    if (form.category === 'tc' && !form.transferred_from) {
      showToast(t('admissions.createValidation'));
      return;
    }
    setBusy('create');
    try {
      const isTc = form.category === 'tc';
      const transferLabel = isTc
        ? (locale === 'ar'
            ? TRANSFER_INSTITUTIONS.find((i) => i.value === form.transferred_from)?.label_ar
            : TRANSFER_INSTITUTIONS.find((i) => i.value === form.transferred_from)?.label_en) ?? ''
        : '';
      const res = await api.createAdmissionApplicant({
        applicant_name_en: form.name_en, applicant_name_ar: form.name_ar,
        category: form.category, major: form.major,
        semester_admitted: form.semester_admitted, entry_level: form.entry_level,
      }) as { id: string };
      const newApplicant: AdmissionApplicant = {
        id: res.id,
        applicant_name_en: form.name_en, applicant_name_ar: form.name_ar,
        category: form.category as AdmissionApplicant['category'],
        ...(isTc ? { transferred_from: transferLabel } : {}),
        major: form.major, semester_admitted: form.semester_admitted, entry_level: form.entry_level,
        stage: 'admission',
        documents: DOC_KEYS.map((k) => ({ key: k, status: 'missing' as const })),
        submitted_at: new Date().toISOString(),
        acceptance_letter_generated: false,
      };
      qc.setQueryData<AdmissionApplicant[]>(APPLICANTS_KEY, (prev) => [newApplicant, ...(prev ?? [])]);
      setCreateOpen(false);
      setForm(emptyForm);
      showToast(t('admissions.applicantCreated'));
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

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;

  return (
    <div dir={dir}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t('admissions.title')}</h1>
          <p className="text-sm text-[#737477]">{t('admissions.subtitle')}</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setCreateOpen(true); }}
          className="px-4 py-2 bg-pair-600 text-white rounded-lg text-sm font-medium hover:bg-pair-700 shrink-0"
        >
          + {t('admissions.newApplicant')}
        </button>
      </div>

      {toast && (
        <div role="status" aria-live="polite" className="mb-4 bg-pair-50 border border-pair-200 rounded-lg px-4 py-2 text-sm text-pair-700">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          {isLoading || !applicants ? (
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
                      onClick={() => { setSelectedId(a.id); setDecisionComment(''); }}
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
                  {selected.sis_student_id && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-[#737477]">{t('admissions.sisStudentId')}</dt>
                      <dd className="font-mono font-semibold text-oasis-700">{selected.sis_student_id}</dd>
                    </div>
                  )}
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
                {/* Photo row sits at the top with a thumbnail-style swatch and
                    a small note about the IT white-background step (feedback). */}
                {(() => {
                  const photo = selected.documents.find((x) => x.key === 'photo');
                  if (!photo) return null;
                  const status = photo.status;
                  return (
                    <button
                      type="button"
                      onClick={() => setPreviewKey('photo')}
                      className="mb-3 w-full flex items-center gap-3 p-2.5 bg-gray-50 rounded text-start hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pair-200"
                    >
                      <div className="w-12 h-12 bg-white border border-gray-200 flex items-center justify-center shrink-0">
                        {status === 'uploaded' ? (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-[#737477]" aria-hidden>
                            <circle cx="12" cy="9" r="3.5" />
                            <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
                          </svg>
                        ) : (
                          <span className="text-[10px] text-[#737477]">—</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{t('admissions.docs.photo')}</p>
                        <p className="text-[11px] text-[#737477] mt-0.5">
                          {status === 'uploaded' ? t('admissions.photoStatusOk')
                            : status === 'flagged' ? t('admissions.photoStatusFlagged')
                            : t('admissions.photoStatusMissing')}
                        </p>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        status === 'uploaded' ? 'bg-oasis-50 text-oasis-700'
                        : status === 'flagged' ? 'bg-gold-50 text-gold-700'
                        : 'bg-danger-50 text-danger-700'
                      }`}>
                        {status === 'uploaded' ? t('admissions.docUploaded')
                          : status === 'flagged' ? t('admissions.docFlagged')
                          : t('admissions.docMissing')}
                      </span>
                    </button>
                  );
                })()}
                <ul className="space-y-1.5">
                  {DOC_KEYS.filter((k) => k !== 'photo').map((k) => {
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
                      <li key={k}>
                        <button
                          type="button"
                          onClick={() => setPreviewKey(k)}
                          className="w-full flex items-center justify-between gap-2 text-sm py-1 px-1 -mx-1 rounded text-start hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pair-200"
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
                            <span className="truncate">{t(`admissions.docs.${k}`)}</span>
                          </span>
                          <span className="text-xs text-[#737477] shrink-0">{t(labelKey)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-[11px] text-[#737477] mt-3 leading-snug">
                  {t('admissions.photoWhiteBg')}
                </p>
              </div>

              {/* Admission-initiated Industrial Certificate request → Registration */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#737477] mb-2">
                  {t('admissions.industrialCert')}
                </h3>
                <p className="text-xs text-[#737477] mb-3">{t('admissions.industrialCertDesc')}</p>
                <button
                  onClick={createIndustrialCert}
                  disabled={busy !== null || icCreated.has(selected.id)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  {icCreated.has(selected.id)
                    ? '✓ ' + t('admissions.industrialCertCreated')
                    : t('admissions.createIndustrialCert')}
                </button>
              </div>

              {/* Registration enrolment — issue the SIS Student ID */}
              {selected.stage === 'registration' && !selected.sis_student_id && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#737477] mb-2">
                    {t('admissions.sisIssuance')}
                  </h3>
                  <p className="text-xs text-[#737477] mb-3">{t('admissions.sisIssuanceDesc')}</p>
                  <button
                    onClick={generateSis}
                    disabled={busy !== null || docCounts.missing > 0}
                    className="w-full px-3 py-2 bg-oasis-500 text-white rounded-lg text-sm font-medium hover:bg-oasis-600 disabled:opacity-50"
                  >
                    {t('admissions.generateSis')}
                  </button>
                  {docCounts.missing > 0 && (
                    <p className="text-xs text-danger-600 mt-2">{t('admissions.sisBlocked')}</p>
                  )}
                </div>
              )}

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
                      onClick={() => setRejectOpen(true)}
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

      {previewDoc && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          dir={dir}
          onClick={() => setPreviewKey(null)}
        >
          <div
            className="bg-white rounded-xl border border-gray-200 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-[#737477]">{t('admissions.previewLabel')}</p>
                <p className="text-sm font-semibold truncate">{t(`admissions.docs.${previewDoc.key}`)}</p>
              </div>
              <button
                onClick={() => setPreviewKey(null)}
                className="text-sm text-[#737477] hover:text-[#222] px-3 py-1"
              >
                {t('admissions.previewClose')}
              </button>
            </header>
            <div className="px-5 py-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg h-72 flex items-center justify-center">
                <div className="text-center px-4">
                  {previewDoc.status === 'uploaded' ? (
                    <>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-[#737477] mx-auto" aria-hidden>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                      </svg>
                      <p className="mt-3 text-sm font-medium text-[#222]">{t(`admissions.docs.${previewDoc.key}`)}</p>
                      <p className="text-xs text-[#737477] mt-1">
                        {locale === 'ar' ? selected.applicant_name_ar : selected.applicant_name_en} · {selected.id}
                      </p>
                    </>
                  ) : previewDoc.status === 'flagged' ? (
                    <>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-gold-600 mx-auto" aria-hidden>
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      </svg>
                      <p className="mt-3 text-sm font-medium text-[#222]">{t(`admissions.docs.${previewDoc.key}`)}</p>
                      <p className="text-xs text-gold-700 mt-1">{t('admissions.previewFlagged')}</p>
                    </>
                  ) : (
                    <>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-danger-600 mx-auto" aria-hidden>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M4.93 4.93l14.14 14.14" />
                      </svg>
                      <p className="mt-3 text-sm font-medium text-[#222]">{t(`admissions.docs.${previewDoc.key}`)}</p>
                      <p className="text-xs text-danger-700 mt-1">{t('admissions.previewNotUploaded')}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-[#737477]">{t('admissions.previewStatusLabel')}</span>
                <span className={`px-1.5 py-0.5 rounded font-medium ${
                  previewDoc.status === 'uploaded' ? 'bg-oasis-50 text-oasis-700'
                  : previewDoc.status === 'flagged' ? 'bg-gold-50 text-gold-700'
                  : 'bg-danger-50 text-danger-700'
                }`}>
                  {previewDoc.status === 'uploaded' ? t('admissions.docUploaded')
                    : previewDoc.status === 'flagged' ? t('admissions.docFlagged')
                    : t('admissions.docMissing')}
                </span>
              </div>
              <p className="text-xs text-[#737477] mt-3">{t('admissions.previewNotice')}</p>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto" dir={dir}>
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-lg p-6 my-8">
            <h3 className="text-lg font-semibold mb-1">{t('admissions.newApplicant')}</h3>
            <p className="text-sm text-[#737477] mb-4">{t('admissions.newApplicantDesc')}</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#737477] mb-1">{t('admissions.nameEn')}</label>
                  <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#737477] mb-1">{t('admissions.nameAr')}</label>
                  <input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#737477] mb-1">{t('admissions.category')}</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="self_funded">{t('admissions.cat.self_funded')}</option>
                  <option value="puc_sponsored">{t('admissions.cat.puc_sponsored')}</option>
                  <option value="other">{t('admissions.cat.other')}</option>
                  <option value="tc">{t('admissions.cat.tc')}</option>
                </select>
              </div>
              {form.category === 'tc' && (
                <div>
                  <label className="block text-xs font-medium text-[#737477] mb-1">{t('admissions.transferFrom')}</label>
                  <select value={form.transferred_from} onChange={(e) => setForm({ ...form, transferred_from: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">{t('admissions.selectInstitution')}</option>
                    {TRANSFER_INSTITUTIONS.map((i) => (
                      <option key={i.value} value={i.value}>{locale === 'ar' ? i.label_ar : i.label_en}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-[#737477] mb-1">{t('admissions.major')}</label>
                <input value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })}
                  placeholder="Diploma of Computer Programming"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#737477] mb-1">{t('admissions.semesterAdmitted')}</label>
                  <input value={form.semester_admitted} onChange={(e) => setForm({ ...form, semester_admitted: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#737477] mb-1">{t('admissions.entryLevel')}</label>
                  <input value={form.entry_level} onChange={(e) => setForm({ ...form, entry_level: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => { setCreateOpen(false); setForm(emptyForm); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                {t('common.cancel')}
              </button>
              <button onClick={submitCreate} disabled={busy === 'create'}
                className="px-4 py-2 bg-pair-600 text-white rounded-lg text-sm font-medium hover:bg-pair-700 disabled:opacity-50">
                {t('admissions.createApplicant')}
              </button>
            </div>
          </div>
        </div>
      )}

      <RejectReasonDialog
        open={rejectOpen}
        title={t('admissions.reject')}
        subject={selected
          ? `${locale === 'ar' ? selected.applicant_name_ar : selected.applicant_name_en} · ${selected.id}`
          : undefined}
        busy={busy === 'reject'}
        onConfirm={confirmRejectApplicant}
        onCancel={() => setRejectOpen(false)}
      />
    </div>
  );
}
