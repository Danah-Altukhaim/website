'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import type {
  StudentRecord, DataSource, EnrollmentStatus, WarningSeverity, AppChannel,
} from '@/lib/student-records';

const statusColor = (s: EnrollmentStatus) => {
  switch (s) {
    case 'enrolled': return 'bg-oasis-100 text-oasis-700';
    case 'probation': return 'bg-gold-100 text-gold-700';
    case 'suspended': return 'bg-danger-100 text-danger-700';
    case 'withdrawn': return 'bg-gray-100 text-gray-600';
    default: return 'bg-blue-100 text-blue-700';
  }
};

const severityColor = (s: WarningSeverity) => {
  switch (s) {
    case 'critical': return 'bg-danger-100 text-danger-700';
    case 'warning': return 'bg-gold-100 text-gold-700';
    default: return 'bg-blue-100 text-blue-700';
  }
};

const rateColor = (r: number) =>
  r >= 80 ? 'text-oasis-600' : r >= 60 ? 'text-gold-600' : 'text-danger-600';
const rateBar = (r: number) =>
  r >= 80 ? 'bg-oasis-500' : r >= 60 ? 'bg-gold-500' : 'bg-danger-500';
const gpaColor = (g: number) =>
  g >= 3 ? 'text-oasis-600' : g >= 2 ? 'text-gold-600' : 'text-danger-600';

const sourceStyle: Record<DataSource, string> = {
  sis: 'bg-pair-50 text-pair-700 border border-pair-100',
  lms: 'bg-blue-50 text-blue-700 border border-blue-100',
  app: 'bg-oasis-50 text-oasis-700 border border-oasis-100',
};

