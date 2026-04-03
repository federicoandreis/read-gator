import type { ExtractedContent } from '../../types/extractedContent';
import { createAppError } from '../../types/errors';

const MAX_CONTENT_CHARS = 8_000 * 5; // ~8000 words at ~5 chars/word
const MAX_REDIRECTS = 5;
const PAYWALL_THRESHOLD_CHARS = 100;

export async function extractFromUrl(url: string): Promise<ExtractedContent> {
  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
  } catch (err) {
    throw createAppError(
      'EXTRACTION_NETWORK_ERROR',
      'Could not reach that URL. Check your connection and try again.',
      true,
      { url, originalError: String(err) },
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw createAppError(
      'EXTRACTION_HTTP_ERROR',
      `The page returned an error (${response.status}). The URL may be broken or require a login.`,
      true,
      { url, status: response.status },
    );
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/pdf')) {
    throw createAppError(
      'EXTRACTION_PDF_UNSUPPORTED',
      'PDF support is coming in a future update. Try pasting the text directly.',
      false,
      { url },
    );
  }

  if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
    throw createAppError(
      'EXTRACTION_UNSUPPORTED_TYPE',
      `This URL returns a file type (${contentType}) that ReadGator cannot process yet.`,
      false,
      { url, contentType },
    );
  }

  const html = await response.text();
  const domain = extractDomain(url);
  const metadata = extractMetadata(html, url);
  const bodyText = extractReadableText(html);

  const isLikelyPaywalled = bodyText.length < PAYWALL_THRESHOLD_CHARS;
  const extractionQuality = isLikelyPaywalled ? 'low' : bodyText.length < 500 ? 'medium' : 'high';

  const originalLength = bodyText.length;
  const truncated = bodyText.length > MAX_CONTENT_CHARS;
  const text = truncated ? bodyText.slice(0, MAX_CONTENT_CHARS) : bodyText;

  const extractionNotes = buildExtractionNotes({ isLikelyPaywalled, truncated, originalLength });

  return {
    text: text || metadata.description || metadata.title || '',
    source: {
      type: 'url',
      url,
      title: metadata.title,
      author: metadata.author,
      publishDate: metadata.publishDate,
      domain,
      description: metadata.description,
    },
    extractionQuality,
    extractionNotes,
    truncated,
    originalLength,
  };
}

function extractDomain(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

interface PageMetadata {
  title?: string;
  description?: string;
  author?: string;
  publishDate?: string;
}

function extractMetadata(html: string, _url: string): PageMetadata {
  const meta: PageMetadata = {};

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch?.[1]) meta.title = decodeHtmlEntities(titleMatch[1].trim());

  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (ogTitle?.[1]) meta.title = decodeHtmlEntities(ogTitle[1]);

  const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  const desc = ogDesc?.[1] ?? metaDesc?.[1];
  if (desc) meta.description = decodeHtmlEntities(desc);

  const authorMatch = html.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i);
  if (authorMatch?.[1]) meta.author = decodeHtmlEntities(authorMatch[1]);

  const dateMatch =
    html.match(/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i) ??
    html.match(/<time[^>]+datetime=["']([^"']+)["']/i);
  if (dateMatch?.[1]) meta.publishDate = dateMatch[1];

  return meta;
}

function extractReadableText(html: string): string {
  // Remove script, style, nav, footer, header, aside blocks
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '');

  // Convert block elements to newlines
  text = text
    .replace(/<\/?(p|div|br|h[1-6]|li|blockquote|pre)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');

  text = decodeHtmlEntities(text);

  // Normalise whitespace
  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function buildExtractionNotes(opts: {
  isLikelyPaywalled: boolean;
  truncated: boolean;
  originalLength: number;
}): string | undefined {
  const notes: string[] = [];
  if (opts.isLikelyPaywalled) notes.push('Content may be paywalled — only metadata available.');
  if (opts.truncated) notes.push(`Content truncated from ${opts.originalLength} characters.`);
  return notes.length > 0 ? notes.join(' ') : undefined;
}
