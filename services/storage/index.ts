import type { KnowledgeObject } from '../../types/knowledgeObject';
import { generateMarkdown } from '../markdown/generator';
import { parseMarkdown } from '../markdown/parser';
import {
  writeMarkdownFile,
  readMarkdownFile,
  deleteMarkdownFile,
  listMarkdownFiles,
} from './files';
import {
  insertKnowledgeObject,
  queryAllObjects,
  searchObjects,
  queryByTag,
  deleteObject,
  type KnowledgeObjectRow,
} from './database';

/**
 * Saves a knowledge object to both markdown file and SQLite index.
 */
export async function saveKnowledgeObject(obj: KnowledgeObject): Promise<void> {
  const markdown = generateMarkdown(obj);
  await writeMarkdownFile(obj.id, markdown);
  await insertKnowledgeObject(obj);
}

/**
 * Reads a full knowledge object from the markdown file (source of truth).
 */
export async function loadKnowledgeObject(id: string): Promise<KnowledgeObject> {
  const markdown = await readMarkdownFile(id);
  return parseMarkdown(id, markdown);
}

/**
 * Deletes a knowledge object from both storage layers.
 */
export async function removeKnowledgeObject(id: string): Promise<void> {
  deleteMarkdownFile(id);
  await deleteObject(id);
}

/**
 * Returns all knowledge object rows from the SQLite index.
 * For full objects, call loadKnowledgeObject per item.
 */
export async function listAllObjects(): Promise<KnowledgeObjectRow[]> {
  return queryAllObjects();
}

export async function searchKnowledgeObjects(query: string): Promise<KnowledgeObjectRow[]> {
  return searchObjects(query);
}

export async function filterByTag(tag: string): Promise<KnowledgeObjectRow[]> {
  return queryByTag(tag);
}

/**
 * Rebuilds the SQLite index from the markdown files on disk.
 * Call this if the database is lost or corrupted.
 */
export async function rebuildIndex(): Promise<void> {
  const ids = listMarkdownFiles();
  for (const id of ids) {
    try {
      const obj = await loadKnowledgeObject(id);
      await insertKnowledgeObject(obj);
    } catch {
      // Skip files that cannot be parsed; log in a real implementation
    }
  }
}

export type { KnowledgeObjectRow };
