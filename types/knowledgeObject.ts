export type SourceType =
  | 'article'
  | 'blog'
  | 'paper'
  | 'tweet'
  | 'thread'
  | 'video'
  | 'podcast'
  | 'text'
  | 'other';

export type Priority = 'high' | 'medium' | 'low';

export type EntityType = 'person' | 'company' | 'product' | 'concept' | 'place';

export type ExtractionQuality = 'high' | 'medium' | 'low';

export interface Entity {
  name: string;
  type: EntityType;
  relevance: string;
}

export interface KnowledgeObject {
  id: string;
  title: string;
  source: {
    url: string | null;
    type: SourceType;
    captured_at: string;
    domain: string | null;
  };
  summary: string;
  key_points: string[];
  tags: {
    topics: string[];
    domain: string;
    format: string;
    priority: Priority;
  };
  entities: Entity[];
  why_it_matters: string;
  follow_up: string | null;
  confidence: {
    extraction_quality: ExtractionQuality;
    notes: string | null;
  };
  raw_content_preview: string;
  processing: {
    model: string;
    processed_at: string;
    prompt_version: string;
  };
}
