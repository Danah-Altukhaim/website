'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  api, SOCIAL_DOC_SOURCE,
  type SocialApplication, type SocialCategory, type SocialDocRejectReason,
} from '@/lib/api';
import {
  SOCIAL_ALLOWANCE_CHECKLISTS,
  type SocialAllowanceStage,
} from '@/lib/cckPolicies';
import { useI18n } from '@/lib/i18n';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import RejectReasonDialog from '@/components/RejectReasonDialog';
import StatusBadge, { type LifecycleStatus } from '@/components/StatusBadge';

const toLifecycle = (s: SocialApplication['status']): LifecycleStatus =>
  s === 'pending' ? 'not_started'
  : s === 'in_progress' ? 'pending'
  : s === 'completed' ? 'completed'
  : 'rejected';

// bank_change is intentionally excluded from the SA category list — per
// feedback it lives under Requests, not Social Allowance.
const CATEGORIES: SocialCategory[] = ['kuwaiti', 'kuwaiti_mother', 'disabled', 'married'];
const SOCIAL_KEY = ['social', 'applications'] as const;
const REJECT_REASONS: SocialDocRejectReason[] = ['not_clear', 'expired', 'irrelevant'];

export default function SocialAllowancePage() {
  const { t, locale, dir } = useI18n();
  const qc = useQueryClient();
  const { data: apps, isError, isLoading, refetch } = useQuery<SocialApplication[]>({
    queryKey: SOCIAL_KEY,
    queryFn: () => api.getSocialApplications() as Promise<SocialApplication[]>,
  });
  const [filter, setFilter] = useState<SocialCategory | 'all'>('all');
  const [stage, setStage] = useState<SocialAllowanceStage>('expected_grad');
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [rejectDoc, setRejectDoc] = useState<{ applicationId: string; key: string } | null>(null);
  const [rejectChoice, setRejectChoice] = useState<SocialDocRejectReason | ''>('');
  const [rejectAppTarget, setRejectAppTarget] = useState<SocialApplication | null>(null);

  const allowanceApps = useMemo(
    () => (apps ?? []).filter((a) => a.category !== 'bank_change'),
    [apps],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const setStatus = async (id: string, status: SocialApplication['status'], reason?: string) => {
    setBusy(id + status);
    try {
      await api.updateSocialStatus(id, status, reason);
      qc.setQueryData<SocialApplication[]>(SOCIAL_KEY, (prev) =>
        prev?.map((a) => a.id === id
          ? { ...a, status, ...(reason ? { rejection_reason: reason } : {}) }
          : a) ?? prev,
      );
    } finally {
      setBusy(null);
    }
  };

  const confirmRejectApplication = async (reason: string) => {
    if (!rejectAppTarget) return;
    await setStatus(rejectAppTarget.id, 'rejected', reason);
    setRejectAppTarget(null);
  };

  const markPuc = async (id: string) => {
    setBusy(id + 'puc');
    try {
      await api.markSocialSentToPuc(id);
      qc.setQueryData<SocialApplication[]>(SOCIAL_KEY, (prev) =>
        prev?.map((a) => a.id === id ? { ...a, sent_to_puc: true } : a) ?? prev,
      );
      showToast(t('social.sentToPuc'));
    } finally {
      setBusy(null);
    }
  };

  const downloadBundle = async (app: SocialApplication) => {
    setBusy(app.id + 'pdf');
    try {
      const res = await api.downloadSocialBundle(app.id) as { file: string };
      showToast(t('social.downloadedToast', { value: res.file }));
    } finally {
      setBusy(null);
    }
  };

  const confirmRejectDoc = async () => {
    if (!rejectDoc || !rejectChoice) return;
    setBusy(rejectDoc.applicationId + rejectDoc.key);
    try {
      await api.rejectSocialDocument(rejectDoc.applicationId, rejectDoc.key, rejectChoice);
      qc.setQueryData<SocialApplication[]>(SOCIAL_KEY, (prev) =>
        prev?.map((a) => a.id === rejectDoc.applicationId
          ? {
              ...a,
              documents: a.documents.map((d) =>
                d.key === rejectDoc.key
                  ? { ...d, quality: 'issue', reject_reason: rejectChoice }
                  : d,
              ),
            }
          : a) ?? prev,
      );
      showToast(t('social.rejectedToast', { value: t(`social.docs.${rejectDoc.key}`) }));
      setRejectDoc(null);
      setRejectChoice('');
    } finally {
      setBusy(null);
    }
  };

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;

  const filtered = allowanceApps.filter((a) => filter === 'all' || a.category === filter);

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-1">{t('social.title')}</h1>
      <p className="text-sm text-[#737477] mb-6">{t('social.subtitle')}</p>

      {toast && (
        <div role="status" aria-live="polite" className="mb-4 bg-pair-50 border border-pair-200 rounded-lg px-4 py-2 text-sm text-pair-700">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm border ${
            filter === 'all' ? 'bg-pair-600 text-white border-pair-600' : 'bg-white text-[#737477] border-gray-300'
          }`}
        >
          {t('common.actions')} · {allowanceApps.length}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              filter === c ? 'bg-pair-600 text-white border-pair-600' : 'bg-white text-[#737477] border-gray-300'
            }`}
          >
            {t(`social.cat.${c}`)} · {allowanceApps.filter((a) => a.category === c).length}
          </button>
        ))}
      </div>

      {/* Per-category document checklists (CCK Hub Feedback v3). */}
      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <header className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-[#222] uppercase tracking-wider">
              {t('social.checklistTitle')}
            </h2>
            <p className="text-xs text-[#737477] mt-1">{t('social.stageTitle')}</p>
          </div>
          <div role="tablist" className="flex gap-1">
            {(['expected_grad', 'newly_admitted'] as SocialAllowanceStage[]).map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={stage === s}
                onClick={() => setStage(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded ${
                  stage === s ? 'bg-pair-600 text-white' : 'bg-gray-100 text-[#737477] hover:bg-gray-200'
                }`}
              >
                {t(`social.stage.${s}`)}
              </button>
            ))}
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIAL_ALLOWANCE_CHECKLISTS
            .find((g) => g.stage === stage)!
            .categories.map((cat) => (
              <article key={cat.category} className="rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold mb-2">
                  {t(`social.cat.${cat.category}` as const)}
                </h3>
                <ol className="space-y-1.5 text-xs">
                  {cat.documents.map((doc, idx) => (
                    <li key={doc} className="flex items-start gap-2">
                      <span className="font-mono text-[10px] text-[#737477] w-4 text-end shrink-0">
                        {idx + 1}.
                      </span>
                      <span className="text-[#222]">{t(`social.docs.${doc}` as const)}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
        </div>
      </section>

      {isLoading || !apps ? (
        <SkeletonTable rows={5} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState title={t('common.noData')} />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const issues = app.documents.filter((d) => d.quality === 'issue').length;
            return (
              <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs font-mono text-[#737477]">{app.application_no}</p>
                    <p className="font-semibold mt-1">{locale === 'ar' ? app.student_name_ar : app.student_name_en}</p>
                    <p className="text-xs text-[#737477]">{app.student_id} · {t(`social.cat.${app.category}`)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/social-allowance/${app.id}`}
                      className="px-2.5 py-1 bg-pair-600 text-white rounded-lg text-xs font-medium hover:bg-pair-700"
                    >
                      {t('social.openDetail')}
                    </Link>
                    <button
                      type="button"
                      onClick={() => downloadBundle(app)}
                      disabled={busy === app.id + 'pdf'}
                      className="px-2.5 py-1 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                      {t('social.downloadPdf')}
                    </button>
                    <StatusBadge status={toLifecycle(app.status)} />
                    {app.sent_to_puc && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-pair-50 text-pair-700">
                        {t('social.sentToPuc')}
                      </span>
                    )}
                  </div>
                </div>

                <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-4">
                  {app.documents.map((d, idx) => {
                    const source = SOCIAL_DOC_SOURCE[d.key];
                    return (
                      <li key={d.key} className="text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-semibold text-[#737477] tabular-nums shrink-0 w-4 text-center">
                              {idx + 1}
                            </span>
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              d.quality === 'ok' ? 'bg-oasis-500' : 'bg-danger-500'
                            }`} />
                            <span className="truncate">{t(`social.docs.${d.key}`)}</span>
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-[#737477]">
                              {d.quality === 'ok' ? t('social.qualityOk') : t('social.qualityIssue')}
                            </span>
                            {d.quality === 'ok' && (
                              <button
                                type="button"
                                onClick={() => { setRejectDoc({ applicationId: app.id, key: d.key }); setRejectChoice(''); }}
                                className="text-[11px] text-danger-700 hover:underline"
                              >
                                {t('social.rejectDocReason')}
                              </button>
                            )}
                          </div>
                        </div>
                        {source && (
                          <p className="text-[11px] text-[#737477] mt-0.5 ms-7">
                            {t('social.howToFind')}: {t(`social.source.${source}`)}
                          </p>
                        )}
                        {d.reject_reason && (
                          <p className="text-[11px] text-danger-700 mt-0.5 ms-7">
                            {t(`social.rejectReason.${d.reject_reason}`)}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ol>

                <div className="flex flex-wrap gap-2">
                  {app.status === 'pending' && (
                    <button
                      onClick={() => setStatus(app.id, 'in_progress')}
                      disabled={busy === app.id + 'in_progress' || issues > 0}
                      className="px-3 py-1.5 bg-pair-600 text-white rounded-lg text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
                    >
                      {t('requests.markInProgress')}
                    </button>
                  )}
                  {app.status === 'in_progress' && (
                    <button
                      onClick={() => setStatus(app.id, 'completed')}
                      disabled={busy === app.id + 'completed'}
                      className="px-3 py-1.5 bg-oasis-500 text-white rounded-lg text-sm font-medium hover:bg-oasis-600 disabled:opacity-50"
                    >
                      {t('requests.markCompleted')}
                    </button>
                  )}
                  {!app.sent_to_puc && app.status !== 'rejected' && (
                    <button
                      onClick={() => markPuc(app.id)}
                      disabled={busy === app.id + 'puc'}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      {t('social.markSentToPuc')}
                    </button>
                  )}
                  {app.status !== 'completed' && app.status !== 'rejected' && (
                    <button
                      onClick={() => setRejectAppTarget(app)}
                      disabled={busy === app.id + 'rejected'}
                      className="px-3 py-1.5 border border-danger-200 text-danger-700 rounded-lg text-sm hover:bg-danger-50 disabled:opacity-50"
                    >
                      {t('admissions.reject')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                    name="social-reject-reason"
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
                disabled={!rejectChoice}
                className="px-3 py-1.5 bg-danger-500 text-white rounded-lg text-sm font-medium hover:bg-danger-600 disabled:opacity-50"
              >
                {t('social.rejectDocReason')}
              </button>
            </div>
          </div>
        </div>
      )}

      <RejectReasonDialog
        open={rejectAppTarget !== null}
        title={t('admissions.reject')}
        subject={rejectAppTarget
          ? `${rejectAppTarget.application_no} · ${locale === 'ar' ? rejectAppTarget.student_name_ar : rejectAppTarget.student_name_en}`
          : undefined}
        busy={busy === (rejectAppTarget?.id ?? '') + 'rejected'}
        onConfirm={confirmRejectApplication}
        onCancel={() => setRejectAppTarget(null)}
      />
    </div>
  );
}
