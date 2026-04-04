import type { KnowledgeObjectRow } from '../services/storage';

export type LibraryItem =
  | { kind: 'processing'; id: string; input: string; startedAt: string }
  | { kind: 'failed'; id: string; input: string; startedAt: string; error: string }
  | { kind: 'complete'; data: KnowledgeObjectRow };

export function itemId(item: LibraryItem): string {
  return item.kind === 'complete' ? item.data.id : item.id;
}

export function itemCapturedAt(item: LibraryItem): string {
  return item.kind === 'complete' ? item.data.captured_at : item.startedAt;
}
