import { createContext, useContext, useEffect, useReducer } from 'react';
import type { KnowledgeObjectRow } from '../services/storage';
import { listAllObjects } from '../services/storage';

interface LibraryState {
  items: KnowledgeObjectRow[];
  isLoading: boolean;
}

type LibraryAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_ITEMS'; items: KnowledgeObjectRow[] }
  | { type: 'ADD_ITEM'; item: KnowledgeObjectRow }
  | { type: 'REMOVE_ITEM'; id: string };

function reducer(state: LibraryState, action: LibraryAction): LibraryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: true };
    case 'SET_ITEMS':
      return { items: action.items, isLoading: false };
    case 'ADD_ITEM':
      return { ...state, items: [action.item, ...state.items] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
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
