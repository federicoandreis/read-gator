import { useEffect, useState } from 'react';
import type { KnowledgeObjectRow } from '../services/storage';
import { searchKnowledgeObjects } from '../services/storage';

interface UseSearchResult {
  results: KnowledgeObjectRow[];
  isSearching: boolean;
}

export function useSearch(query: string): UseSearchResult {
  const [results, setResults] = useState<KnowledgeObjectRow[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const found = await searchKnowledgeObjects(query.trim());
        setResults(found);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return { results, isSearching };
}
