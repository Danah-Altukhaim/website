'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import RejectReasonDialog from '@/components/RejectReasonDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import { CloseIcon } from '@/components/icons';
import { useI18n } from '@/lib/i18n';
import {
  useRooms, useInventory, useEventRequests, useBudgets, facilitiesActions,
  isLowStock, isOutOfStock, lineCost, requestCost, budgetRemaining, approvalBlockers,
  DEPARTMENTS, INVENTORY_CATEGORIES,
  type FacilityRoom, type RoomType, type RoomStatus,
  type InventoryItem, type InventoryCategory, type DepartmentId,
  type EventRequest, type RequestStatus, type RequestLine, type Attachment, type Budget,
} from '@/lib/facilitiesStore';

type Tab = 'facilities' | 'inventory' | 'requests';
const TABS: Tab[] = ['facilities', 'inventory', 'requests'];

const kwd = (n: number) =>
  `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KWD`;

const REQUEST_STATUS_STYLE: Record<RequestStatus, string> = {
  pending: 'bg-gold-50 text-gold-700',
  approved: 'bg-pair-50 text-pair-700',
  fulfilled: 'bg-oasis-50 text-oasis-700',
  rejected: 'bg-danger-50 text-danger-700',
  sent_back: 'bg-gold-50 text-gold-700',
};

export default function FacilitiesPage() {
  const { t, dir } = useI18n();
  const [tab, setTab] = useState<Tab>('facilities');
  const requests = useEventRequests();
  const pending = requests.filter((r) => r.status === 'pending').length;

  return (
    <div dir={dir}>
      <h1 className="text-2xl font-bold mb-1">{t('facilities.title')}</h1>
      <p className="text-sm text-[#737477] mb-5">{t('facilities.subtitle')}</p>

      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              tab === tb
                ? 'bg-pair-600 text-white border-pair-600'
                : 'bg-white text-[#737477] border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t(`facilities.tab.${tb}`)}
            {tb === 'requests' && pending > 0 ? ` · ${pending}` : ''}
          </button>
        ))}
      </div>

      {tab === 'facilities' && <FacilitiesTab />}
      {tab === 'inventory' && <InventoryTab />}
      {tab === 'requests' && <RequestsTab />}
    </div>
  );
}

/* ========================================================================== */
/* Tab 1 — Facilities (rooms)                                                 */
/* ========================================================================== */

const ROOM_STATUS_STYLE: Record<RoomStatus, string> = {
  available: 'bg-oasis-50 text-oasis-700',
  in_use: 'bg-gold-50 text-gold-700',
  maintenance: 'bg-danger-50 text-danger-700',
};

const ROOM_TYPE_FILTERS: ('all' | RoomType)[] = ['all', 'classroom', 'lab', 'hall'];

