'use client';

import { useEffect, useState, useCallback } from 'react';
import Card from '@/components/Card';
import { SkeletonPage } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

interface AIData {
  total_conversations: number;
  avg_satisfaction: number;
  escalation_rate: number;
  avg_response_time_sec: number;
  conversations_today: number;
  topic_distribution: { topic_en: string; topic_ar: string; count: number; percentage: number }[];
  escalation_reasons: { reason_en: string; reason_ar: string; count: number; percentage: number }[];
  satisfaction_breakdown: { rating: number; count: number; percentage: number }[];
  recent_escalations: { id: string; student_en: string; student_ar: string; topic_en: string; topic_ar: string; timestamp: string; status: string }[];
}

const STATUS_LABELS_AR: Record<string, string> = {
  pending: 'قيد الانتظار',
  assigned: 'مُسند',
  resolved: 'مُنجز',
};

export default function AIMonitoringPage() {
  const { t, dir, locale } = useI18n();
  const pick = (en: string, ar: string) => (locale === 'ar' ? ar : en);
  const [data, setData] = useState<AIData | null>(null);
  const [error, setError] = useState(false);

  const loadData = useCallback(() => {
    setError(false);
    api.getAIMonitoring()
      .then((d) => setData(d as AIData))
      .catch(() => setError(true));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (error) return <ErrorState title={t('common.error')} description={t('common.errorDescription')} onRetry={loadData} retryLabel={t('common.retry')} />;
  if (!data) return <SkeletonPage />;

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-6">{t('ai.title')}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card title={t('ai.totalConversations')} value={data.total_conversations.toLocaleString()} />
        <Card title={t('ai.today')} value={data.conversations_today} />
        <Card title={t('ai.avgSatisfaction')} value={`${data.avg_satisfaction}/5`} />
        <Card title={t('ai.escalationRate')} value={`${data.escalation_rate}%`} />
        <Card title={t('ai.avgResponse')} value={`${data.avg_response_time_sec}s`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">{t('ai.topicDistribution')}</h2>
          <div className="space-y-3">
            {data.topic_distribution.map((tp) => (
              <div key={tp.topic_en}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{pick(tp.topic_en, tp.topic_ar)}</span>
                  <span className="text-gray-400">{tp.count.toLocaleString()} ({tp.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-pair-500 h-2 rounded-full" style={{ width: `${tp.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">{t('ai.satisfactionBreakdown')}</h2>
          <div className="space-y-3">
            {data.satisfaction_breakdown.map((s) => (
              <div key={s.rating} className="flex items-center gap-3">
                <span className="w-8 text-sm font-medium text-gray-600">{s.rating}/5</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.rating >= 4 ? 'bg-oasis-500' : s.rating === 3 ? 'bg-gold-500' : 'bg-danger-500'}`}
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-20 text-end">{s.count.toLocaleString()} ({s.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">{t('ai.escalationReasons')}</h2>
          <div className="space-y-3">
            {data.escalation_reasons.map((r) => (
              <div key={r.reason_en} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{pick(r.reason_en, r.reason_ar)}</span>
                <div>
                  <span className="font-medium">{r.count}</span>
                  <span className="text-gray-400 text-xs ms-2">({r.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">{t('ai.recentEscalations')}</h2>
          <div className="space-y-3">
            {data.recent_escalations.map((e) => (
              <div key={e.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{pick(e.student_en, e.student_ar)}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    e.status === 'resolved' ? 'bg-oasis-100 text-oasis-700' :
                    e.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                    'bg-gold-100 text-gold-700'
                  }`}>{locale === 'ar' ? STATUS_LABELS_AR[e.status] || e.status : e.status}</span>
                </div>
                <p className="text-sm text-gray-600">{pick(e.topic_en, e.topic_ar)}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(e.timestamp).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-US')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
