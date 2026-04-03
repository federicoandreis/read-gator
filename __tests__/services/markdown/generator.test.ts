import { generateMarkdown } from '../../../services/markdown/generator';
import type { KnowledgeObject } from '../../../types/knowledgeObject';

const FIXTURE: KnowledgeObject = {
  id: 'test-id-123',
  title: 'Test Article',
  source: {
    url: 'https://example.com/article',
    type: 'article',
    captured_at: '2026-04-03T10:00:00Z',
    domain: 'example.com',
  },
  summary: 'A test summary.',
  key_points: ['Point one', 'Point two'],
  tags: {
    topics: ['testing', 'javascript'],
    domain: 'technology',
    format: 'article',
    priority: 'medium',
  },
  entities: [{ name: 'Jest', type: 'product', relevance: 'Used for testing' }],
  why_it_matters: 'Tests are important.',
  follow_up: 'Read the docs.',
  confidence: { extraction_quality: 'high', notes: null },
  raw_content_preview: 'Some preview text',
  processing: {
    model: 'llama3.2:3b',
    processed_at: '2026-04-03T10:01:00Z',
    prompt_version: 'v1',
  },
};

describe('generateMarkdown', () => {
  it('includes the title as an h1', () => {
    const md = generateMarkdown(FIXTURE);
    expect(md).toContain('# Test Article');
  });

  it('includes the source URL', () => {
    const md = generateMarkdown(FIXTURE);
    expect(md).toContain('https://example.com/article');
  });

  it('includes all key points as bullets', () => {
    const md = generateMarkdown(FIXTURE);
    expect(md).toContain('- Point one');
    expect(md).toContain('- Point two');
  });

  it('includes tags', () => {
    const md = generateMarkdown(FIXTURE);
    expect(md).toContain('testing, javascript');
  });

  it('includes entities', () => {
    const md = generateMarkdown(FIXTURE);
    expect(md).toContain('**Jest** (product): Used for testing');
  });

  it('includes the processing footer', () => {
    const md = generateMarkdown(FIXTURE);
    expect(md).toContain('llama3.2:3b');
    expect(md).toContain('Prompt v1');
  });

  it('handles null follow_up without a follow-up section', () => {
    const md = generateMarkdown({ ...FIXTURE, follow_up: null });
    expect(md).not.toContain('## Follow-up');
  });
});