function FacilitiesTab() {
  const { t, locale } = useI18n();
  const textAlign = locale === 'ar' ? 'text-right' : 'text-left';
  const rooms = useRooms();
  const [typeFilter, setTypeFilter] = useState<'all' | RoomType>('all');
  const [edit, setEdit] = useState<FacilityRoom | null>(null);

  const visible = rooms.filter((r) => typeFilter === 'all' || r.type === typeFilter);
  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
  const maintenance = rooms.filter((r) => r.status === 'maintenance').length;
  const available = rooms.filter((r) => r.status === 'available').length;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card title={t('facilities.kpi.rooms')} value={rooms.length} />
        <Card title={t('facilities.kpi.capacity')} value={totalCapacity} />
        <Card title={t('facilities.kpi.available')} value={available} />
        <Card title={t('facilities.kpi.maintenance')} value={maintenance} />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {ROOM_TYPE_FILTERS.map((f) => {
          const count = f === 'all' ? rooms.length : rooms.filter((r) => r.type === f).length;
          return (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                typeFilter === f
                  ? 'bg-pair-600 text-white border-pair-600'
                  : 'bg-white text-[#737477] border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t(`facilities.roomType.${f}`)} · {count}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`${textAlign} text-gray-500 border-b border-gray-200`}>
              <th className="p-4 font-medium">{t('facilities.col.room')}</th>
              <th className="p-4 font-medium">{t('facilities.col.type')}</th>
              <th className="p-4 font-medium">{t('facilities.col.floor')}</th>
              <th className="p-4 font-medium">{t('facilities.col.building')}</th>
              <th className="p-4 font-medium">{t('facilities.col.capacity')}</th>
              <th className="p-4 font-medium">{t('common.status')}</th>
              <th className="p-4 font-medium">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="border-b border-gray-50 last:border-0 align-top">
                <td className="p-4">
                  <p className="font-mono font-medium">{r.code}</p>
                  {r.name && <p className="text-xs text-[#737477]">{r.name}</p>}
                  {r.note && <p className="text-xs text-danger-600 mt-1">{r.note}</p>}
                </td>
                <td className="p-4">{t(`facilities.roomType.${r.type}`)}</td>
                <td className="p-4">{t(`facilities.floor.${r.floor}`)}</td>
                <td className="p-4">{r.building}</td>
                <td className="p-4">{r.capacity}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${ROOM_STATUS_STYLE[r.status]}`}>
                    {t(`facilities.roomStatus.${r.status}`)}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => setEdit(r)}
                    className="px-2.5 py-1 rounded-lg border border-gray-300 text-xs hover:bg-gray-50"
                  >
                    {t('facilities.room.setStatus')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && <RoomStatusModal room={edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function RoomStatusModal({ room, onClose }: { room: FacilityRoom; onClose: () => void }) {
  const { t } = useI18n();
  const [status, setStatus] = useState<RoomStatus>(room.status);
  const [note, setNote] = useState(room.note ?? '');
  const STATUSES: RoomStatus[] = ['available', 'in_use', 'maintenance'];

  const save = () => {
    facilitiesActions.setRoomStatus(room.id, status, note.trim());
    onClose();
  };

  return (
    <ModalShell title={room.code} subtitle={room.name ?? t(`facilities.roomType.${room.type}`)} onClose={onClose}>
      <div className="p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-[#737477] block mb-2">{t('common.status')}</label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-sm border ${
                  status === s ? 'bg-pair-600 text-white border-pair-600' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t(`facilities.roomStatus.${s}`)}
              </button>
            ))}
          </div>
        </div>
        <Field label={t('facilities.room.note')}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={t('facilities.room.notePlaceholder')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-400"
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button onClick={save} className="px-4 py-2 rounded-lg bg-pair-600 text-white text-sm font-medium hover:bg-pair-700">
            {t('common.save')}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ========================================================================== */
/* Tab 2 — Inventory                                                          */
/* ========================================================================== */

function InventoryTab() {
  const { t, locale } = useI18n();
  const textAlign = locale === 'ar' ? 'text-right' : 'text-left';
  const inventory = useInventory();
  const [catFilter, setCatFilter] = useState<'all' | InventoryCategory>('all');
  const [lowOnly, setLowOnly] = useState(false);
  const [edit, setEdit] = useState<InventoryItem | 'new' | null>(null);
  const [restock, setRestock] = useState<InventoryItem | null>(null);
  const [del, setDel] = useState<InventoryItem | null>(null);

  const visible = inventory.filter((i) => {
    if (catFilter !== 'all' && i.category !== catFilter) return false;
    if (lowOnly && !isLowStock(i) && !isOutOfStock(i)) return false;
    return true;
  });

  const stockValue = inventory.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const lowCount = inventory.filter(isLowStock).length;
  const outCount = inventory.filter(isOutOfStock).length;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card title={t('facilities.inv.kpi.items')} value={inventory.length} />
        <Card title={t('facilities.inv.kpi.value')} value={kwd(stockValue)} />
        <Card
          title={t('facilities.inv.kpi.low')}
          value={lowCount}
          onClick={() => setLowOnly(true)}
          active={lowOnly}
        />
        <Card title={t('facilities.inv.kpi.out')} value={outCount} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => { setCatFilter('all'); setLowOnly(false); }}
          className={`px-3 py-1.5 rounded-lg text-sm border ${
            catFilter === 'all' && !lowOnly
              ? 'bg-pair-600 text-white border-pair-600'
              : 'bg-white text-[#737477] border-gray-300 hover:bg-gray-50'
          }`}
        >
          {t('facilities.inv.cat.all')} · {inventory.length}
        </button>
        {INVENTORY_CATEGORIES.map((c) => {
          const count = inventory.filter((i) => i.category === c).length;
          if (count === 0) return null;
          return (
            <button
              key={c}
              onClick={() => { setCatFilter(c); setLowOnly(false); }}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                catFilter === c && !lowOnly
                  ? 'bg-pair-600 text-white border-pair-600'
                  : 'bg-white text-[#737477] border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t(`facilities.inv.cat.${c}`)} · {count}
            </button>
          );
        })}
        <div className="ms-auto">
          <button
            onClick={() => setEdit('new')}
            className="px-3 py-1.5 rounded-lg bg-pair-600 text-white text-sm font-medium hover:bg-pair-700"
          >
            + {t('facilities.inv.addItem')}
          </button>
        </div>
      </div>

      {lowOnly && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="px-2 py-0.5 rounded bg-danger-50 text-danger-700 font-medium">
            {t('facilities.inv.lowOnlyOn')}
          </span>
          <button onClick={() => setLowOnly(false)} className="text-pair-700 hover:underline">
            {t('facilities.inv.showAll')}
          </button>
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState title={t('facilities.inv.empty')} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`${textAlign} text-gray-500 border-b border-gray-200`}>
                <th className="p-4 font-medium">{t('facilities.inv.col.item')}</th>
                <th className="p-4 font-medium">{t('facilities.inv.col.category')}</th>
                <th className="p-4 font-medium">{t('facilities.inv.col.onHand')}</th>
                <th className="p-4 font-medium">{t('facilities.inv.col.price')}</th>
                <th className="p-4 font-medium">{t('facilities.inv.col.reorder')}</th>
                <th className="p-4 font-medium">{t('facilities.inv.col.lead')}</th>
                <th className="p-4 font-medium">{t('facilities.inv.col.supplier')}</th>
                <th className="p-4 font-medium">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((i) => (
                <tr key={i.id} className="border-b border-gray-50 last:border-0 align-top">
                  <td className="p-4">
                    <p className="font-medium">{i.name}</p>
                    <p className="text-xs text-[#737477] font-mono">{i.sku} · {i.location}</p>
                  </td>
                  <td className="p-4">{t(`facilities.inv.cat.${i.category}`)}</td>
                  <td className="p-4">
                    <span className="font-medium">{i.quantity}</span>
                    <span className="text-xs text-[#737477]"> {t(`facilities.inv.unit.${i.unit}`)}</span>
                    <div className="mt-1">
                      {isOutOfStock(i) ? (
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-danger-50 text-danger-700">
                          {t('facilities.inv.outOfStock')}
                        </span>
                      ) : isLowStock(i) ? (
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-gold-50 text-gold-700">
                          {t('facilities.inv.lowStock')}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">{kwd(i.unitPrice)}</td>
                  <td className="p-4">{i.reorderLevel}</td>
                  <td className="p-4 whitespace-nowrap">{t('facilities.inv.days', { n: i.restockLeadDays })}</td>
                  <td className="p-4">{i.supplier}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => setRestock(i)} className="px-2 py-1 rounded-lg border border-gray-300 text-xs hover:bg-gray-50">
                        {t('facilities.inv.restock')}
                      </button>
                      <button onClick={() => setEdit(i)} className="px-2 py-1 rounded-lg border border-gray-300 text-xs hover:bg-gray-50">
                        {t('common.edit')}
                      </button>
                      <button onClick={() => setDel(i)} className="px-2 py-1 rounded-lg border border-danger-200 text-danger-700 text-xs hover:bg-danger-50">
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {edit && (
        <ItemFormModal
          item={edit === 'new' ? null : edit}
          onClose={() => setEdit(null)}
        />
      )}
      {restock && <RestockModal item={restock} onClose={() => setRestock(null)} />}
      <ConfirmDialog
        open={!!del}
        title={t('facilities.inv.deleteTitle')}
        message={t('facilities.inv.deleteMessage', { name: del?.name ?? '' })}
        confirmLabel={t('common.delete')}
        variant="danger"
        onConfirm={() => { if (del) facilitiesActions.deleteItem(del.id); setDel(null); }}
        onCancel={() => setDel(null)}
      />
    </div>
  );
}

function ItemFormModal({ item, onClose }: { item: InventoryItem | null; onClose: () => void }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: item?.name ?? '',
    sku: item?.sku ?? '',
    category: item?.category ?? ('other' as InventoryCategory),
    quantity: item?.quantity ?? 0,
    unit: item?.unit ?? 'unit',
    unitPrice: item?.unitPrice ?? 0,
    reorderLevel: item?.reorderLevel ?? 0,
    restockLeadDays: item?.restockLeadDays ?? 7,
    supplier: item?.supplier ?? '',
    location: item?.location ?? '',
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const valid = form.name.trim() && form.sku.trim();

  const save = () => {
    if (!valid) return;
    if (item) facilitiesActions.updateItem(item.id, form);
    else facilitiesActions.addItem(form);
    onClose();
  };

  return (
    <ModalShell
      title={item ? t('facilities.inv.editItem') : t('facilities.inv.addItem')}
      subtitle={item?.name}
      onClose={onClose}
    >
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label={t('facilities.inv.col.item')} className="col-span-2">
            <TextInput value={form.name} onChange={(v) => set('name', v)} />
          </Field>
          <Field label="SKU">
            <TextInput value={form.sku} onChange={(v) => set('sku', v)} mono />
          </Field>
          <Field label={t('facilities.inv.col.category')}>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value as InventoryCategory)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-400"
            >
              {INVENTORY_CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(`facilities.inv.cat.${c}`)}</option>
              ))}
            </select>
          </Field>
          <Field label={t('facilities.inv.col.onHand')}>
            <NumInput value={form.quantity} onChange={(v) => set('quantity', v)} />
          </Field>
          <Field label={t('facilities.inv.field.unit')}>
            <select
              value={form.unit}
              onChange={(e) => set('unit', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-400"
            >
              {['unit', 'box', 'pack'].map((u) => (
                <option key={u} value={u}>{t(`facilities.inv.unit.${u}`)}</option>
              ))}
            </select>
          </Field>
          <Field label={t('facilities.inv.field.price')}>
            <NumInput value={form.unitPrice} onChange={(v) => set('unitPrice', v)} step={0.05} />
          </Field>
          <Field label={t('facilities.inv.field.reorder')}>
            <NumInput value={form.reorderLevel} onChange={(v) => set('reorderLevel', v)} />
          </Field>
          <Field label={t('facilities.inv.field.lead')}>
            <NumInput value={form.restockLeadDays} onChange={(v) => set('restockLeadDays', v)} />
          </Field>
          <Field label={t('facilities.inv.col.supplier')}>
            <TextInput value={form.supplier} onChange={(v) => set('supplier', v)} />
          </Field>
          <Field label={t('facilities.inv.field.location')}>
            <TextInput value={form.location} onChange={(v) => set('location', v)} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button
            onClick={save}
            disabled={!valid}
            className="px-4 py-2 rounded-lg bg-pair-600 text-white text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function RestockModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const { t } = useI18n();
  const [qty, setQty] = useState(Math.max(item.reorderLevel * 2 - item.quantity, 1));

  const save = () => {
    facilitiesActions.restockItem(item.id, qty);
    onClose();
  };

  return (
    <ModalShell title={t('facilities.inv.restock')} subtitle={item.name} onClose={onClose}>
      <div className="p-5 space-y-4">
        <p className="text-sm text-[#737477]">
          {t('facilities.inv.restockHint', { qty: item.quantity, lead: item.restockLeadDays })}
        </p>
        <Field label={t('facilities.inv.restockQty')}>
          <NumInput value={qty} onChange={setQty} min={1} />
        </Field>
        <p className="text-sm">
          {t('facilities.inv.restockResult', { total: item.quantity + qty })}
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button onClick={save} className="px-4 py-2 rounded-lg bg-pair-600 text-white text-sm font-medium hover:bg-pair-700">
            {t('facilities.inv.receive')}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ========================================================================== */
/* Tab 3 — Event Requests                                                     */
/* ========================================================================== */

function RequestsTab() {
  const { t } = useI18n();
  const requests = useEventRequests();
  const inventory = useInventory();
  const rooms = useRooms();
  const budgets = useBudgets();
  const [filter, setFilter] = useState<'all' | RequestStatus>('all');
  const [creating, setCreating] = useState(false);
  const [rejecting, setRejecting] = useState<EventRequest | null>(null);
  const [sendingBack, setSendingBack] = useState<EventRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = requests.filter((r) => filter === 'all' || r.status === filter);

  const roomLabel = (id: string | null) => {
    if (!id) return t('facilities.req.noRoom');
    const room = rooms.find((r) => r.id === id);
    return room ? `${room.code}${room.name ? ` · ${room.name}` : ''}` : id;
  };

  const approve = (req: EventRequest) => {
    const blockers = facilitiesActions.approveRequest(req.id);
    if (blockers.length > 0) {
      const b = blockers[0];
      if (b.kind === 'budget') {
        setError(t('facilities.req.blockBudget', { need: kwd(b.need), remaining: kwd(b.remaining) }));
      } else {
        const item = inventory.find((i) => i.id === b.itemId);
        setError(t('facilities.req.blockStock', { item: item?.name ?? b.itemId, need: b.need, have: b.have }));
      }
    } else {
      setError(null);
    }
  };

  const FILTERS: ('all' | RequestStatus)[] = ['all', 'pending', 'approved', 'fulfilled', 'sent_back', 'rejected'];

  return (
    <div>
      <BudgetStrip budgets={budgets} />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {FILTERS.map((f) => {
          const count = f === 'all' ? requests.length : requests.filter((r) => r.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                filter === f
                  ? 'bg-pair-600 text-white border-pair-600'
                  : 'bg-white text-[#737477] border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t(`facilities.req.filter.${f}`)} · {count}
            </button>
          );
        })}
        <div className="ms-auto">
          <button
            onClick={() => setCreating(true)}
            className="px-3 py-1.5 rounded-lg bg-pair-600 text-white text-sm font-medium hover:bg-pair-700"
          >
            + {t('facilities.req.new')}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-danger-50 text-danger-700 text-sm flex items-start justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label={t('common.cancel')}><CloseIcon className="w-4 h-4" /></button>
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState title={t('facilities.req.empty')} />
      ) : (
        <div className="space-y-3">
          {visible.map((req) => {
            const cost = requestCost(inventory, req);
            const budget = budgets.find((b) => b.department === req.department);
            const blockers = req.status === 'pending'
              ? approvalBlockers({ rooms, inventory, requests, budgets }, req)
              : [];
            return (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{req.title}</p>
                    <p className="text-xs text-[#737477]">
                      {t(`facilities.dept.${req.department}`)} · {req.venue === 'external'
                        ? `${t('facilities.req.venue.external')}: ${req.externalLocation || '—'}`
                        : roomLabel(req.roomId)} · {req.date}
                    </p>
                    <p className="text-xs text-[#737477] mt-0.5">
                      {t('facilities.req.attendees', { n: req.attendees })}
                    </p>
                  </div>
                  <div className="text-end">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${REQUEST_STATUS_STYLE[req.status]}`}>
                      {t(`facilities.req.status.${req.status}`)}
                    </span>
                    <p className="text-sm font-semibold mt-1.5">
                      {req.status === 'approved' || req.status === 'fulfilled'
                        ? kwd(req.chargedCost)
                        : kwd(cost)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 border-t border-gray-100 pt-3">
                  <table className="w-full text-sm">
                    <tbody>
                      {req.lines.map((line) => {
                        const item = inventory.find((i) => i.id === line.itemId);
                        const short = item && line.quantity > item.quantity && req.status === 'pending';
                        return (
                          <tr key={line.itemId} className="border-b border-gray-50 last:border-0">
                            <td className="py-1.5">
                              {item?.name ?? line.itemId}
                              {short && (
                                <span className="ms-2 px-1.5 py-0.5 rounded text-[11px] font-medium bg-danger-50 text-danger-700">
                                  {t('facilities.req.short', { have: item?.quantity ?? 0 })}
                                </span>
                              )}
                            </td>
                            <td className="py-1.5 text-end text-[#737477] whitespace-nowrap">
                              {line.quantity} × {kwd(item?.unitPrice ?? 0)}
                            </td>
                            <td className="py-1.5 text-end font-medium whitespace-nowrap ps-4">
                              {kwd(lineCost(inventory, line))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {req.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {req.attachments.map((a, idx) => (
                      <span key={idx} title={a.note} className="px-2 py-1 rounded-lg bg-pair-50 text-pair-700 text-xs font-medium">
                        📎 {a.name}
                      </span>
                    ))}
                  </div>
                )}

                {req.notes && <p className="text-xs text-[#737477] mt-3">{req.notes}</p>}

                {req.status === 'rejected' && req.rejectReason && (
                  <p className="text-xs text-danger-700 mt-3 bg-danger-50 rounded-lg px-3 py-2">
                    {t('facilities.req.rejectedReason', { reason: req.rejectReason })}
                  </p>
                )}

                {req.status === 'sent_back' && req.sentBackReason && (
                  <p className="text-xs text-gold-700 mt-3 bg-gold-50 rounded-lg px-3 py-2">
                    {t('facilities.req.sentBackReason', { reason: req.sentBackReason })}
                  </p>
                )}

                {req.status === 'pending' && (
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <button
                      onClick={() => approve(req)}
                      disabled={blockers.length > 0}
                      title={blockers.length > 0 ? t('facilities.req.cannotApprove') : undefined}
                      className="px-3 py-1.5 bg-oasis-500 text-white rounded-lg text-sm font-medium hover:bg-oasis-600 disabled:opacity-50"
                    >
                      {t('facilities.req.approve')}
                    </button>
                    <button
                      onClick={() => setSendingBack(req)}
                      className="px-3 py-1.5 border border-gold-200 text-gold-700 rounded-lg text-sm hover:bg-gold-50"
                    >
                      {t('facilities.req.sendBack')}
                    </button>
                    <button
                      onClick={() => setRejecting(req)}
                      className="px-3 py-1.5 border border-danger-200 text-danger-700 rounded-lg text-sm hover:bg-danger-50"
                    >
                      {t('facilities.req.reject')}
                    </button>
                    {budget && (
                      <span className="text-xs text-[#737477] ms-1">
                        {t('facilities.req.budgetAfter', {
                          dept: t(`facilities.dept.${req.department}`),
                          remaining: kwd(budgetRemaining(budget) - cost),
                        })}
                      </span>
                    )}
                    {blockers.length > 0 && (
                      <span className="text-xs text-danger-700">{t('facilities.req.cannotApprove')}</span>
                    )}
                  </div>
                )}

                {req.status === 'approved' && (
                  <div className="mt-4">
                    <button
                      onClick={() => facilitiesActions.fulfillRequest(req.id)}
                      className="px-3 py-1.5 bg-pair-600 text-white rounded-lg text-sm font-medium hover:bg-pair-700"
                    >
                      {t('facilities.req.markFulfilled')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {creating && <RequestFormModal onClose={() => setCreating(false)} />}
      <RejectReasonDialog
        open={!!rejecting}
        title={t('facilities.req.reject')}
        subject={rejecting?.title}
        onConfirm={(reason) => { if (rejecting) facilitiesActions.rejectRequest(rejecting.id, reason); setRejecting(null); }}
        onCancel={() => setRejecting(null)}
      />
      <RejectReasonDialog
        open={!!sendingBack}
        title={t('facilities.req.sendBack')}
        subject={sendingBack?.title}
        hint={t('facilities.req.sendBackHint')}
        confirmLabel={t('facilities.req.sendBack')}
        onConfirm={(reason) => { if (sendingBack) facilitiesActions.sendBackRequest(sendingBack.id, reason); setSendingBack(null); }}
        onCancel={() => setSendingBack(null)}
      />
    </div>
  );
}

function BudgetStrip({ budgets }: { budgets: Budget[] }) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
      {budgets.map((b) => {
        const remaining = budgetRemaining(b);
        const pct = b.total > 0 ? Math.min(100, Math.round((b.spent / b.total) * 100)) : 0;
        const low = remaining <= b.total * 0.15;
        return (
          <div key={b.department} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium truncate">{t(`facilities.dept.${b.department}`)}</p>
              <p className={`text-xs font-semibold ${low ? 'text-danger-600' : 'text-oasis-700'}`}>
                {kwd(remaining)}
              </p>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full ${low ? 'bg-danger-500' : 'bg-pair-600'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[11px] text-[#737477] mt-1.5">
              {t('facilities.req.budgetSpent', { spent: kwd(b.spent), total: kwd(b.total) })}
            </p>
          </div>
        );
      })}
    </div>
  );
}

type CartLine = RequestLine;

function RequestFormModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const inventory = useInventory();
  const rooms = useRooms();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<DepartmentId>('student_life');
  const [venue, setVenue] = useState<'on_campus' | 'external'>('on_campus');
  const [roomId, setRoomId] = useState<string>('');
  const [externalLocation, setExternalLocation] = useState('');
  const [date, setDate] = useState('');
  const [attendees, setAttendees] = useState(0);
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // add-to-cart controls
  const available = inventory.filter((i) => !cart.some((c) => c.itemId === i.id) && i.quantity > 0);
  const [pickItem, setPickItem] = useState<string>('');
  const [pickQty, setPickQty] = useState(1);
  const [attName, setAttName] = useState('');
  const [attNote, setAttNote] = useState('');

  const pickedItem = inventory.find((i) => i.id === pickItem);
  const maxForPick = pickedItem?.quantity ?? 0;

  const addToCart = () => {
    if (!pickItem || pickQty < 1) return;
    const clamped = Math.min(pickQty, maxForPick);
    setCart((c) => [...c, { itemId: pickItem, quantity: clamped }]);
    setPickItem('');
    setPickQty(1);
  };

  const updateCartQty = (itemId: string, qty: number) => {
    const item = inventory.find((i) => i.id === itemId);
    const max = item?.quantity ?? 0;
    setCart((c) => c.map((l) => (l.itemId === itemId ? { ...l, quantity: Math.max(1, Math.min(qty, max)) } : l)));
  };

  const removeFromCart = (itemId: string) =>
    setCart((c) => c.filter((l) => l.itemId !== itemId));

  const addAttachment = () => {
    if (!attName.trim()) return;
    setAttachments((a) => [...a, { name: attName.trim(), note: attNote.trim() || undefined }]);
    setAttName('');
    setAttNote('');
  };

  const total = cart.reduce((s, l) => s + lineCost(inventory, l), 0);
  const valid =
    title.trim() && date && cart.length > 0 &&
    (venue === 'on_campus' || externalLocation.trim());

  const submit = () => {
    if (!valid) return;
    facilitiesActions.createRequest({
      title: title.trim(),
      department,
      venue,
      roomId: venue === 'on_campus' ? (roomId || null) : null,
      externalLocation: venue === 'external' ? externalLocation.trim() : undefined,
      date,
      attendees,
      lines: cart,
      attachments,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <ModalShell title={t('facilities.req.new')} subtitle={t('facilities.req.newHint')} onClose={onClose} wide>
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label={t('facilities.req.field.title')} className="col-span-2">
            <TextInput value={title} onChange={setTitle} placeholder={t('facilities.req.field.titlePlaceholder')} />
          </Field>
          <Field label={t('facilities.req.field.department')}>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as DepartmentId)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-400"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{t(`facilities.dept.${d}`)}</option>
              ))}
            </select>
          </Field>
          <Field label={t('facilities.req.field.venue')}>
            <select
              value={venue}
              onChange={(e) => setVenue(e.target.value as 'on_campus' | 'external')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-400"
            >
              <option value="on_campus">{t('facilities.req.venue.onCampus')}</option>
              <option value="external">{t('facilities.req.venue.external')}</option>
            </select>
          </Field>
          {venue === 'on_campus' ? (
            <Field label={t('facilities.req.field.room')}>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-400"
              >
                <option value="">{t('facilities.req.noRoom')}</option>
                {rooms.filter((r) => r.status !== 'maintenance').map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code}{r.name ? ` · ${r.name}` : ''} ({t('facilities.req.cap', { n: r.capacity })})
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label={t('facilities.req.field.externalLocation')}>
              <TextInput
                value={externalLocation}
                onChange={setExternalLocation}
                placeholder={t('facilities.req.field.externalLocationPlaceholder')}
              />
            </Field>
          )}
          <Field label={t('facilities.req.field.date')}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-400"
            />
          </Field>
          <Field label={t('facilities.req.field.attendees')}>
            <NumInput value={attendees} onChange={setAttendees} />
          </Field>
        </div>

        {/* Cart */}
        <div>
          <h3 className="text-sm font-semibold mb-2">{t('facilities.req.cart')}</h3>
          <div className="flex flex-wrap items-end gap-2 mb-3 bg-gray-50 rounded-lg p-3">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs text-[#737477] block mb-1">{t('facilities.req.pickItem')}</label>
              <select
                value={pickItem}
                onChange={(e) => { setPickItem(e.target.value); setPickQty(1); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pair-400"
              >
                <option value="">{t('facilities.req.selectItem')}</option>
                {available.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} — {kwd(i.unitPrice)} ({t('facilities.req.inStock', { n: i.quantity })})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="text-xs text-[#737477] block mb-1">{t('facilities.req.qty')}</label>
              <NumInput value={pickQty} onChange={setPickQty} min={1} max={maxForPick || undefined} />
            </div>
            <button
              onClick={addToCart}
              disabled={!pickItem}
              className="px-3 py-2 rounded-lg bg-pair-600 text-white text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
            >
              {t('facilities.req.add')}
            </button>
          </div>
          {pickedItem && isLowStock(pickedItem) && (
            <p className="text-xs text-gold-700 mb-3">
              {t('facilities.req.lowWarn', { name: pickedItem.name, have: pickedItem.quantity })}
            </p>
          )}

          {cart.length === 0 ? (
            <p className="text-sm text-[#737477]">{t('facilities.req.cartEmpty')}</p>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {cart.map((line) => {
                    const item = inventory.find((i) => i.id === line.itemId)!;
                    return (
                      <tr key={line.itemId} className="border-b border-gray-100 last:border-0">
                        <td className="p-2.5">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-[#737477]">{kwd(item.unitPrice)} · {t('facilities.req.inStock', { n: item.quantity })}</p>
                        </td>
                        <td className="p-2.5 w-24">
                          <NumInput value={line.quantity} onChange={(v) => updateCartQty(line.itemId, v)} min={1} max={item.quantity} />
                        </td>
                        <td className="p-2.5 text-end font-medium whitespace-nowrap">{kwd(lineCost(inventory, line))}</td>
                        <td className="p-2.5 text-end">
                          <button onClick={() => removeFromCart(line.itemId)} aria-label={t('common.delete')} className="text-danger-600 hover:text-danger-700">
                            <CloseIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50">
                    <td className="p-2.5 font-semibold" colSpan={2}>{t('facilities.req.total')}</td>
                    <td className="p-2.5 text-end font-bold whitespace-nowrap" colSpan={2}>{kwd(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Attachments */}
        <div>
          <h3 className="text-sm font-semibold mb-1">{t('facilities.req.attachments')}</h3>
          <p className="text-xs text-[#737477] mb-2">{t('facilities.req.attachHint')}</p>
          <div className="flex flex-wrap items-end gap-2 mb-2">
            <div className="flex-1 min-w-[160px]">
              <TextInput value={attName} onChange={setAttName} placeholder={t('facilities.req.attachName')} />
            </div>
            <div className="flex-1 min-w-[160px]">
              <TextInput value={attNote} onChange={setAttNote} placeholder={t('facilities.req.attachNote')} />
            </div>
            <button
              onClick={addAttachment}
              disabled={!attName.trim()}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {t('facilities.req.attach')}
            </button>
          </div>
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((a, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-pair-50 text-pair-700 text-xs font-medium">
                  📎 {a.name}
                  <button onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))} aria-label={t('common.delete')}>
                    <CloseIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <Field label={t('facilities.req.field.notes')}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-400"
          />
        </Field>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <p className="text-sm font-semibold">{t('facilities.req.total')}: {kwd(total)}</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
              {t('common.cancel')}
            </button>
            <button
              onClick={submit}
              disabled={!valid}
              className="px-4 py-2 rounded-lg bg-pair-600 text-white text-sm font-medium hover:bg-pair-700 disabled:opacity-50"
            >
              {t('facilities.req.submit')}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

/* ========================================================================== */
/* Shared bits                                                                */
/* ========================================================================== */

function ModalShell({
  title, subtitle, onClose, children, wide = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const { dir } = useI18n();
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div dir={dir} role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} my-8`}>
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate">{title}</h2>
            {subtitle && <p className="text-xs text-[#737477] truncate">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pair-500 shrink-0"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-[#737477] block mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function TextInput({
  value, onChange, placeholder, mono = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-400 ${mono ? 'font-mono' : ''}`}
    />
  );
}

function NumInput({
  value, onChange, min = 0, max, step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => {
        const n = Number(e.target.value);
        onChange(Number.isFinite(n) ? n : 0);
      }}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pair-400"
    />
  );
}
