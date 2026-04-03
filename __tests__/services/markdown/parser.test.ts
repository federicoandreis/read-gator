import { generateMarkdown } from '../../../services/markdown/generator';
import { parseMarkdown } from '../../../services/markdown/parser';
import type { KnowledgeObject } from '../../../types/knowledgeObject';

const FIXTURE: KnowledgeObject = {
  id: 'round-trip-id',
  title: 'Round-trip Test',
  source: {
    url: 'https://example.com/round-trip',
    type: 'blog',
    captured_at: '2026-04-03T10:00:00Z',
    domain: 'example.com',
  },
  summary: 'This tests the round-trip of generate → parse.',
  key_points: ['First point', 'Second point', 'Third point'],
  tags: {
    topics: ['round-trip', 'parser'],
    domain: 'technology',
    format: 'article',
    priority: 'high',
  },
  entities: [
    { name: 'TypeScript', type: 'product', relevance: 'Language used' },
  ],
  why_it_matters: 'Ensures data integrity.',
  follow_up: 'Add more tests.',
  confidence: { extraction_quality: 'high', notes: null },
  raw_content_preview: 'preview',
  processing: {
    model: 'llama3.2:3b',
    processed_at: '2026-04-03T10:01:00Z',
    prompt_version: 'v1',
  },
};

describe('parseMarkdown', () => {
  it('round-trips title correctly', () => {
    const md = generateMarkdown(FIXTURE);
    const parsed = parseMarkdown(FIXTURE.id, md);
    expect(parsed.title).toBe(FIXTURE.title);
  });

  it('round-trips key points', () => {
    const md = generateMarkdown(FIXTURE);
    const parsed = parseMarkdown(FIXTURE.id, md);
    expect(parsed.key_points).toEqual(FIXTURE.key_points);
  });

  it('round-trips tags', () => {
    const md = generateMarkdown(FIXTURE);
    const parsed = parseMarkdown(FIXTURE.id, md);
    expect(parsed.tags.topics).toEqual(FIXTURE.tags.topics);
    expect(parsed.tags.priority).toBe(FIXTURE.tags.priority);
  });

  it('round-trips source URL', () => {
    const md = generateMarkdown(FIXTURE);
    const parsed = parseMarkdown(FIXTURE.id, md);
    expect(parsed.source.url).toBe(FIXTURE.source.url);
  });

  it('round-trips entities', () => {
    const md = generateMarkdown(FIXTURE);
    const parsed = parseMarkdown(FIXTURE.id, md);
    expect(parsed.entities[0]?.name).toBe('TypeScript');
    expect(parsed.entities[0]?.type).toBe('product');
  });

  it('round-trips follow_up', () => {
    const md = generateMarkdown(FIXTURE);
    const parsed = parseMarkdown(FIXTURE.id, md);
    expect(parsed.follow_up).toBe(FIXTURE.follow_up);
  });
});
