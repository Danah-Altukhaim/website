'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  api, SOCIAL_DOC_SOURCE,
  type SocialApplication, type SocialDocRejectReason, type StudentContact,
} from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonPage } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import RejectReasonDialog from '@/components/RejectReasonDialog';
import StatusBadge, { type LifecycleStatus } from '@/components/StatusBadge';

const toLifecycle = (s: SocialApplication['status']): LifecycleStatus =>
  s === 'pending' ? 'not_started'
  : s === 'in_progress' ? 'pending'
  : s === 'completed' ? 'completed'
  : 'rejected';

const REJECT_REASONS: SocialDocRejectReason[] = ['not_clear', 'expired', 'irrelevant'];
const SOCIAL_KEY = ['social', 'applications'] as const;

export default function SocialAllowanceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { t, locale, dir, isRTL } = useI18n();
  const qc = useQueryClient();
  const detailKey = ['social', 'application', id] as const;
  const { data: app, isError, isLoading, refetch } = useQuery<SocialApplication | null>({
    queryKey: detailKey,
    queryFn: () => api.getSocialApplication(id) as Promise<SocialApplication | null>,
  });
  const { data: contact } = useQuery<StudentContact>({
    queryKey: ['student-contact', app?.student_id],
    queryFn: () => api.getStudentContact(app!.student_id) as Promise<StudentContact>,
    enabled: !!app?.student_id,
  });

  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [rejectDoc, setRejectDoc] = useState<{ key: string } | null>(null);
  const [rejectChoice, setRejectChoice] = useState<SocialDocRejectReason | ''>('');
  const [rejectAppOpen, setRejectAppOpen] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const issueCount = useMemo(
    () => app?.documents.filter((d) => d.quality === 'issue').length ?? 0,
    [app],
  );

  const syncListCache = (mutate: (a: SocialApplication) => SocialApplication) => {
    if (!app) return;
    const updated = mutate(app);
    qc.setQueryData<SocialApplication | null>(detailKey, updated);
    qc.setQueryData<SocialApplication[]>(SOCIAL_KEY, (prev) =>
      prev?.map((a) => a.id === app.id ? updated : a) ?? prev,
    );
  };

  const setStatus = async (status: SocialApplication['status'], reason?: string) => {
    if (!app) return;
    setBusy('status' + status);
    try {
      await api.updateSocialStatus(app.id, status, reason);
      syncListCache((a) => ({ ...a, status, ...(reason ? { rejection_reason: reason } : {}) }));
    } finally {
      setBusy(null);
    }
  };

  const confirmRejectApplication = async (reason: string) => {
    await setStatus('rejected', reason);
    setRejectAppOpen(false);
  };

  const markPuc = async () => {
    if (!app) return;
    setBusy('puc');
    try {
      await api.markSocialSentToPuc(app.id);
      syncListCache((a) => ({ ...a, sent_to_puc: true }));
      showToast(t('social.sentToPuc'));
    } finally {
      setBusy(null);
    }
  };

  const downloadBundle = async () => {
    if (!app) return;
    setBusy('pdf');
    try {
      const res = await api.downloadSocialBundle(app.id) as { file: string };
      showToast(t('social.downloadedToast', { value: res.file }));
    } finally {
      setBusy(null);
    }
  };

  const confirmRejectDoc = async () => {
    if (!app || !rejectDoc || !rejectChoice) return;
    setBusy('reject' + rejectDoc.key);
    try {
      await api.rejectSocialDocument(app.id, rejectDoc.key, rejectChoice);
      syncListCache((a) => ({
        ...a,
        documents: a.documents.map((d) =>
          d.key === rejectDoc.key
            ? { ...d, quality: 'issue', reject_reason: rejectChoice }
            : d,
        ),
      }));
      showToast(t('social.rejectedToast', { value: t(`social.docs.${rejectDoc.key}`) }));
      setRejectDoc(null);
      setRejectChoice('');
    } finally {
      setBusy(null);
    }
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;
  if (isLoading) return <SkeletonPage />;
  if (!app) return (
    <div dir={dir}>
      <Link href="/social-allowance" className="text-sm text-pair-600 hover:text-pair-700 mb-4 inline-flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {isRTL ? <path d="M3 8h10M9 4l4 4-4 4" /> : <path d="M13 8H3M7 4L3 8l4 4" />}
        </svg>
        {t('common.back')}
      </Link>
      <EmptyState title={t('social.applicationNotFound')} />
    </div>
  );

  return (
    <div dir={dir}>
      <Link href="/social-allowance" className="text-sm text-pair-600 hover:text-pair-700 mb-4 inline-flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {isRTL ? <path d="M3 8h10M9 4l4 4-4 4" /> : <path d="M13 8H3M7 4L3 8l4 4" />}
        </svg>
        {t('common.back')}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-mono text-[#737477]">{app.application_no}</p>
          <h1 className="text-2xl font-bold mt-1">
            {locale === 'ar' ? app.student_name_ar : app.student_name_en}
          </h1>
          <p className="text-sm text-[#737477] mt-1">
            {app.student_id} · {t(`social.cat.${app.category}`)} · {fmtDate(app.submitted_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={toLifecycle(app.status)} size="md" />
          {app.sent_to_puc && (
            <span className="px-3 py-1 rounded text-sm font-medium bg-pair-50 text-pair-700">
              {t('social.sentToPuc')}
            </span>
          )}
        </div>
      </div>

      {toast && (
        <div role="status" aria-live="polite" className="mb-4 bg-oasis-50 border border-oasis-200 rounded-lg px-4 py-2 text-sm text-oasis-700">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Documents */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
              <h2 className="text-lg font-semibold">{t('social.documentsTitle')}</h2>
              <p className="text-xs text-[#737477]">
                {t('social.documentsCount', { value: app.documents.length })}
                {issueCount > 0 && (
                  <span className="ms-2 text-danger-700">
                    · {t('social.documentsIssueCount', { value: issueCount })}
                  </span>
                )}
              </p>
            </div>

            <ol className="space-y-3">
              {app.documents.map((d, idx) => {
                const source = SOCIAL_DOC_SOURCE[d.key];
                const isIssue = d.quality === 'issue';
                return (
                  <li
                    key={d.key}
                    className={`rounded-lg border px-4 py-3 ${
                      isIssue ? 'border-danger-200 bg-danger-50/40' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex items-start gap-3">
                        <span className="text-xs font-semibold text-[#737477] tabular-nums shrink-0 w-5 text-center mt-0.5">
                          {idx + 1}
                        </span>
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${
                          isIssue ? 'bg-danger-500' : 'bg-oasis-500'
                        }`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{t(`social.docs.${d.key}`)}</p>
                          {source && (
                            <p className="text-xs text-[#737477] mt-0.5">
                              {t('social.howToFind')}: {t(`social.source.${source}`)}
                            </p>
                          )}
                          {d.reject_reason && (
                            <p className="text-xs text-danger-700 mt-1">
                              {t(`social.rejectReason.${d.reject_reason}`)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-medium ${
                          isIssue ? 'text-danger-700' : 'text-[#737477]'
                        }`}>
                          {isIssue ? t('social.qualityIssue') : t('social.qualityOk')}
                        </span>
                        {!isIssue && (
                          <button
                            type="button"
                            onClick={() => { setRejectDoc({ key: d.key }); setRejectChoice(''); }}
                            className="text-xs font-medium text-danger-700 hover:underline"
                          >
                            {t('social.rejectDocReason')}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-[#737477] uppercase tracking-wider mb-3">
              {t('social.studentInfo')}
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[#737477]">{t('social.studentId')}</dt>
                <dd className="font-medium" dir="ltr">{app.student_id}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#737477]">{t('social.category')}</dt>
                <dd className="font-medium text-end">{t(`social.cat.${app.category}`)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#737477]">{t('social.submittedAt')}</dt>
                <dd className="font-medium text-end">{fmtDate(app.submitted_at)}</dd>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <dt className="text-[#737477] text-xs uppercase tracking-wider mb-2">
                  {t('requests.contactsTitle')}
                </dt>
                <div className="space-y-2">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#737477]">{t('requests.contactPhone')}</span>
                    <span className="font-medium text-end" dir="ltr">
                      {contact?.phone ?? <span className="italic text-[#737477]">{t('requests.contactMissing')}</span>}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#737477]">{t('requests.contactEmergency')}</span>
                    <span className="font-medium text-end" dir="ltr">
                      {contact?.emergency_phone ?? <span className="italic text-[#737477]">{t('requests.contactMissing')}</span>}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#737477]">{t('requests.contactEmail')}</span>
                    <span className="font-medium text-end break-all" dir="ltr">
                      {contact?.email ?? <span className="italic text-[#737477]">{t('requests.contactMissing')}</span>}
                    </span>
                  </div>
                  <div className="pt-2">
                    <p className="text-[#737477] text-xs mb-1">{t('requests.contactAddress')}</p>
                    <p>
                      {(locale === 'ar' ? contact?.address_ar : contact?.address_en)
                        ?? <span className="italic text-[#737477]">{t('requests.contactMissing')}</span>}
                    </p>
                  </div>
                </div>
              </div>
            </dl>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-2">
            <h3 className="text-sm font-semibold text-[#737477] uppercase tracking-wider mb-2">
              {t('social.actionsTitle')}
            </h3>
            <button
              onClick={downloadBundle}
              disabled={busy === 'pdf'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {t('social.downloadPdf')}
            </button>
            {app.status === 'pending' && (
              <button
                onClick={() => setStatus('in_progress')}
                disabled={busy === 'statusin_progress' || issueCount > 0}
                className="w-full px-3 py-2 bg-pair-600 text-white rounded-lg text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
              >
                {t('requests.markInProgress')}
              </button>
            )}
            {app.status === 'in_progress' && (
              <button
                onClick={() => setStatus('completed')}
                disabled={busy === 'statuscompleted'}
                className="w-full px-3 py-2 bg-oasis-500 text-white rounded-lg text-sm font-medium hover:bg-oasis-600 disabled:opacity-50"
              >
                {t('requests.markCompleted')}
              </button>
            )}
            {!app.sent_to_puc && app.status !== 'rejected' && (
              <button
                onClick={markPuc}
                disabled={busy === 'puc'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {t('social.markSentToPuc')}
              </button>
            )}
            {app.status !== 'completed' && app.status !== 'rejected' && (
              <button
                onClick={() => setRejectAppOpen(true)}
                disabled={busy === 'statusrejected'}
                className="w-full px-3 py-2 border border-danger-200 text-danger-700 rounded-lg text-sm hover:bg-danger-50 disabled:opacity-50"
              >
                {t('admissions.reject')}
              </button>
            )}
          </section>
        </aside>
      </div>

      {/* Per-document reject reason modal */}
      {rejectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" dir={dir} onClick={() => { setRejectDoc(null); setRejectChoice(''); }}>
          <div
            className="bg-white rounded-xl border border-gray-200 w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-1">{t('social.rejectDocReason')}</h3>
            <p className="text-sm text-[#737477] mb-3">{t(`social.docs.${rejectDoc.key}`)}</p>
            <label className="block text-xs font-medium text-[#737477] mb-1">
              {t('social.rejectDocReasonLabel')}
            </label>
            <div className="space-y-1.5 mb-4">
              {REJECT_REASONS.map((code) => (
                <label key={code} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="social-detail-reject-reason"
                    checked={rejectChoice === code}
                    onChange={() => setRejectChoice(code)}
                    className="accent-danger-600"
                  />
                  <span>{t(`social.rejectReason.${code}`)}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setRejectDoc(null); setRejectChoice(''); }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmRejectDoc}
                disabled={!rejectChoice || busy === 'reject' + rejectDoc.key}
                className="px-3 py-1.5 bg-danger-500 text-white rounded-lg text-sm font-medium hover:bg-danger-600 disabled:opacity-50"
              >
                {t('social.rejectDocReason')}
              </button>
            </div>
          </div>
        </div>
      )}

      <RejectReasonDialog
        open={rejectAppOpen}
        title={t('admissions.reject')}
        subject={app
          ? `${app.application_no} · ${locale === 'ar' ? app.student_name_ar : app.student_name_en}`
          : undefined}
        busy={busy === 'statusrejected'}
        onConfirm={confirmRejectApplication}
        onCancel={() => setRejectAppOpen(false)}
      />
    </div>
  );
}
