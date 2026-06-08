'use client';

// Client-side store for the Facilities workspace.
//
// There is no Facilities backend yet, so rooms / inventory / event requests /
// department budgets all live here, persisted to localStorage. The room seed
// is the real "Classroom & Laboratory Capacity 2026" sheet. Event requests are
// linked to inventory: approving a request draws items down from stock and
// charges the requesting department's budget. "reset()" reverts to the seed.

import { useSyncExternalStore } from 'react';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type RoomType = 'classroom' | 'hall' | 'lab';
export type RoomFloor = 'ground' | 'first' | 'second';
export type RoomStatus = 'available' | 'in_use' | 'maintenance';

export interface FacilityRoom {
  id: string;
  code: string;
  /** Halls carry a proper name; classrooms/labs do not. */
  name?: string;
  type: RoomType;
  floor: RoomFloor;
  building: string;
  capacity: number;
  status: RoomStatus;
  note?: string;
}

export type InventoryCategory =
  | 'av' | 'furniture' | 'catering' | 'stationery' | 'decor' | 'electrical' | 'other';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: InventoryCategory;
  /** Units on hand. */
  quantity: number;
  unit: string;
  /** Price per unit, KWD. Drives event-request cost. */
  unitPrice: number;
  /** Low-stock threshold: at or below this, reorder. */
  reorderLevel: number;
  /** Days to restock once an order is placed. */
  restockLeadDays: number;
  supplier: string;
  location: string;
}

export type DepartmentId =
  | 'student_life' | 'academic_affairs' | 'admissions' | 'it' | 'marketing' | 'sports';

export const DEPARTMENTS: DepartmentId[] = [
  'student_life', 'academic_affairs', 'admissions', 'it', 'marketing', 'sports',
];

export const INVENTORY_CATEGORIES: InventoryCategory[] = [
  'av', 'furniture', 'catering', 'stationery', 'decor', 'electrical', 'other',
];

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'sent_back';

export interface RequestLine {
  itemId: string;
  quantity: number;
}

export interface Attachment {
  name: string;
  note?: string;
}

export interface EventRequest {
  id: string;
  title: string;
  department: DepartmentId;
  roomId: string | null;
  /** Where the event is held. Defaults to on-campus (which uses roomId). */
  venue?: 'on_campus' | 'external';
  /** Free-text venue name, set only when venue === 'external'. */
  externalLocation?: string;
  date: string;
  attendees: number;
  lines: RequestLine[];
  attachments: Attachment[];
  notes?: string;
  status: RequestStatus;
  rejectReason?: string;
  /** Reason the request was sent back to the requester for changes. */
  sentBackReason?: string;
  createdAt: string;
  /** Cost charged at approval (KWD). 0 until approved. */
  chargedCost: number;
}

export interface Budget {
  department: DepartmentId;
  /** Allocation for the period, KWD. */
  total: number;
  /** Charged against approved requests, KWD. */
  spent: number;
}

interface State {
  rooms: FacilityRoom[];
  inventory: InventoryItem[];
  requests: EventRequest[];
  budgets: Budget[];
}

/* -------------------------------------------------------------------------- */
/* Seed data                                                                  */
/* -------------------------------------------------------------------------- */

