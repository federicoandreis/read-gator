import { validateKnowledgeObject } from '../../../services/llm/validation';

describe('validateKnowledgeObject', () => {
  it('throws if input is not an object', () => {
    expect(() => validateKnowledgeObject('string')).toThrow();
    expect(() => validateKnowledgeObject(null)).toThrow();
    expect(() => validateKnowledgeObject(42)).toThrow();
  });

  it('returns a valid object from well-formed input', () => {
    const raw = {
      id: 'abc-123',
      title: 'Test',
      source: { url: 'https://x.com', type: 'article', captured_at: '2026-04-03T00:00:00Z', domain: 'x.com' },
      summary: 'A summary.',
      key_points: ['Point 1'],
      tags: { topics: ['tech'], domain: 'technology', format: 'article', priority: 'high' },
      entities: [{ name: 'React', type: 'product', relevance: 'Framework used' }],
      why_it_matters: 'Matters.',
      follow_up: null,
      confidence: { extraction_quality: 'high', notes: null },
      raw_content_preview: 'preview',
      processing: { model: 'llama3', processed_at: '2026-04-03T00:01:00Z', prompt_version: 'v1' },
    };
    const result = validateKnowledgeObject(raw);
    expect(result.title).toBe('Test');
    expect(result.tags.priority).toBe('high');
    expect(result.entities[0]?.name).toBe('React');
  });

  it('uses fallback values for missing fields', () => {
    const result = validateKnowledgeObject({});
    expect(result.title).toBe('Untitled');
    expect(result.tags.priority).toBe('medium');
    expect(result.source.type).toBe('other');
    expect(result.confidence.extraction_quality).toBe('medium');
  });

  it('coerces invalid source type to "other"', () => {
    const result = validateKnowledgeObject({ source: { type: 'invalid-type' } });
    expect(result.source.type).toBe('other');
  });

  it('coerces invalid priority to "medium"', () => {
    const result = validateKnowledgeObject({ tags: { priority: 'critical' } });
    expect(result.tags.priority).toBe('medium');
  });

  it('filters invalid entity types to "concept"', () => {
    const result = validateKnowledgeObject({
      entities: [{ name: 'X', type: 'alien', relevance: 'whatever' }],
    });
    expect(result.entities[0]?.type).toBe('concept');
  });
});
