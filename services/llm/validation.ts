import type { KnowledgeObject, SourceType, Priority, EntityType, ExtractionQuality } from '../../types/knowledgeObject';
import { createAppError } from '../../types/errors';

const SOURCE_TYPES: SourceType[] = ['article', 'blog', 'paper', 'tweet', 'thread', 'video', 'podcast', 'text', 'other'];
const PRIORITIES: Priority[] = ['high', 'medium', 'low'];
const ENTITY_TYPES: EntityType[] = ['person', 'company', 'product', 'concept', 'place'];
const EXTRACTION_QUALITIES: ExtractionQuality[] = ['high', 'medium', 'low'];

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(isString);
}

function isSourceType(v: unknown): v is SourceType {
  return isString(v) && (SOURCE_TYPES as string[]).includes(v);
}

function isPriority(v: unknown): v is Priority {
  return isString(v) && (PRIORITIES as string[]).includes(v);
}

function isEntityType(v: unknown): v is EntityType {
  return isString(v) && (ENTITY_TYPES as string[]).includes(v);
}

function isExtractionQuality(v: unknown): v is ExtractionQuality {
  return isString(v) && (EXTRACTION_QUALITIES as string[]).includes(v);
}

function asString(v: unknown, fallback: string): string {
  return isString(v) ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  return isStringArray(v) ? v : [];
}

/**
 * Validates and sanitises raw LLM output into a KnowledgeObject.
 * Throws an AppError if the structure is so broken it cannot be recovered.
 */
export function validateKnowledgeObject(raw: unknown): KnowledgeObject {
  if (typeof raw !== 'object' || raw === null) {
    throw createAppError('LLM_INVALID_OUTPUT', 'LLM output is not an object.', true);
  }

  const r = raw as Record<string, unknown>;
  const source = typeof r['source'] === 'object' && r['source'] !== null
    ? r['source'] as Record<string, unknown>
    : {};
  const tags = typeof r['tags'] === 'object' && r['tags'] !== null
    ? r['tags'] as Record<string, unknown>
    : {};
  const confidence = typeof r['confidence'] === 'object' && r['confidence'] !== null
    ? r['confidence'] as Record<string, unknown>
    : {};
  const processing = typeof r['processing'] === 'object' && r['processing'] !== null
    ? r['processing'] as Record<string, unknown>
    : {};

  const rawEntities = Array.isArray(r['entities']) ? r['entities'] : [];
  const entities = rawEntities
    .filter((e): e is Record<string, unknown> => typeof e === 'object' && e !== null)
    .map((e) => ({
      name: asString(e['name'], 'Unknown'),
      type: isEntityType(e['type']) ? e['type'] : 'concept' as EntityType,
      relevance: asString(e['relevance'], ''),
    }));

  return {
    id: asString(r['id'], generateUuid()),
    title: asString(r['title'], 'Untitled'),
    source: {
      url: isString(source['url']) ? source['url'] : null,
      type: isSourceType(source['type']) ? source['type'] : 'other',
      captured_at: asString(source['captured_at'], new Date().toISOString()),
      domain: isString(source['domain']) ? source['domain'] : null,
    },
    summary: asString(r['summary'], ''),
    key_points: asStringArray(r['key_points']),
    tags: {
      topics: asStringArray(tags['topics']),
      domain: asString(tags['domain'], ''),
      format: asString(tags['format'], ''),
      priority: isPriority(tags['priority']) ? tags['priority'] : 'medium',
    },
    entities,
    why_it_matters: asString(r['why_it_matters'], ''),
    follow_up: isString(r['follow_up']) ? r['follow_up'] : null,
    confidence: {
      extraction_quality: isExtractionQuality(confidence['extraction_quality'])
        ? confidence['extraction_quality']
        : 'medium',
      notes: isString(confidence['notes']) ? confidence['notes'] : null,
    },
    raw_content_preview: asString(r['raw_content_preview'], ''),
    processing: {
      model: asString(processing['model'], 'unknown'),
      processed_at: asString(processing['processed_at'], new Date().toISOString()),
      prompt_version: asString(processing['prompt_version'], 'v1'),
    },
  };
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