// Classroom & Laboratory Capacity 2026 (real sheet).
const SEED_ROOMS: FacilityRoom[] = [
  // Classrooms / Ground Floor
  { id: 'r-bg023', code: 'BG-023', type: 'classroom', floor: 'ground', building: 'B', capacity: 35, status: 'available' },
  { id: 'r-bg024', code: 'BG-024', type: 'classroom', floor: 'ground', building: 'B', capacity: 35, status: 'available' },
  { id: 'r-bg25',  code: 'BG-25',  type: 'classroom', floor: 'ground', building: 'B', capacity: 35, status: 'available' },
  { id: 'r-bg26',  code: 'BG-26',  type: 'classroom', floor: 'ground', building: 'B', capacity: 32, status: 'available' },
  { id: 'r-bg027', code: 'BG-027', type: 'classroom', floor: 'ground', building: 'B', capacity: 35, status: 'available' },
  // Classrooms / First Floor
  { id: 'r-b1023', code: 'B1-023', type: 'classroom', floor: 'first', building: 'B', capacity: 35, status: 'available' },
  { id: 'r-b1024', code: 'B1-024', type: 'classroom', floor: 'first', building: 'B', capacity: 35, status: 'available' },
  { id: 'r-b1025', code: 'B1-025', type: 'classroom', floor: 'first', building: 'B', capacity: 35, status: 'available' },
  { id: 'r-b1026', code: 'B1-026', type: 'classroom', floor: 'first', building: 'B', capacity: 32, status: 'available' },
  { id: 'r-b1027', code: 'B1-027', type: 'classroom', floor: 'first', building: 'B', capacity: 35, status: 'available' },
  // Classrooms / Second Floor
  { id: 'r-b2023', code: 'B2-023', type: 'classroom', floor: 'second', building: 'B', capacity: 35, status: 'available' },
  { id: 'r-b2024', code: 'B2-024', type: 'classroom', floor: 'second', building: 'B', capacity: 35, status: 'available' },
  { id: 'r-b2025', code: 'B2-025', type: 'classroom', floor: 'second', building: 'B', capacity: 35, status: 'available' },
  { id: 'r-b2026', code: 'B2-026', type: 'classroom', floor: 'second', building: 'B', capacity: 32, status: 'available' },
  { id: 'r-b2027', code: 'B2-027', type: 'classroom', floor: 'second', building: 'B', capacity: 35, status: 'available' },
  { id: 'r-b2x1',  code: 'B2-A',   name: 'Unnamed room', type: 'classroom', floor: 'second', building: 'B', capacity: 30, status: 'available' },
  { id: 'r-b2x2',  code: 'B2-B',   name: 'Unnamed room', type: 'classroom', floor: 'second', building: 'B', capacity: 30, status: 'available' },
  // Halls
  { id: 'r-nuwair', code: 'B1-004', name: 'Al Nuwair', type: 'hall', floor: 'first',  building: 'B', capacity: 83, status: 'available' },
  { id: 'r-jahra',  code: 'B2-004', name: 'Al Jahra',  type: 'hall', floor: 'second', building: 'B', capacity: 45, status: 'available' },
  { id: 'r-wafra',  code: 'B2-006', name: 'Al Wafra',  type: 'hall', floor: 'second', building: 'B', capacity: 45, status: 'available' },
  { id: 'r-maple',  code: 'A2-147', name: 'Maple Leaf', type: 'hall', floor: 'second', building: 'A', capacity: 60, status: 'available' },
  // Labs / First Floor
  { id: 'r-lab015', code: 'LAB-015', type: 'lab', floor: 'first', building: 'B', capacity: 24, status: 'available' },
  { id: 'r-lab016', code: 'LAB-016', type: 'lab', floor: 'first', building: 'B', capacity: 24, status: 'available' },
  { id: 'r-lab031', code: 'LAB-031', type: 'lab', floor: 'first', building: 'B', capacity: 24, status: 'available' },
  { id: 'r-lab032', code: 'LAB-032', type: 'lab', floor: 'first', building: 'B', capacity: 24, status: 'available' },
  // Labs / Second Floor
  { id: 'r-lab2015', code: 'LAB B2-015', type: 'lab', floor: 'second', building: 'B', capacity: 40, status: 'available' },
  { id: 'r-lab2016', code: 'LAB B2-016', type: 'lab', floor: 'second', building: 'B', capacity: 40, status: 'available' },
  { id: 'r-lab2031', code: 'LAB B2-031', type: 'lab', floor: 'second', building: 'B', capacity: 40, status: 'available' },
  { id: 'r-lab2032', code: 'LAB B2-032', type: 'lab', floor: 'second', building: 'B', capacity: 40, status: 'available' },
];

