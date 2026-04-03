import type { ExtractedContent } from '../../types/extractedContent';

export const PROMPT_VERSION = 'v1';

export function buildPrompt(content: ExtractedContent): string {
  const sourceInfo = [
    content.source.url ? `URL: ${content.source.url}` : null,
    content.source.title ? `Title: ${content.source.title}` : null,
    content.source.author ? `Author: ${content.source.author}` : null,
    content.source.publishDate ? `Published: ${content.source.publishDate}` : null,
    content.source.description ? `Description: ${content.source.description}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const qualityNote = content.extractionNotes
    ? `\nExtraction notes: ${content.extractionNotes}`
    : '';
  const truncationNote = content.truncated
    ? `\nNote: content was truncated from ${content.originalLength} characters.`
    : '';

  return `You are a knowledge extraction assistant. Analyse the following content and return a structured JSON knowledge object.

## Source information
${sourceInfo || 'Source: pasted text'}
Extraction quality: ${content.extractionQuality}${qualityNote}${truncationNote}

## Content
${content.text}

## Instructions
Return a single JSON object with exactly this structure. Do not include any text outside the JSON.

{
  "id": "<generate a UUID v4>",
  "title": "<concise, descriptive title>",
  "source": {
    "url": "<url or null>",
    "type": "<article|blog|paper|tweet|thread|video|podcast|text|other>",
    "captured_at": "<ISO 8601 timestamp for now>",
    "domain": "<domain name or null>"
  },
  "summary": "<2-4 sentences summarising the content>",
  "key_points": ["<point 1>", "<point 2>", "..."],
  "tags": {
    "topics": ["<topic 1>", "<topic 2>", "..."],
    "domain": "<broad domain e.g. technology, science, business>",
    "format": "<article|tutorial|opinion|news|research|reference|other>",
    "priority": "<high|medium|low>"
  },
  "entities": [
    {
      "name": "<entity name>",
      "type": "<person|company|product|concept|place>",
      "relevance": "<brief note on why this entity matters in context>"
    }
  ],
  "why_it_matters": "<1-2 sentences on the broader significance>",
  "follow_up": "<suggested next action or related query, or null>",
  "confidence": {
    "extraction_quality": "${content.extractionQuality}",
    "notes": "<any caveats about quality, or null>"
  },
  "raw_content_preview": "${content.text.slice(0, 500).replace(/"/g, '\\"').replace(/\n/g, ' ')}",
  "processing": {
    "model": "<your model identifier>",
    "processed_at": "<ISO 8601 timestamp for now>",
    "prompt_version": "${PROMPT_VERSION}"
  }
}`;
}
