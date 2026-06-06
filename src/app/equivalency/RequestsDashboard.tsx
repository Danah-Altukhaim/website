'use client';

import { useI18n } from '@/lib/i18n';
import EmptyState from '@/components/EmptyState';
import {
  useEquivalencyRequests,
  removeEquivalencyRequest,
  type EquivalencyRequestStage,
  type EquivalencyRequestRecord,
} from './requestsStore';

// Ordered pipeline stages, mirroring the workflow stepper. `step` is the 1-based
// position used in the stepper (Documents = 1), so the dashboard reads the same.
const STAGE_FLOW: { stage: EquivalencyRequestStage; step: number; tone: string }[] = [
  { stage: 'form', step: 2, tone: 'bg-pair-50 text-pair-700 border-pair-200' },
  { stage: 'vp', step: 3, tone: 'bg-gold-50 text-gold-700 border-gold-200' },
  { stage: 'student', step: 4, tone: 'bg-gold-50 text-gold-700 border-gold-200' },
  { stage: 'done', step: 4, tone: 'bg-oasis-50 text-oasis-700 border-oasis-200' },
];

function StageBadge({ stage }: { stage: EquivalencyRequestStage }) {
  const { t } = useI18n();
  const meta = STAGE_FLOW.find((s) => s.stage === stage) ?? STAGE_FLOW[0];
  const label = stage === 'done' ? t('eqwf.doneTitle') : t(`eqwf.step.${stage}`);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border ${meta.tone}`}>
      <span className="tabular-nums" dir="ltr">{stage === 'done' ? '✓' : meta.step}</span>
      {label}
    </span>
  );
}

// Compact progress bar so reviewers can see at a glance how far each request has
// moved through the four stages.
function StageProgress({ stage }: { stage: EquivalencyRequestStage }) {
  const order: EquivalencyRequestStage[] = ['form', 'vp', 'student', 'done'];
  const idx = order.indexOf(stage);
  return (
    <div className="flex items-center gap-1" dir="ltr">
      {order.map((s, i) => (
        <span
          key={s}
          className={`h-1.5 w-6 rounded-full ${
            i <= idx ? (stage === 'done' ? 'bg-oasis-500' : 'bg-pair-600') : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function RequestsDashboard() {
  const { t, dir } = useI18n();
  const requests = useEquivalencyRequests();

  const sourceLabel = (r: EquivalencyRequestRecord) => {
    if (r.source === 'private') {
      return r.sourceInstitution || t('eqwf.sourcePrivate');
    }
    return t(r.source === 'public' ? 'eqwf.sourcePublic' : 'eqwf.sourcePaaet');
  };

  return (
    <div dir={dir}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm text-[#737477]">{t('eqwf.dashDesc')}</p>
        <span className="text-xs text-[#737477]">
          {requests.length} {t('eqwf.dashCount')}
        </span>
      </div>

      {requests.length === 0 ? (
        <EmptyState title={t('eqwf.dashEmpty')} description={t('eqwf.dashEmptyDesc')} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#737477] border-b">
                <th className="px-4 py-3 text-start font-medium">{t('eqwf.dashApplicant')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('eqwf.dashMajor')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('eqwf.dashSource')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('eqwf.dashCredits')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('eqwf.dashStage')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('eqwf.dashProgress')}</th>
                <th className="px-4 py-3 text-end font-medium">{t('equivalency.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.applicant || t('eqwf.unnamedApplicant')}</p>
                    {r.civilId && (
                      <p className="text-xs text-[#737477]" dir="ltr">{r.civilId}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p>{r.major || <span className="text-[#737477]">—</span>}</p>
                    {r.secondMajor && (
                      <p className="text-xs text-[#737477]">+ {r.secondMajor}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#737477]">{sourceLabel(r)}</td>
                  <td className="px-4 py-3 text-[#737477]" dir="ltr">
                    {r.totalCredits} {t('eqwf.creditUnit')}
                    <span className="text-xs"> · {r.courseCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <StageBadge stage={r.stage} />
                      {r.blocked && r.stage !== 'done' && (
                        <span className="inline-flex w-fit items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-danger-50 text-danger-700">
                          {t('eqwf.dashBlocked')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StageProgress stage={r.stage} />
                  </td>
                  <td className="px-4 py-3 text-end whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => removeEquivalencyRequest(r.id)}
                      className="px-2.5 py-1 rounded border border-gray-300 text-xs font-medium text-danger-700 hover:bg-danger-50"
                    >
                      {t('eqwf.dashRemove')}
                    </button>
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
