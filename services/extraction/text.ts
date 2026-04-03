import type { ExtractedContent } from '../../types/extractedContent';
import { createAppError } from '../../types/errors';

const MAX_CONTENT_CHARS = 8_000 * 5;
const URL_PATTERN = /^https?:\/\/\S+$/i;

export function extractFromText(rawText: string): ExtractedContent {
  const trimmed = rawText.trim();

  if (trimmed.length === 0) {
    throw createAppError(
      'EXTRACTION_EMPTY_INPUT',
      'Please enter some text to capture.',
      false,
    );
  }

  const normalised = normaliseWhitespace(trimmed);
  const originalLength = normalised.length;
  const truncated = normalised.length > MAX_CONTENT_CHARS;
  const text = truncated ? normalised.slice(0, MAX_CONTENT_CHARS) : normalised;

  return {
    text,
    source: { type: 'text' },
    extractionQuality: 'high',
    extractionNotes: truncated ? `Content truncated from ${originalLength} characters.` : undefined,
    truncated,
    originalLength,
  };
}

export function looksLikeUrl(text: string): boolean {
  return URL_PATTERN.test(text.trim());
}

function normaliseWhitespace(text: string): string {
  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