const SEED_INVENTORY: InventoryItem[] = [
  { id: 'i-projector', name: 'Portable Projector', sku: 'AV-PROJ-01', category: 'av', quantity: 6, unit: 'unit', unitPrice: 4.5, reorderLevel: 3, restockLeadDays: 14, supplier: 'Gulf AV Solutions', location: 'Store B-G' },
  { id: 'i-mic', name: 'Wireless Microphone', sku: 'AV-MIC-01', category: 'av', quantity: 14, unit: 'unit', unitPrice: 2, reorderLevel: 6, restockLeadDays: 10, supplier: 'Gulf AV Solutions', location: 'Store B-G' },
  { id: 'i-speaker', name: 'PA Speaker', sku: 'AV-SPK-01', category: 'av', quantity: 8, unit: 'unit', unitPrice: 3, reorderLevel: 4, restockLeadDays: 12, supplier: 'Gulf AV Solutions', location: 'Store B-G' },
  { id: 'i-screen', name: 'Projection Screen', sku: 'AV-SCR-01', category: 'av', quantity: 5, unit: 'unit', unitPrice: 2.5, reorderLevel: 2, restockLeadDays: 14, supplier: 'Gulf AV Solutions', location: 'Store B-G' },
  { id: 'i-chair', name: 'Folding Chair', sku: 'FRN-CHR-01', category: 'furniture', quantity: 320, unit: 'unit', unitPrice: 0.5, reorderLevel: 80, restockLeadDays: 7, supplier: 'Kuwait Office Supply', location: 'Warehouse 2' },
  { id: 'i-table', name: 'Round Banquet Table', sku: 'FRN-TBL-01', category: 'furniture', quantity: 40, unit: 'unit', unitPrice: 1.5, reorderLevel: 12, restockLeadDays: 7, supplier: 'Kuwait Office Supply', location: 'Warehouse 2' },
  { id: 'i-podium', name: 'Speaker Podium', sku: 'FRN-POD-01', category: 'furniture', quantity: 4, unit: 'unit', unitPrice: 3, reorderLevel: 2, restockLeadDays: 10, supplier: 'Kuwait Office Supply', location: 'Warehouse 2' },
  { id: 'i-tablecloth', name: 'Table Cloth', sku: 'DEC-TCL-01', category: 'decor', quantity: 60, unit: 'unit', unitPrice: 0.75, reorderLevel: 20, restockLeadDays: 5, supplier: 'Al Salam Trading', location: 'Store B-1' },
  { id: 'i-uplight', name: 'LED Uplight', sku: 'ELC-LED-01', category: 'electrical', quantity: 18, unit: 'unit', unitPrice: 1.25, reorderLevel: 8, restockLeadDays: 12, supplier: 'BrightLite Co.', location: 'Store B-1' },
  { id: 'i-extension', name: 'Extension Cord (10m)', sku: 'ELC-EXT-01', category: 'electrical', quantity: 25, unit: 'unit', unitPrice: 0.8, reorderLevel: 10, restockLeadDays: 7, supplier: 'BrightLite Co.', location: 'Store B-1' },
  { id: 'i-bannerstand', name: 'Roll-up Banner Stand', sku: 'DEC-BAN-01', category: 'decor', quantity: 10, unit: 'unit', unitPrice: 2, reorderLevel: 4, restockLeadDays: 9, supplier: 'Al Salam Trading', location: 'Store B-1' },
  { id: 'i-coffee', name: 'Coffee Urn (100 cup)', sku: 'CAT-URN-01', category: 'catering', quantity: 6, unit: 'unit', unitPrice: 3.5, reorderLevel: 3, restockLeadDays: 10, supplier: 'Catering Plus', location: 'Kitchen Store' },
  { id: 'i-water', name: 'Water Bottle (pack of 24)', sku: 'CAT-WTR-01', category: 'catering', quantity: 90, unit: 'pack', unitPrice: 1.2, reorderLevel: 30, restockLeadDays: 3, supplier: 'Catering Plus', location: 'Kitchen Store' },
  { id: 'i-notebook', name: 'Notebook', sku: 'STN-NTB-01', category: 'stationery', quantity: 400, unit: 'unit', unitPrice: 0.25, reorderLevel: 100, restockLeadDays: 5, supplier: 'Kuwait Office Supply', location: 'Warehouse 1' },
  { id: 'i-pen', name: 'Pen (box of 50)', sku: 'STN-PEN-01', category: 'stationery', quantity: 25, unit: 'box', unitPrice: 1.5, reorderLevel: 8, restockLeadDays: 5, supplier: 'Kuwait Office Supply', location: 'Warehouse 1' },
  { id: 'i-lanyard', name: 'Event Lanyard', sku: 'STN-LNY-01', category: 'stationery', quantity: 150, unit: 'unit', unitPrice: 0.3, reorderLevel: 50, restockLeadDays: 8, supplier: 'Al Salam Trading', location: 'Warehouse 1' },
];

const SEED_BUDGETS: Budget[] = [
  { department: 'student_life', total: 6000, spent: 0 },
  { department: 'academic_affairs', total: 4000, spent: 0 },
  { department: 'admissions', total: 3500, spent: 0 },
  { department: 'it', total: 3000, spent: 0 },
  { department: 'marketing', total: 5000, spent: 0 },
  { department: 'sports', total: 4500, spent: 0 },
];

