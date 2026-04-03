import { useState } from 'react';
import { useLibraryContext } from '../providers/LibraryProvider';
import { extractFromUrl } from '../services/extraction/url';
import { extractFromText } from '../services/extraction/text';
import { OllamaService } from '../services/llm/ollama';
import { saveKnowledgeObject } from '../services/storage';
import { useSettings } from './useSettings';
import { isAppError } from '../types/errors';
import type { KnowledgeObjectRow } from '../services/storage';

interface UseCaptureResult {
  capture: (input: string, asUrl: boolean) => Promise<void>;
  isCapturing: boolean;
  error: string | null;
}

export function useCapture(): UseCaptureResult {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { dispatch } = useLibraryContext();
  const { settings } = useSettings();

  async function capture(input: string, asUrl: boolean): Promise<void> {
    setIsCapturing(true);
    setError(null);

    try {
      const extracted = asUrl
        ? await extractFromUrl(input)
        : extractFromText(input);

      const llm = new OllamaService({
        baseUrl: settings.ollamaBaseUrl,
        model: settings.ollamaModel,
      });

      const obj = await llm.process(extracted);
      await saveKnowledgeObject(obj);

      const row: KnowledgeObjectRow = {
        id: obj.id,
        title: obj.title,
        source_url: obj.source.url,
        source_type: obj.source.type,
        source_domain: obj.source.domain,
        captured_at: obj.source.captured_at,
        processed_at: obj.processing.processed_at,
        tags_topics: obj.tags.topics.join(','),
        tags_domain: obj.tags.domain,
        tags_format: obj.tags.format,
        priority: obj.tags.priority,
        extraction_quality: obj.confidence.extraction_quality,
        prompt_version: obj.processing.prompt_version,
        model: obj.processing.model,
      };

      dispatch({ type: 'ADD_ITEM', item: row });
    } catch (err) {
      const message = isAppError(err)
        ? err.message
        : `Something went wrong: ${err instanceof Error ? err.message : String(err)}`;
      setError(message);
      throw err;
    } finally {
      setIsCapturing(false);
    }
  }

  return { capture, isCapturing, error };
}
