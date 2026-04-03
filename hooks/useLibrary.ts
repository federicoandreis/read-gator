import { useLibraryContext } from '../providers/LibraryProvider';
import type { KnowledgeObjectRow } from '../services/storage';

interface UseLibraryResult {
  items: KnowledgeObjectRow[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useLibrary(): UseLibraryResult {
  const { items, isLoading, refresh } = useLibraryContext();
  return { items, isLoading, refresh };
}
