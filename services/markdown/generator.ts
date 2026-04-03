import type { KnowledgeObject } from '../../types/knowledgeObject';

export function generateMarkdown(obj: KnowledgeObject): string {
  const lines: string[] = [];

  lines.push(`# ${obj.title}`, '');

  lines.push('## Source');
  lines.push(`- **URL:** ${obj.source.url ?? 'N/A'}`);
  lines.push(`- **Type:** ${obj.source.type}`);
  lines.push(`- **Captured:** ${obj.source.captured_at}`);
  lines.push(`- **Domain:** ${obj.source.domain ?? 'N/A'}`);
  lines.push('');

  lines.push('## Summary');
  lines.push(obj.summary);
  lines.push('');

  lines.push('## Key points');
  for (const point of obj.key_points) {
    lines.push(`- ${point}`);
  }
  lines.push('');

  lines.push('## Tags');
  lines.push(`- **Topics:** ${obj.tags.topics.join(', ')}`);
  lines.push(`- **Domain:** ${obj.tags.domain}`);
  lines.push(`- **Format:** ${obj.tags.format}`);
  lines.push(`- **Priority:** ${obj.tags.priority}`);
  lines.push('');

  if (obj.entities.length > 0) {
    lines.push('## Entities');
    for (const entity of obj.entities) {
      lines.push(`- **${entity.name}** (${entity.type}): ${entity.relevance}`);
    }
    lines.push('');
  }

  lines.push('## Why this matters');
  lines.push(obj.why_it_matters);
  lines.push('');

  if (obj.follow_up) {
    lines.push('## Follow-up');
    lines.push(obj.follow_up);
    lines.push('');
  }

  lines.push('---');
  lines.push(
    `*Processed by ${obj.processing.model} on ${obj.processing.processed_at} | Prompt ${obj.processing.prompt_version}*`,
  );
  lines.push(`*Extraction confidence: ${obj.confidence.extraction_quality}*`);
  if (obj.confidence.notes) {
    lines.push(obj.confidence.notes);
  }

  return lines.join('\n');
}
