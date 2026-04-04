import * as SQLite from 'expo-sqlite';
import type { KnowledgeObject } from '../../types/knowledgeObject';
import { createAppError } from '../../types/errors';

const DB_NAME = 'readgator.db';
const SCHEMA_VERSION = 1;

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await runMigrations(db);
  return db;
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL
    );
  `);

  const versionRow = await database.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version LIMIT 1',
  );
  const currentVersion = versionRow?.version ?? 0;

  if (currentVersion < 1) {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS knowledge_objects (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        source_url TEXT,
        source_type TEXT NOT NULL,
        source_domain TEXT,
        captured_at TEXT NOT NULL,
        processed_at TEXT NOT NULL,
        tags_topics TEXT NOT NULL,
        tags_domain TEXT NOT NULL,
        tags_format TEXT NOT NULL,
        priority TEXT NOT NULL,
        extraction_quality TEXT NOT NULL,
        prompt_version TEXT NOT NULL,
        model TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_captured_at ON knowledge_objects(captured_at DESC);
      CREATE INDEX IF NOT EXISTS idx_priority ON knowledge_objects(priority);

      INSERT OR REPLACE INTO schema_version (version) VALUES (1);
    `);
  }
}

export async function insertKnowledgeObject(obj: KnowledgeObject): Promise<void> {
  const database = await getDatabase();
  try {
    await database.runAsync(
      `INSERT OR REPLACE INTO knowledge_objects
        (id, title, source_url, source_type, source_domain, captured_at, processed_at,
         tags_topics, tags_domain, tags_format, priority, extraction_quality, prompt_version, model)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      obj.id,
      obj.title,
      obj.source.url,
      obj.source.type,
      obj.source.domain,
      obj.source.captured_at,
      obj.processing.processed_at,
      obj.tags.topics.join(','),
      obj.tags.domain,
      obj.tags.format,
      obj.tags.priority,
      obj.confidence.extraction_quality,
      obj.processing.prompt_version,
      obj.processing.model,
    );
  } catch (err) {
    throw createAppError(
      'DB_INSERT_ERROR',
      'Failed to save knowledge object to database.',
      true,
      { id: obj.id, originalError: String(err) },
    );
  }
}

export interface KnowledgeObjectRow {
  id: string;
  title: string;
  source_url: string | null;
  source_type: string;
  source_domain: string | null;
  captured_at: string;
  processed_at: string;
  tags_topics: string;
  tags_domain: string;
  tags_format: string;
  priority: string;
  extraction_quality: string;
  prompt_version: string;
  model: string;
}

export async function queryAllObjects(): Promise<KnowledgeObjectRow[]> {
  const database = await getDatabase();
  return database.getAllAsync<KnowledgeObjectRow>(
    'SELECT * FROM knowledge_objects ORDER BY captured_at DESC',
  );
}

export async function searchObjects(query: string): Promise<KnowledgeObjectRow[]> {
  const database = await getDatabase();
  const pattern = `%${query}%`;
  return database.getAllAsync<KnowledgeObjectRow>(
    `SELECT * FROM knowledge_objects
     WHERE title LIKE ? OR tags_topics LIKE ? OR tags_domain LIKE ?
        OR source_url LIKE ? OR source_domain LIKE ?
     ORDER BY captured_at DESC`,
    pattern,
    pattern,
    pattern,
    pattern,
    pattern,
  );
}

export async function queryByTag(tag: string): Promise<KnowledgeObjectRow[]> {
  const database = await getDatabase();
  const pattern = `%${tag}%`;
  return database.getAllAsync<KnowledgeObjectRow>(
    'SELECT * FROM knowledge_objects WHERE tags_topics LIKE ? ORDER BY captured_at DESC',
    pattern,
  );
}

export async function deleteObject(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM knowledge_objects WHERE id = ?', id);
}
