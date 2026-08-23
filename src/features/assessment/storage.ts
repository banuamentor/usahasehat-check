import type { AnswerMap, BusinessProfile } from "@/types/assessment";

const DRAFT_PREFIX = "bhc:draft:";
const INDEX_KEY = "bhc:drafts";

export interface AssessmentDraft {
  id: string;
  profile: BusinessProfile;
  answers: AnswerMap;
  currentIndex: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createDraftId(): string {
  return `bhc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function saveDraft(draft: AssessmentDraft): void {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(DRAFT_PREFIX + draft.id, JSON.stringify(draft));
  const ids = listDraftIds().filter((id) => id !== draft.id);
  storage.setItem(INDEX_KEY, JSON.stringify([draft.id, ...ids].slice(0, 25)));
}

export function loadDraft(id: string): AssessmentDraft | null {
  const storage = safeStorage();
  if (!storage) return null;
  const raw = storage.getItem(DRAFT_PREFIX + id);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AssessmentDraft;
  } catch {
    return null;
  }
}

export function listDraftIds(): string[] {
  const storage = safeStorage();
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(INDEX_KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function listDrafts(): AssessmentDraft[] {
  return listDraftIds()
    .map((id) => loadDraft(id))
    .filter((draft): draft is AssessmentDraft => draft !== null);
}

export function deleteDraft(id: string): void {
  const storage = safeStorage();
  if (!storage) return;
  storage.removeItem(DRAFT_PREFIX + id);
  storage.setItem(INDEX_KEY, JSON.stringify(listDraftIds().filter((item) => item !== id)));
}
