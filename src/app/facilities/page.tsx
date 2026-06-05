'use client';

import { useI18n } from '@/lib/i18n';
import EmptyState from '@/components/EmptyState';

export default function FacilitiesPage() {
  const { t, dir } = useI18n();

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-1">{t('facilities.title')}</h1>
      <p className="text-sm text-[#737477] mb-4">{t('facilities.subtitle')}</p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <EmptyState
          title={t('facilities.comingSoon')}
          description={t('facilities.comingSoonDescription')}
        />
      </div>
    </div>
  );
}
