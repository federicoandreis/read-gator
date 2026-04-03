import type { ExtractedContent } from '../../types/extractedContent';
import type { KnowledgeObject } from '../../types/knowledgeObject';

export interface LLMService {
  process(content: ExtractedContent): Promise<KnowledgeObject>;
  healthCheck(): Promise<boolean>;
}

export interface LLMConfig {
  baseUrl: string;
  model: string;
  timeoutMs?: number;
}
