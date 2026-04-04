import { useEffect, useRef, useState } from 'react';
import type { KnowledgeObjectRow } from '../services/storage';
import { searchKnowledgeObjects } from '../services/storage';
import { useLibraryContext } from '../providers/LibraryProvider';

interface UseSearchResult {
  results: KnowledgeObjectRow[];
  isSearching: boolean;
}

export function useSearch(query: string): UseSearchResult {
  const [results, setResults] = useState<KnowledgeObjectRow[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { items } = useLibraryContext();
  const itemCount = items.length;
  const latestQuery = useRef(query);
  latestQuery.current = query;

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const found = await searchKnowledgeObjects(latestQuery.current.trim());
        setResults(found);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, itemCount]);

  return { results, isSearching };
}
