'use client';

import { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { api, type StudentRequest, type RequestStatus } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import { useAuth } from '@/lib/auth';

const STATUS_STYLE: Record<RequestStatus, string> = {
  submitted: 'bg-gold-50 text-gold-700',
  in_progress: 'bg-pair-50 text-pair-700',
  completed: 'bg-oasis-50 text-oasis-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale, dir } = useI18n();
  const { user } = useAuth();
  const [request, setRequest] = useState<StudentRequest | null>(null);
  const [error, setError] = useState(false);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(false);
    api.getRequest(id).then((d) => {
      if (!d) {
        setError(true);
      } else {
        setRequest(d as StudentRequest);
      }
    }).catch(() => setError(true));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const setStatus = async (status: RequestStatus) => {
    if (!request) return;
    setBusy(status);
    try {
      await api.updateRequestStatus(request.id, status);
      const updated: StudentRequest = {
        ...request,
        status,
        workflow: request.workflow.map((s, i) => {
          if (status === 'in_progress' && s.key === 'in_progress') return { ...s, status: 'current' };
          if (status === 'completed' && i === request.workflow.length - 1) return { ...s, status: 'completed', completed_at: new Date().toISOString() };
          if (status === 'completed' && s.status === 'current') return { ...s, status: 'completed', completed_at: new Date().toISOString() };
          return s;
        }),
      };
      setRequest(updated);
      showToast(t('requests.statusUpdated', {
        value: status === 'in_progress' ? t('status.ongoing') : status === 'completed' ? t('status.resolved') : status,
      }));
    } finally {
      setBusy(null);
    }
  };

  const assignToMe = async () => {
    if (!request || !user) return;
    setBusy('assign');
    try {
      await api.assignRequest(request.id, { en: user.name_en, ar: user.name_ar });
      setRequest({ ...request, assigned_to_en: user.name_en, assigned_to_ar: user.name_ar });
    } finally {
      setBusy(null);
    }
  };

  const postComment = async () => {
    if (!request || !comment.trim() || !user) return;
    setBusy('comment');
    try {
      await api.addRequestComment(request.id, comment);
      const newComment = {
        id: `c_${Date.now()}`,
        author_en: user.name_en,
        author_ar: user.name_ar,
        body: comment,
        created_at: new Date().toISOString(),
        internal: true,
      };
      setRequest({ ...request, comments: [...request.comments, newComment] });
      setComment('');
      showToast(t('requests.commentAdded'));
    } finally {
      setBusy(null);
    }
  };

  const notifyStudent = async () => {
    if (!request) return;
    setBusy('notify');
    try {
      await api.notifyRequestStudent(request.id);
      showToast(t('requests.notifySent'));
    } finally {
      setBusy(null);
    }
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  if (error) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={load} retryLabel={t('common.retry')} />;
  if (!request) return <SkeletonPage />;

  return (
    <div dir={dir}>
      <Link href="/requests" className="text-sm text-pair-600 hover:text-pair-700 mb-4 inline-block">
        ← {t('common.back')}
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-mono text-[#737477]">{request.id}</p>
          <h1 className="text-2xl font-bold mt-1">{t(`requestType.${request.type}`)}</h1>
          <p className="text-sm text-[#737477] mt-1">
            {locale === 'ar' ? request.student_name_ar : request.student_name_en}
            {' · '}
            {request.student_id}
            {' · '}
            {fmtDate(request.submitted_at)}
          </p>
        </div>
        <span className={`px-3 py-1 rounded text-sm font-medium ${STATUS_STYLE[request.status]}`}>
          {request.status === 'submitted' ? t('status.pending')
            : request.status === 'in_progress' ? t('status.ongoing')
            : request.status === 'completed' ? t('status.resolved')
            : t('status.inactive')}
        </span>
      </div>

      {toast && (
        <div className="mb-4 bg-oasis-50 border border-oasis-200 rounded-lg px-4 py-2 text-sm text-oasis-700">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Workflow */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">{t('requests.workflow')}</h2>
            <ol className="space-y-4">
              {request.workflow.map((step, i) => (
                <li key={step.key} className="flex items-start gap-3">
                  <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.status === 'completed' ? 'bg-oasis-500 text-white'
                    : step.status === 'current' ? 'bg-pair-500 text-white'
                    : 'bg-gray-100 text-[#737477]'
                  }`}>
                    {step.status === 'completed' ? '✓' : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${
                      step.status === 'pending' ? 'text-[#737477]' : 'text-[#222]'
                    }`}>
                      {locale === 'ar' ? step.label_ar : step.label_en}
                    </p>
                    {step.completed_at && (
                      <p className="text-xs text-[#737477] mt-0.5">{fmtDate(step.completed_at)}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Attachments */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">{t('requests.attachments')}</h2>
            {request.attachments.length === 0 ? (
              <p className="text-sm text-[#737477]">{t('common.noData')}</p>
            ) : (
              <ul className="space-y-2">
                {request.attachments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-gray-50 rounded">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.name}</p>
                      <p className="text-xs text-[#737477]">
                        {a.size_kb} KB · {t('requests.uploadedBy')} {locale === 'ar' ? a.uploaded_by_ar : a.uploaded_by_en}
                      </p>
                    </div>
                    <button className="text-pair-600 hover:text-pair-700 text-xs font-medium shrink-0">
                      {t('requests.openFile')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Comments */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">{t('requests.comments')}</h2>
            <ul className="space-y-3 mb-4">
              {request.comments.map((c) => (
                <li key={c.id} className="bg-gray-50 rounded p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium">{locale === 'ar' ? c.author_ar : c.author_en}</p>
                    <span className="text-xs text-[#737477]">{fmtDate(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-[#222]">{c.body}</p>
                </li>
              ))}
              {request.comments.length === 0 && (
                <p className="text-sm text-[#737477]">{t('common.noData')}</p>
              )}
            </ul>
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('requests.commentPlaceholder')}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={postComment}
                disabled={busy === 'comment' || !comment.trim()}
                className="mt-2 px-4 py-2 bg-pair-600 text-white rounded-lg text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
              >
                {t('requests.postComment')}
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-[#737477] uppercase tracking-wider mb-3">
              {t('requests.assignedTo')}
            </h3>
            {request.assigned_to_en ? (
              <p className="text-sm font-medium">{locale === 'ar' ? request.assigned_to_ar : request.assigned_to_en}</p>
            ) : (
              <p className="text-sm italic text-[#737477] mb-3">{t('requests.unassigned')}</p>
            )}
            <button
              onClick={assignToMe}
              disabled={busy === 'assign'}
              className="mt-3 w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {request.assigned_to_en ? t('requests.reassign') : t('requests.assignToMe')}
            </button>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-[#737477] uppercase tracking-wider mb-3">
              {t('requests.paymentStatus')}
            </h3>
            <p className="text-sm font-medium">
              {request.payment_status === 'paid' ? t('requests.paymentPaid')
                : request.payment_status === 'pending' ? t('requests.paymentPending')
                : t('requests.paymentNotRequired')}
            </p>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-2">
            <h3 className="text-sm font-semibold text-[#737477] uppercase tracking-wider mb-2">
              {t('common.actions')}
            </h3>
            {request.status !== 'in_progress' && request.status !== 'completed' && (
              <button
                onClick={() => setStatus('in_progress')}
                disabled={busy !== null}
                className="w-full px-3 py-2 bg-pair-600 text-white rounded-lg text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
              >
                {t('requests.markInProgress')}
              </button>
            )}
            {request.status !== 'completed' && (
              <button
                onClick={() => setStatus('completed')}
                disabled={busy !== null}
                className="w-full px-3 py-2 bg-oasis-500 text-white rounded-lg text-sm font-medium hover:bg-oasis-600 disabled:opacity-50"
              >
                {t('requests.markCompleted')}
              </button>
            )}
            <button
              onClick={notifyStudent}
              disabled={busy !== null}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {t('requests.notifyStudent')}
            </button>
            {request.status !== 'completed' && request.status !== 'cancelled' && (
              <button
                onClick={() => setStatus('cancelled')}
                disabled={busy !== null}
                className="w-full px-3 py-2 border border-danger-200 text-danger-700 rounded-lg text-sm hover:bg-danger-50 disabled:opacity-50"
              >
                {t('requests.cancelRequest')}
              </button>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