const SEED_REQUESTS: EventRequest[] = [
  {
    id: 'req-1001',
    title: 'New Student Orientation',
    department: 'student_life',
    roomId: 'r-nuwair',
    date: '2026-09-14',
    attendees: 80,
    lines: [
      { itemId: 'i-projector', quantity: 1 },
      { itemId: 'i-mic', quantity: 2 },
      { itemId: 'i-chair', quantity: 80 },
      { itemId: 'i-water', quantity: 4 },
      { itemId: 'i-lanyard', quantity: 80 },
    ],
    attachments: [{ name: 'orientation-banner.pdf', note: 'Custom welcome banner, 3x1m' }],
    notes: 'Stage setup with podium preferred.',
    status: 'pending',
    createdAt: '2026-06-02',
    chargedCost: 0,
  },
  {
    id: 'req-1002',
    title: 'Open Day for Applicants',
    department: 'admissions',
    roomId: 'r-maple',
    date: '2026-07-20',
    attendees: 55,
    lines: [
      { itemId: 'i-bannerstand', quantity: 4 },
      { itemId: 'i-table', quantity: 8 },
      { itemId: 'i-tablecloth', quantity: 8 },
      { itemId: 'i-notebook', quantity: 60 },
    ],
    attachments: [{ name: 'program-banners.zip', note: '6 program-specific roll-up banners' }],
    status: 'approved',
    createdAt: '2026-05-28',
    chargedCost: 8 * 1.5 + 8 * 0.75 + 60 * 0.25 + 4 * 2,
  },
];

const SEED: State = {
  rooms: SEED_ROOMS,
  inventory: SEED_INVENTORY,
  requests: SEED_REQUESTS,
  budgets: SEED_BUDGETS,
};

/* -------------------------------------------------------------------------- */
/* Store plumbing                                                             */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = 'cck-facilities-v1';

let state: State = SEED;
let hydrated = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function load(): State {
  if (typeof window === 'undefined') return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      rooms: parsed.rooms ?? SEED.rooms,
      inventory: parsed.inventory ?? SEED.inventory,
      requests: parsed.requests ?? SEED.requests,
      budgets: parsed.budgets ?? SEED.budgets,
    };
  } catch {
    return SEED;
  }
}

function persist() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full / unavailable — keep in-memory state */
  }
}

function commit(next: State) {
  state = next;
  persist();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!hydrated && typeof window !== 'undefined') {
    hydrated = true;
    state = load();
    emit();
  }
  return () => {
    listeners.delete(listener);
  };
}

/* -------------------------------------------------------------------------- */
/* Derived helpers                                                            */
/* -------------------------------------------------------------------------- */

export const isLowStock = (i: InventoryItem) => i.quantity > 0 && i.quantity <= i.reorderLevel;
export const isOutOfStock = (i: InventoryItem) => i.quantity <= 0;

/** Cost of one request line at current prices. */
export function lineCost(inventory: InventoryItem[], line: RequestLine): number {
  const item = inventory.find((i) => i.id === line.itemId);
  return item ? item.unitPrice * line.quantity : 0;
}

/** Total cost of a request at current prices (used before approval). */
export function requestCost(inventory: InventoryItem[], req: EventRequest): number {
  return req.lines.reduce((sum, l) => sum + lineCost(inventory, l), 0);
}

export const budgetRemaining = (b: Budget) => b.total - b.spent;

/** Why an approval would be blocked, or null if it can go through. */
export type ApprovalBlock =
  | { kind: 'stock'; itemId: string; need: number; have: number }
  | { kind: 'budget'; need: number; remaining: number };

export function approvalBlockers(s: State, req: EventRequest): ApprovalBlock[] {
  const blockers: ApprovalBlock[] = [];
  for (const line of req.lines) {
    const item = s.inventory.find((i) => i.id === line.itemId);
    const have = item?.quantity ?? 0;
    if (line.quantity > have) {
      blockers.push({ kind: 'stock', itemId: line.itemId, need: line.quantity, have });
    }
  }
  const budget = s.budgets.find((b) => b.department === req.department);
  const cost = requestCost(s.inventory, req);
  if (budget && cost > budgetRemaining(budget)) {
    blockers.push({ kind: 'budget', need: cost, remaining: budgetRemaining(budget) });
  }
  return blockers;
}

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;