export default function StudentRecordPage() {
  const params = useParams();
  const { t, locale, dir } = useI18n();
  const isAr = locale === 'ar';
  const id = params.id as string;

  const { data, isError, refetch, isLoading } = useQuery<StudentRecord | null>({
    queryKey: ['students', 'record', id],
    queryFn: () => api.getStudentRecord(id) as Promise<StudentRecord | null>,
  });

  if (isError) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={() => refetch()} retryLabel={t('common.retry')} />;
  if (isLoading) return <SkeletonPage />;
  if (!data) {
    return (
      <div dir={dir}>
        <Link href="/students" className="text-sm text-pair-600 hover:underline mb-4 inline-block">
          {isAr ? '→' : '←'} {t('students.backToDirectory')}
        </Link>
        <EmptyState title={t('students.notFound')} />
      </div>
    );
  }

  const s = data;
  const name = isAr ? s.name_ar : s.name_en;
  const thAlign = isAr ? 'text-right' : 'text-left';
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(isAr ? 'ar-KW' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleDateString(isAr ? 'ar-KW' : 'en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  const kwd = (n: number) => `${n.toLocaleString(isAr ? 'ar-KW' : 'en-GB')} KWD`;

  const SourceBadge = ({ source }: { source: DataSource }) => (
    <span className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded ${sourceStyle[source]}`}>
      {t(`students.source.${source}`)}
    </span>
  );

  const SectionHeader = ({ title, source }: { title: string; source: DataSource }) => (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <SourceBadge source={source} />
    </div>
  );

  const activeHolds = s.holds.filter((h) => h.active);

  return (
    <div dir={dir}>
      <Link href="/students" className="text-sm text-pair-600 hover:underline mb-4 inline-block">
        {isAr ? '→' : '←'} {t('students.backToDirectory')}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-pair-500 text-white flex items-center justify-center text-xl font-bold shrink-0">
            {s.name_en.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">{name}</h1>
            <p className="text-gray-500 text-sm">
              {isAr ? s.name_en : s.name_ar} · #{s.student_number}
            </p>
            <p className="text-gray-500 text-sm">{isAr ? s.program_ar : s.program_en}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded text-sm font-medium ${statusColor(s.enrollment_status)}`}>
            {t(`students.status.${s.enrollment_status}`)}
          </span>
          <span className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-700">
            {isAr ? s.academic_standing_ar : s.academic_standing_en}
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">{t('students.cumulativeGpa')}</p>
          <p className={`text-2xl font-bold ${gpaColor(s.gpa_cumulative)}`}>{s.gpa_cumulative.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">{t('students.termGpa')}</p>
          <p className={`text-2xl font-bold ${gpaColor(s.gpa_term)}`}>{s.gpa_term.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">{t('students.credits')}</p>
          <p className="text-2xl font-bold">{s.credits_completed}<span className="text-sm text-gray-400 font-normal">/{s.credits_required}</span></p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full bg-pair-500" style={{ width: `${Math.min(100, (s.credits_completed / s.credits_required) * 100)}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">{t('students.balance')}</p>
          <p className={`text-2xl font-bold ${s.finance.balance > 0 ? 'text-danger-600' : 'text-oasis-600'}`}>{kwd(s.finance.balance)}</p>
        </div>
      </div>

      {/* AI Summary (shell) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-pair-500 text-white flex items-center justify-center text-sm shrink-0">✦</span>
            <h2 className="text-lg font-semibold">{t('students.sectionAiSummary')}</h2>
            <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded bg-pair-50 text-pair-700 border border-pair-100">
              {t('students.aiSummaryBadge')}
            </span>
          </div>
          <button
            type="button"
            disabled
            className="text-sm px-3 py-1.5 rounded-lg bg-pair-500 text-white font-medium opacity-60 cursor-not-allowed"
          >
            {t('students.aiSummaryGenerate')}
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-5">{t('students.aiSummaryEmpty')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {([
            'aiSummaryOverview', 'aiSummaryStrengths', 'aiSummaryRisks', 'aiSummaryActions',
          ] as const).map((key) => (
            <div key={key}>
              <p className="text-xs font-semibold text-gray-500 mb-2">{t(`students.${key}`)}</p>
              <div className="space-y-2">
                <div className="h-3 rounded bg-gray-100 animate-pulse w-full" />
                <div className="h-3 rounded bg-gray-100 animate-pulse w-11/12" />
                <div className="h-3 rounded bg-gray-100 animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-6">{t('students.aiSummaryDisclaimer')}</p>
      </div>

      {/* Identity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <SectionHeader title={t('students.sectionAcademic')} source="sis" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 text-sm">
          <div><p className="text-gray-500 text-xs">{t('students.civilId')}</p><p className="font-medium">{s.national_id}</p></div>
          <div><p className="text-gray-500 text-xs">{t('students.email')}</p><p className="font-medium break-all">{s.email}</p></div>
          <div><p className="text-gray-500 text-xs">{t('students.phone')}</p><p className="font-medium" dir="ltr">{s.phone}</p></div>
          <div><p className="text-gray-500 text-xs">{t('students.cohort')}</p><p className="font-medium">{s.cohort_year}</p></div>
          <div><p className="text-gray-500 text-xs">{t('students.advisor')}</p><p className="font-medium">{isAr ? s.advisor_ar : s.advisor_en}</p></div>
          <div><p className="text-gray-500 text-xs">{t('students.funding')}</p><p className="font-medium">{t(`students.funding.${s.funding}`)}</p></div>
          <div className="col-span-2"><p className="text-gray-500 text-xs">{t('students.address')}</p><p className="font-medium">{isAr ? s.address_ar : s.address_en}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* GPA History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader title={t('students.sectionGpaHistory')} source="sis" />
          <table className="w-full text-sm">
            <thead>
              <tr className={`${thAlign} text-gray-500 border-b`}>
                <th className="pb-2 font-medium">{t('students.term')}</th>
                <th className="pb-2 font-medium">{t('students.colGpa')}</th>
                <th className="pb-2 font-medium">{t('students.credits')}</th>
                <th className="pb-2 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody>
              {s.gpa_history.map((g) => (
                <tr key={g.term} className="border-b border-gray-50">
                  <td className="py-2">{g.term}</td>
                  <td className={`py-2 font-medium ${gpaColor(g.gpa)}`}>{g.gpa.toFixed(2)}</td>
                  <td className="py-2">{g.credits}</td>
                  <td className="py-2 text-xs text-gray-500">{isAr ? g.status_ar : g.status_en}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Transcript */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader title={t('students.sectionTranscript')} source="sis" />
          <table className="w-full text-sm">
            <thead>
              <tr className={`${thAlign} text-gray-500 border-b`}>
                <th className="pb-2 font-medium">{t('students.course')}</th>
                <th className="pb-2 font-medium">{t('students.credits')}</th>
                <th className="pb-2 font-medium">{t('students.grade')}</th>
                <th className="pb-2 font-medium">{t('students.points')}</th>
              </tr>
            </thead>
            <tbody>
              {s.transcript.map((c, i) => (
                <tr key={`${c.course_code}-${i}`} className="border-b border-gray-50">
                  <td className="py-2">
                    <span className="font-medium">{c.course_code}</span>
                    <span className="block text-xs text-gray-400">{isAr ? c.course_ar : c.course_en} · {c.term}</span>
                  </td>
                  <td className="py-2">{c.credits}</td>
                  <td className="py-2 font-semibold">{c.grade}</td>
                  <td className="py-2 text-gray-500">{c.points.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warnings & Holds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader title={t('students.sectionWarnings')} source="sis" />
          {s.warnings.length === 0 ? (
            <p className="text-sm text-gray-400">{t('students.noWarnings')}</p>
          ) : (
            <div className="space-y-3">
              {s.warnings.map((w) => (
                <div key={w.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-sm">{isAr ? w.type_ar : w.type_en}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityColor(w.severity)}`}>
                      {t(`students.warningStatus.${w.status}`)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{isAr ? w.detail_ar : w.detail_en}</p>
                  <p className="text-xs text-gray-400 mt-1">{w.id} · {w.term} · {fmtDate(w.date)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader title={t('students.sectionHolds')} source="sis" />
          {activeHolds.length === 0 ? (
            <p className="text-sm text-gray-400">{t('students.noHolds')}</p>
          ) : (
            <div className="space-y-3">
              {s.holds.map((h, i) => (
                <div key={i} className={`border rounded-lg p-3 ${h.active ? 'border-danger-200 bg-danger-50' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-sm">{isAr ? h.type_ar : h.type_en}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${h.active ? 'bg-danger-100 text-danger-700' : 'bg-gray-100 text-gray-600'}`}>
                      {h.active ? t('students.holdActive') : t('students.holdCleared')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{isAr ? h.reason_ar : h.reason_en}</p>
                  <p className="text-xs text-gray-400 mt-1">{t('students.placedBy')}: {isAr ? h.placed_by_ar : h.placed_by_en} · {fmtDate(h.date)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LMS Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <SectionHeader title={t('students.sectionLms')} source="lms" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {s.lms_courses.map((c) => (
            <div key={c.course_code} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{c.course_code}</span>
                <span className="text-xs text-gray-400">{t('students.lastAccess')}: {fmtDateTime(c.last_access)}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{isAr ? c.course_ar : c.course_en}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className={`text-lg font-bold ${rateColor(c.attendance_rate)}`}>{c.attendance_rate}%</p>
                  <p className="text-[11px] text-gray-400">{t('students.attendance')}</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{c.assignments_submitted}/{c.assignments_total}</p>
                  <p className="text-[11px] text-gray-400">{t('students.assignments')}</p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${rateColor(c.current_score)}`}>{c.current_score}%</p>
                  <p className="text-[11px] text-gray-400">{t('students.currentScore')}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                <div className={`h-1.5 rounded-full ${rateBar(c.attendance_rate)}`} style={{ width: `${c.attendance_rate}%` }} />
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3">
                <div className="grid grid-cols-2 gap-3 text-center mb-3">
                  <div>
                    <p className={`text-lg font-bold ${rateColor(c.midterm_score)}`}>{c.midterm_score}</p>
                    <p className="text-[11px] text-gray-400">{t('students.midtermGrade')}</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${rateColor(c.final_score)}`}>{c.final_score}</p>
                    <p className="text-[11px] text-gray-400">{t('students.finalGrade')}</p>
                  </div>
                </div>
                <p className="text-[11px] font-medium text-gray-500 mb-1.5">{t('students.scoreBreakdown')}</p>
                <div className="space-y-1">
                  {c.score_breakdown.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{isAr ? b.label_ar : b.label_en}</span>
                      <span className="flex items-center gap-2">
                        <span className={`font-medium ${rateColor((b.score / b.max) * 100)}`}>{b.score}/{b.max}</span>
                        <span className="text-gray-400 tabular-nums">{b.weight}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Hub App Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader title={t('students.sectionApp')} source="app" />
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-gray-50 rounded-lg py-3">
              <p className="text-lg font-bold">{s.app_logins_30d}</p>
              <p className="text-[11px] text-gray-400">{t('students.logins30d')}</p>
            </div>
            <div className="bg-gray-50 rounded-lg py-3">
              <p className="text-lg font-bold">{s.ai_conversations}</p>
              <p className="text-[11px] text-gray-400">{t('students.aiChats')}</p>
            </div>
            <div className="bg-gray-50 rounded-lg py-3">
              <p className="text-xs font-bold mt-1">{fmtDate(s.app_last_login)}</p>
              <p className="text-[11px] text-gray-400">{t('students.lastLogin')}</p>
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-2">{t('students.activityTimeline')}</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {s.app_timeline.map((e, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-xs text-gray-400 w-24 shrink-0">{fmtDateTime(e.date)}</span>
                <span className="text-gray-600">{isAr ? e.action_ar : e.action_en}</span>
                <span className="text-[10px] text-gray-300 ms-auto shrink-0 self-center">{t(`students.channel.${e.channel}` as const)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Service Requests */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionHeader title={t('students.sectionRequests')} source="app" />
          {s.requests.length === 0 ? (
            <p className="text-sm text-gray-400">{t('students.noRequests')}</p>
          ) : (
            <div className="space-y-2">
              {s.requests.map((r) => (
                <Link key={r.id} href="/requests" className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium">{isAr ? r.type_ar : r.type_en}</p>
                    <p className="text-xs text-gray-400">{r.id} · {fmtDate(r.submitted_at)}</p>
                  </div>
                  <span className="text-xs text-gray-500">{t(`students.requestStatus.${r.status}`)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Finance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SectionHeader title={t('students.sectionFinance')} source="sis" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm items-end">
          <div><p className="text-gray-500 text-xs">{t('students.totalPayable')}</p><p className="font-semibold">{kwd(s.finance.total_payable)}</p></div>
          <div><p className="text-gray-500 text-xs">{t('students.paid')}</p><p className="font-semibold text-oasis-600">{kwd(s.finance.paid_amount)}</p></div>
          <div><p className="text-gray-500 text-xs">{t('students.balance')}</p><p className={`font-semibold ${s.finance.balance > 0 ? 'text-danger-600' : 'text-oasis-600'}`}>{kwd(s.finance.balance)}</p></div>
          <div><p className="text-gray-500 text-xs">{t('students.lateFee')}</p><p className="font-semibold">{kwd(s.finance.late_fee)}</p></div>
          <div>
            <p className="text-gray-500 text-xs">{t('students.financeStanding')}</p>
            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium ${s.finance.standing === 'cleared' ? 'bg-oasis-100 text-oasis-700' : s.finance.standing === 'hold' ? 'bg-danger-100 text-danger-700' : 'bg-gold-100 text-gold-700'}`}>
              {t(`students.standing.${s.finance.standing}`)}
            </span>
          </div>
        </div>
        <Link href="/finance" className="text-sm text-pair-600 hover:underline mt-4 inline-block">
          {t('students.viewInFinance')} {isAr ? '←' : '→'}
        </Link>
      </div>
    </div>
  );
}
