'use client';

// Client-side store for submitted equivalency requests, backing the
// "Submitted requests" dashboard (Equivalency Screen Feedback). The workflow
// is a self-contained, demo-style flow with no request persistence on the
// backend, so each request being worked on is mirrored into localStorage and
// the dashboard reads from there. A custom event keeps any open tab in sync.

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cck.equivalency.requests';
const CHANGE_EVENT = 'cck-equivalency-requests-changed';

// Mirrors the workflow stages so the dashboard can show where each request is.
export type EquivalencyRequestStage = 'form' | 'vp' | 'student' | 'done';

export interface EquivalencyRequestRecord {
  id: string;
  stage: EquivalencyRequestStage;
  applicant: string;
  civilId: string;
  major: string;
  secondMajor: string;
  source: 'paaet' | 'public' | 'private';
  sourceInstitution: string;
  courseCount: number;
  totalCredits: number;
  /** True when the mapping currently has blocking policy violations. */
  blocked: boolean;
  /** Epoch ms of the last update — stamped here so callers stay deterministic. */
  updatedAt: number;
}

/** Generate a stable request id, with a fallback for older browsers. */
export function makeRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function read(): EquivalencyRequestRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EquivalencyRequestRecord[]) : [];
  } catch {
    return [];
  }
}

function write(records: EquivalencyRequestRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* ignore quota / serialization errors — the dashboard is best-effort */
  }
}

export function loadEquivalencyRequests(): EquivalencyRequestRecord[] {
  return read().sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Insert or update a request by id, stamping the update time. */
export function upsertEquivalencyRequest(
  record: Omit<EquivalencyRequestRecord, 'updatedAt'>,
): void {
  const records = read();
  const next: EquivalencyRequestRecord = { ...record, updatedAt: Date.now() };
  const idx = records.findIndex((r) => r.id === record.id);
  if (idx >= 0) records[idx] = next;
  else records.push(next);
  write(records);
}

export function removeEquivalencyRequest(id: string): void {
  write(read().filter((r) => r.id !== id));
}

export function clearEquivalencyRequests(): void {
  write([]);
}

/** React hook that returns the tracked requests and re-renders on any change
 *  (same tab via the custom event, other tabs via the storage event). */
export function useEquivalencyRequests(): EquivalencyRequestRecord[] {
  const [records, setRecords] = useState<EquivalencyRequestRecord[]>([]);
  useEffect(() => {
    const sync = () => setRecords(loadEquivalencyRequests());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return records;
}
