'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { EquivalencyEntry, PaaetEquivalencyEntry } from '@masari/shared';
import { useI18n } from '@/lib/i18n';
import { SkeletonPage } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import EquivalencyWorkflow from './EquivalencyWorkflow';
import RequestsDashboard from './RequestsDashboard';

type EquivalencyData = {
  entries: EquivalencyEntry[];
  paaet_entries: PaaetEquivalencyEntry[];
  rules: string[];
};

type College = 'CCK' | 'PAAET';

// One course from either college, flattened into a single searchable row.
interface CourseRow {
  id: string;
  college: College;
  name: string;
  code: string;
  credit: string;
  cckMajor: string;
  paaetProgram: string;
  remarks: string | null;
  haystack: string;
}

export default function EquivalencyPage() {
  const { t, dir } = useI18n();
  const { data, isError, isLoading, refetch } = useQuery<EquivalencyData>({
    queryKey: ['equivalency'],
    queryFn: () => api.getEquivalency() as Promise<EquivalencyData>,
  });
  const [search, setSearch] = useState('');
  // Honour a `?tab=` hint so links back from a request edit page (which point at
  // `/equivalency?tab=tracker`) reopen the tracker rather than the default tab.
  const [tab, setTab] = useState<'request' | 'tracker' | 'courses'>(() => {
    if (typeof window === 'undefined') return 'request';
    const param = new URLSearchParams(window.location.search).get('tab');
    return param === 'tracker' || param === 'courses' ? param : 'request';
  });

  // Flatten both sheets into one list. Every course keeps the pathway it
  // belongs to (PAAET diploma -> CCK major), which is the direct transfer
  // information the source data actually contains.
  const rows = useMemo<CourseRow[]>(() => {
    if (!data) return [];
    const cck: CourseRow[] = data.entries.map((e, i) => {
      const name = e.cck_course_name || e.cck_code_raw || e.cck_code || '';
      const code = e.cck_code_raw ?? e.cck_code ?? '';
      return {
        id: `cck:${i}`,
        college: 'CCK',
        name,
        code,
        credit: e.cck_credit != null ? String(e.cck_credit) : '',
        cckMajor: e.cck_major,
        paaetProgram: e.paaet_program,
        remarks: e.remarks,
        haystack: `${name} ${code} ${e.cck_major} ${e.paaet_program}`.toLowerCase(),
      };
    });
    const paaet: CourseRow[] = data.paaet_entries.map((e, i) => {
      const name = e.paaet_course_name || e.paaet_code || '';
      return {
        id: `paaet:${i}`,
        college: 'PAAET',
        name,
        code: e.paaet_code,
        credit: e.credit || '',
        cckMajor: e.cck_major,
        paaetProgram: e.paaet_program,
        remarks: e.remarks,
        haystack: `${name} ${e.paaet_code} ${e.cck_major} ${e.paaet_program}`.toLowerCase(),
      };
    });
    return [...cck, ...paaet].sort(
      (a, b) =>
        a.cckMajor.localeCompare(b.cckMajor) ||
        a.college.localeCompare(b.college) ||
        a.name.localeCompare(b.name),
    );
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.haystack.includes(q));
  }, [rows, search]);

  if (isError)
    return (
      <ErrorState
        title={t('common.error')}
        description={t('common.errorDescription')}
        onRetry={() => refetch()}
        retryLabel={t('common.retry')}
      />
    );
  if (isLoading || !data) return <SkeletonPage />;

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-1">{t('equivalency.title')}</h1>
      <p className="text-sm text-[#737477] mb-4">{t('equivalency.subtitle')}</p>

      {/* Tabs: the staged equivalency request (Equivalency Screen Update doc) and
          the read-only list of all CCK/PAAET courses. */}
      <div className="flex items-center gap-1 mb-5 border-b border-gray-200">
        {([
          { key: 'request', label: 'equivalency.tabRequest' },
          { key: 'tracker', label: 'equivalency.tabTracker' },
          { key: 'courses', label: 'equivalency.tabCourses' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-3 py-2 -mb-px text-sm font-medium border-b-2 ${
              tab === key
                ? 'border-pair-600 text-pair-700'
                : 'border-transparent text-[#737477] hover:text-[#222]'
            }`}
          >
            {t(label)}
          </button>
        ))}
      </div>

      {tab === 'request' ? (
        <EquivalencyWorkflow entries={data.entries} paaetEntries={data.paaet_entries} />
      ) : tab === 'tracker' ? (
        <RequestsDashboard />
      ) : (
        <CourseList
          search={search}
          setSearch={setSearch}
          filtered={filtered}
          t={t}
        />
      )}
    </div>
  );
}

// Fields a staff member can edit on a course row.
interface CourseDraft {
  name: string;
  code: string;
  credit: string;
  paaetProgram: string;
  cckMajor: string;
  remarks: string;
}

const inputCls =
  'w-full px-2 py-1 rounded border border-gray-300 text-sm focus:outline-none focus:border-pair-600';

function CourseList({
  search,
  setSearch,
  filtered,
  t,
}: {
  search: string;
  setSearch: (v: string) => void;
  filtered: CourseRow[];
  t: (key: string) => string;
}) {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CourseDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const startEdit = (r: CourseRow) => {
    setEditingId(r.id);
    setDraft({
      name: r.name,
      code: r.code,
      credit: r.credit,
      paaetProgram: r.paaetProgram,
      cckMajor: r.cckMajor,
      remarks: r.remarks ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const setField = (key: keyof CourseDraft, value: string) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const save = async (r: CourseRow) => {
    if (!draft) return;
    const index = Number(r.id.split(':')[1]);
    setSaving(true);
    try {
      const res = await api.updateEquivalencyEntry(r.college, index, draft);
      qc.setQueryData<EquivalencyData>(['equivalency'], (prev) => {
        if (!prev) return prev;
        if (res.college === 'CCK') {
          const entries = prev.entries.slice();
          entries[index] = res.entry as EquivalencyEntry;
          return { ...prev, entries };
        }
        const paaet_entries = prev.paaet_entries.slice();
        paaet_entries[index] = res.entry as PaaetEquivalencyEntry;
        return { ...prev, paaet_entries };
      });
      showToast(t('equivalency.saved'), true);
      cancelEdit();
    } catch {
      showToast(t('equivalency.saveFailed'), false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Single search across both colleges: course name, code, major, or diploma */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('equivalency.searchAll')}
          className="px-3 py-2 rounded border border-gray-300 text-sm flex-1 min-w-[240px]"
        />
        <span className="text-xs text-[#737477]">
          {filtered.length} {t('equivalency.coursesCount')}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t('equivalency.noResults')} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#737477] border-b">
                <th className="px-4 py-3 text-start font-medium">{t('equivalency.course')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('equivalency.college')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('equivalency.credit')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('equivalency.pathway')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('equivalency.remarks')}</th>
                <th className="px-4 py-3 text-end font-medium">{t('equivalency.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const editing = editingId === r.id && draft;
                return (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0 align-top">
                    <td className="px-4 py-3">
                      {editing ? (
                        <div className="flex flex-col gap-1.5">
                          <input
                            className={inputCls}
                            value={draft.name}
                            placeholder={t('equivalency.namePlaceholder')}
                            onChange={(e) => setField('name', e.target.value)}
                          />
                          <input
                            className={inputCls}
                            dir="ltr"
                            value={draft.code}
                            placeholder={t('equivalency.codePlaceholder')}
                            onChange={(e) => setField('code', e.target.value)}
                          />
                        </div>
                      ) : (
                        <>
                          <p className="font-medium">{r.name || '—'}</p>
                          {r.code && (
                            <p className="text-xs text-[#737477]" dir="ltr">{r.code}</p>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          r.college === 'CCK'
                            ? 'bg-pair-50 text-pair-700'
                            : 'bg-gold-50 text-gold-700'
                        }`}
                      >
                        {r.college}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#737477]" dir="ltr">
                      {editing ? (
                        <input
                          className={`${inputCls} w-16`}
                          dir="ltr"
                          value={draft.credit}
                          onChange={(e) => setField('credit', e.target.value)}
                        />
                      ) : (
                        r.credit || '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#737477]">
                      {editing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            className={inputCls}
                            value={draft.paaetProgram}
                            onChange={(e) => setField('paaetProgram', e.target.value)}
                          />
                          <span aria-hidden>→</span>
                          <input
                            className={inputCls}
                            value={draft.cckMajor}
                            onChange={(e) => setField('cckMajor', e.target.value)}
                          />
                        </div>
                      ) : (
                        `${r.paaetProgram} → ${r.cckMajor}`
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {editing ? (
                        <input
                          className={inputCls}
                          value={draft.remarks}
                          placeholder={t('equivalency.remarksPlaceholder')}
                          onChange={(e) => setField('remarks', e.target.value)}
                        />
                      ) : r.remarks ? (
                        <span
                          className={`px-1.5 py-0.5 rounded font-medium ${
                            /bridge/i.test(r.remarks)
                              ? 'bg-gold-50 text-gold-700'
                              : 'bg-gray-100 text-[#222]'
                          }`}
                        >
                          {r.remarks}
                        </span>
                      ) : (
                        <span className="text-[#737477]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end whitespace-nowrap">
                      {editing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => save(r)}
                            className="px-2.5 py-1 rounded bg-pair-600 text-white text-xs font-medium hover:bg-pair-700 disabled:opacity-50"
                          >
                            {t('equivalency.save')}
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={cancelEdit}
                            className="px-2.5 py-1 rounded border border-gray-300 text-xs font-medium text-[#737477] hover:bg-gray-50 disabled:opacity-50"
                          >
                            {t('equivalency.cancel')}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={editingId !== null}
                          onClick={() => startEdit(r)}
                          className="px-2.5 py-1 rounded border border-gray-300 text-xs font-medium text-pair-700 hover:bg-pair-50 disabled:opacity-40"
                        >
                          {t('equivalency.edit')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 inset-x-0 mx-auto w-fit px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${
            toast.ok ? 'bg-pair-700 text-white' : 'bg-red-600 text-white'
          }`}
          role="status"
        >
          {toast.msg}
        </div>
      )}
    </>
  );
}
