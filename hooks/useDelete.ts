import { useLibraryContext } from '../providers/LibraryProvider';
import { removeKnowledgeObject } from '../services/storage';
import { createAppError, isAppError } from '../types/errors';

interface UseDeleteResult {
  deleteItem: (id: string) => Promise<void>;
}

export function useDelete(): UseDeleteResult {
  const { dispatch } = useLibraryContext();

  async function deleteItem(id: string): Promise<void> {
    try {
      await removeKnowledgeObject(id);
      dispatch({ type: 'REMOVE', id });
    } catch (err) {
      throw isAppError(err)
        ? err
        : createAppError(
            'DELETE_ERROR',
            'Could not delete this item. Please try again.',
            true,
            { id, originalError: String(err) },
          );
    }
  }

  return { deleteItem };
}
