import type { KnowledgeObject, SourceType, Priority, EntityType, ExtractionQuality } from '../../types/knowledgeObject';
import { createAppError } from '../../types/errors';

/**
 * Parses a markdown knowledge object file back into a KnowledgeObject.
 * Used to rebuild the SQLite index from the markdown source of truth.
 */
export function parseMarkdown(id: string, markdown: string): KnowledgeObject {
  const lines = markdown.split('\n');

  const title = extractHeading(lines, 1) ?? 'Untitled';

  const sourceSection = extractSection(lines, 'Source');
  const url = extractBulletValue(sourceSection, 'URL') || null;
  const type = (extractBulletValue(sourceSection, 'Type') as SourceType) || 'other';
  const captured_at = extractBulletValue(sourceSection, 'Captured') ?? new Date().toISOString();
  const domain = extractBulletValue(sourceSection, 'Domain') || null;

  const summary = extractSection(lines, 'Summary').join('\n').trim();

  const keyPointsLines = extractSection(lines, 'Key points');
  const key_points = keyPointsLines
    .filter((l) => l.startsWith('- '))
    .map((l) => l.slice(2).trim());

  const tagsSection = extractSection(lines, 'Tags');
  const topics = (extractBulletValue(tagsSection, 'Topics') ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const tagsDomain = extractBulletValue(tagsSection, 'Domain') ?? '';
  const format = extractBulletValue(tagsSection, 'Format') ?? '';
  const priority = (extractBulletValue(tagsSection, 'Priority') as Priority) ?? 'medium';

  const entitiesSection = extractSection(lines, 'Entities');
  const entities = entitiesSection
    .filter((l) => l.startsWith('- **'))
    .map((l) => parseEntityLine(l));

  const why_it_matters = extractSection(lines, 'Why this matters').join('\n').trim();
  const followUpLines = extractSection(lines, 'Follow-up');
  const follow_up = followUpLines.length > 0 ? followUpLines.join('\n').trim() : null;

  const footerLines = lines.filter((l) => l.startsWith('*'));
  const modelLine = footerLines.find((l) => l.startsWith('*Processed by'));
  const { model, processed_at, prompt_version } = parseFooter(modelLine ?? '');

  const confidenceLine = footerLines.find((l) => l.startsWith('*Extraction confidence:'));
  const extraction_quality = parseExtractionQuality(confidenceLine ?? '');

  return {
    id,
    title,
    source: {
      url: url === 'N/A' ? null : url,
      type,
      captured_at,
      domain: domain === 'N/A' ? null : domain,
    },
    summary,
    key_points,
    tags: { topics, domain: tagsDomain, format, priority },
    entities,
    why_it_matters,
    follow_up,
    confidence: { extraction_quality, notes: null },
    raw_content_preview: '',
    processing: { model, processed_at, prompt_version },
  };
}

function extractHeading(lines: string[], level: number): string | undefined {
  const prefix = '#'.repeat(level) + ' ';
  return lines.find((l) => l.startsWith(prefix))?.slice(prefix.length).trim();
}

function extractSection(lines: string[], heading: string): string[] {
  const start = lines.findIndex((l) => l === `## ${heading}`);
  if (start === -1) return [];

  const end = lines.findIndex(
    (l, i) => i > start && (l.startsWith('## ') || l === '---'),
  );
  const slice = end === -1 ? lines.slice(start + 1) : lines.slice(start + 1, end);
  return slice.filter((l) => l.trim() !== '');
}

function extractBulletValue(lines: string[], key: string): string | null {
  const prefix = `- **${key}:** `;
  const line = lines.find((l) => l.startsWith(prefix));
  return line ? line.slice(prefix.length).trim() : null;
}

function parseEntityLine(line: string): { name: string; type: EntityType; relevance: string } {
  // Format: - **Name** (type): relevance
  const match = line.match(/^- \*\*(.+?)\*\* \((.+?)\): (.+)$/);
  if (!match) return { name: line, type: 'concept', relevance: '' };
  return {
    name: match[1] ?? '',
    type: (match[2] as EntityType) ?? 'concept',
    relevance: match[3] ?? '',
  };
}

function parseFooter(line: string): { model: string; processed_at: string; prompt_version: string } {
  // Format: *Processed by {model} on {date} | Prompt {version}*
  const match = line.match(/\*Processed by (.+?) on (.+?) \| Prompt (.+?)\*/);
  if (!match) return { model: 'unknown', processed_at: '', prompt_version: 'v1' };
  return { model: match[1] ?? 'unknown', processed_at: match[2] ?? '', prompt_version: match[3] ?? 'v1' };
}

function parseExtractionQuality(line: string): ExtractionQuality {
  if (line.includes('high')) return 'high';
  if (line.includes('low')) return 'low';
  return 'medium';
}
