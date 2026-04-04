import { createContext, useContext, useEffect, useReducer } from 'react';
import type { KnowledgeObjectRow } from '../services/storage';
import { listAllObjects } from '../services/storage';
import type { LibraryItem } from '../types/libraryItem';
import { itemId } from '../types/libraryItem';

interface LibraryState {
  items: LibraryItem[];
  isLoading: boolean;
}

export type LibraryAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_ITEMS'; items: KnowledgeObjectRow[] }
  | { type: 'ENQUEUE'; id: string; input: string }
  | { type: 'COMPLETE'; id: string; data: KnowledgeObjectRow }
  | { type: 'FAIL'; id: string; error: string }
  | { type: 'REMOVE'; id: string };

function reducer(state: LibraryState, action: LibraryAction): LibraryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: true };

    case 'SET_ITEMS':
      return {
        isLoading: false,
        items: action.items.map((data) => ({ kind: 'complete', data })),
      };

    case 'ENQUEUE':
      return {
        ...state,
        items: [
          { kind: 'processing', id: action.id, input: action.input, startedAt: new Date().toISOString() },
          ...state.items,
        ],
      };

    case 'COMPLETE':
      return {
        ...state,
        items: state.items.map((item) =>
          itemId(item) === action.id ? { kind: 'complete', data: action.data } : item,
        ),
      };

    case 'FAIL':
      return {
        ...state,
        items: state.items.map((item) =>
          itemId(item) === action.id && item.kind === 'processing'
            ? { kind: 'failed', id: item.id, input: item.input, startedAt: item.startedAt, error: action.error }
            : item,
        ),
      };

    case 'REMOVE':
      return {
        ...state,
        items: state.items.filter((item) => itemId(item) !== action.id),
      };
  }
}

interface LibraryContextValue extends LibraryState {
  dispatch: React.Dispatch<LibraryAction>;
  refresh: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], isLoading: true });

  async function refresh() {
    dispatch({ type: 'SET_LOADING' });
    try {
      const items = await listAllObjects();
      dispatch({ type: 'SET_ITEMS', items });
    } catch {
      dispatch({ type: 'SET_ITEMS', items: [] });
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <LibraryContext.Provider value={{ ...state, dispatch, refresh }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibraryContext(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibraryContext must be used within LibraryProvider');
  return ctx;
}