export const facilitiesActions = {
  /* --- Rooms --- */
  setRoomStatus(id: string, status: RoomStatus, note?: string) {
    const rooms = state.rooms.map((r) =>
      r.id === id ? { ...r, status, note: note ?? r.note } : r,
    );
    commit({ ...state, rooms });
  },

  /* --- Inventory --- */
  addItem(item: Omit<InventoryItem, 'id'>) {
    const inventory = [{ ...item, id: uid('i') }, ...clone(state.inventory)];
    commit({ ...state, inventory });
  },

  updateItem(id: string, patch: Partial<Omit<InventoryItem, 'id'>>) {
    const inventory = state.inventory.map((i) => (i.id === id ? { ...i, ...patch } : i));
    commit({ ...state, inventory });
  },

  deleteItem(id: string) {
    commit({ ...state, inventory: state.inventory.filter((i) => i.id !== id) });
  },

  /** Receive a restock: add units back on hand. */
  restockItem(id: string, qty: number) {
    if (qty <= 0) return;
    const inventory = state.inventory.map((i) =>
      i.id === id ? { ...i, quantity: i.quantity + qty } : i,
    );
    commit({ ...state, inventory });
  },

  /* --- Budgets --- */
  setBudgetTotal(department: DepartmentId, total: number) {
    const budgets = state.budgets.map((b) =>
      b.department === department ? { ...b, total } : b,
    );
    commit({ ...state, budgets });
  },

  /* --- Event requests --- */
  createRequest(payload: Omit<EventRequest, 'id' | 'status' | 'createdAt' | 'chargedCost'>) {
    const req: EventRequest = {
      ...payload,
      id: uid('req'),
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 10),
      chargedCost: 0,
    };
    commit({ ...state, requests: [req, ...clone(state.requests)] });
    return req.id;
  },

  /** Approve a request: draws inventory down and charges the department budget.
   *  Returns the blockers if it could not proceed (stock / budget). */
  approveRequest(id: string): ApprovalBlock[] {
    const req = state.requests.find((r) => r.id === id);
    if (!req || req.status !== 'pending') return [];

    const blockers = approvalBlockers(state, req);
    if (blockers.length > 0) return blockers;

    const cost = requestCost(state.inventory, req);

    const inventory = state.inventory.map((i) => {
      const line = req.lines.find((l) => l.itemId === i.id);
      return line ? { ...i, quantity: i.quantity - line.quantity } : i;
    });
    const budgets = state.budgets.map((b) =>
      b.department === req.department ? { ...b, spent: b.spent + cost } : b,
    );
    const requests = state.requests.map((r) =>
      r.id === id ? { ...r, status: 'approved' as RequestStatus, chargedCost: cost } : r,
    );

    commit({ ...state, inventory, budgets, requests });
    return [];
  },

  rejectRequest(id: string, reason: string) {
    const requests = state.requests.map((r) =>
      r.id === id && r.status === 'pending'
        ? { ...r, status: 'rejected' as RequestStatus, rejectReason: reason }
        : r,
    );
    commit({ ...state, requests });
  },

  /** Send a pending request back to the requester for changes, with a reason. */
  sendBackRequest(id: string, reason: string) {
    const requests = state.requests.map((r) =>
      r.id === id && r.status === 'pending'
        ? { ...r, status: 'sent_back' as RequestStatus, sentBackReason: reason }
        : r,
    );
    commit({ ...state, requests });
  },

  /** Mark an approved request as fulfilled (items handed over). */
  fulfillRequest(id: string) {
    const requests = state.requests.map((r) =>
      r.id === id && r.status === 'approved'
        ? { ...r, status: 'fulfilled' as RequestStatus }
        : r,
    );
    commit({ ...state, requests });
  },

  reset() {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
    commit(SEED);
  },
};

/* -------------------------------------------------------------------------- */
/* Hooks                                                                      */
/* -------------------------------------------------------------------------- */

export function useRooms(): FacilityRoom[] {
  return useSyncExternalStore(subscribe, () => state.rooms, () => SEED.rooms);
}

export function useInventory(): InventoryItem[] {
  return useSyncExternalStore(subscribe, () => state.inventory, () => SEED.inventory);
}

export function useEventRequests(): EventRequest[] {
  return useSyncExternalStore(subscribe, () => state.requests, () => SEED.requests);
}

export function useBudgets(): Budget[] {
  return useSyncExternalStore(subscribe, () => state.budgets, () => SEED.budgets);
}
