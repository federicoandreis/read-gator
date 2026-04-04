import { useLibraryContext } from '../providers/LibraryProvider';
import type { LibraryItem } from '../types/libraryItem';

interface UseLibraryResult {
  items: LibraryItem[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useLibrary(): UseLibraryResult {
  const { items, isLoading, refresh } = useLibraryContext();
  return { items, isLoading, refresh };
}
