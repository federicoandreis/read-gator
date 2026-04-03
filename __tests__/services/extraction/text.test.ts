import { extractFromText, looksLikeUrl } from '../../../services/extraction/text';

describe('extractFromText', () => {
  it('returns extracted content for plain text', () => {
    const result = extractFromText('Hello, world. This is some input text.');
    expect(result.text).toBe('Hello, world. This is some input text.');
    expect(result.source.type).toBe('text');
    expect(result.extractionQuality).toBe('high');
    expect(result.truncated).toBe(false);
  });

  it('throws for empty input', () => {
    expect(() => extractFromText('')).toThrow();
    expect(() => extractFromText('   ')).toThrow();
  });

  it('normalises excess whitespace', () => {
    const result = extractFromText('Hello   world\n\n\n\nFoo');
    expect(result.text).toBe('Hello world\n\nFoo');
  });

  it('truncates very long input', () => {
    const longText = 'a'.repeat(50_000);
    const result = extractFromText(longText);
    expect(result.truncated).toBe(true);
    expect(result.text.length).toBeLessThan(longText.length);
    expect(result.originalLength).toBe(50_000);
  });
});

describe('looksLikeUrl', () => {
  it('returns true for http URLs', () => {
    expect(looksLikeUrl('https://example.com')).toBe(true);
    expect(looksLikeUrl('http://example.com/path?q=1')).toBe(true);
  });

  it('returns false for plain text', () => {
    expect(looksLikeUrl('hello world')).toBe(false);
    expect(looksLikeUrl('')).toBe(false);
  });
});
