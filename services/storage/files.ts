import { File, Directory, Paths } from 'expo-file-system';
import { createAppError } from '../../types/errors';

function knowledgeDir(): Directory {
  return new Directory(Paths.document, 'knowledge');
}

function rawDir(): Directory {
  return new Directory(Paths.document, 'raw');
}

function ensureDir(dir: Directory): void {
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
}

export async function writeMarkdownFile(id: string, content: string): Promise<string> {
  const dir = knowledgeDir();
  ensureDir(dir);
  const file = new File(dir, `${id}.md`);
  try {
    file.write(content);
    return file.uri;
  } catch (err) {
    throw createAppError(
      'FILE_WRITE_ERROR',
      'Failed to save the knowledge object file.',
      true,
      { id, originalError: String(err) },
    );
  }
}

export async function readMarkdownFile(id: string): Promise<string> {
  const file = new File(knowledgeDir(), `${id}.md`);
  if (!file.exists) {
    throw createAppError(
      'FILE_NOT_FOUND',
      'Could not find the knowledge object file.',
      false,
      { id },
    );
  }
  try {
    return await file.text();
  } catch (err) {
    throw createAppError(
      'FILE_READ_ERROR',
      'Could not read the knowledge object file.',
      true,
      { id, originalError: String(err) },
    );
  }
}

export function deleteMarkdownFile(id: string): void {
  const file = new File(knowledgeDir(), `${id}.md`);
  if (file.exists) {
    file.delete();
  }
}

export function listMarkdownFiles(): string[] {
  const dir = knowledgeDir();
  if (!dir.exists) return [];
  return dir
    .list()
    .filter((entry): entry is File => entry instanceof File && entry.name.endsWith('.md'))
    .map((f) => f.name.replace('.md', ''));
}

export function writeRawContent(id: string, content: string): void {
  const dir = rawDir();
  ensureDir(dir);
  new File(dir, `${id}.raw.txt`).write(content);
}
