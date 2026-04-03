import type { ExtractedContent } from '../../types/extractedContent';
import type { KnowledgeObject } from '../../types/knowledgeObject';
import { createAppError } from '../../types/errors';
import type { LLMService, LLMConfig } from './types';
import { buildPrompt } from '../../prompts/v1/knowledge-object';
import { validateKnowledgeObject } from './validation';

export class OllamaService implements LLMService {
  private readonly config: Required<LLMConfig>;

  constructor(config: LLMConfig) {
    this.config = {
      timeoutMs: 180_000,
      ...config,
    };
  }

  async process(content: ExtractedContent): Promise<KnowledgeObject> {
    const prompt = buildPrompt(content);

    let response: Response;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          stream: false,
          format: 'json',
        }),
        signal: controller.signal,
      });
    } catch (err) {
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      throw createAppError(
        isTimeout ? 'LLM_TIMEOUT' : 'LLM_NETWORK_ERROR',
        isTimeout
          ? `Ollama did not respond within ${this.config.timeoutMs / 1000}s. The model may still be loading — try again in a moment.`
          : 'Could not reach the Ollama service. Make sure it is running on your local network.',
        true,
        { originalError: String(err) },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw createAppError(
        'LLM_REQUEST_FAILED',
        `Ollama returned an error (${response.status}).`,
        true,
        { status: response.status },
      );
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      throw createAppError('LLM_PARSE_ERROR', 'Could not parse the Ollama response.', true);
    }

    const raw =
      typeof json === 'object' && json !== null && 'response' in json
        ? (json as Record<string, unknown>).response
        : null;

    if (typeof raw !== 'string') {
      throw createAppError('LLM_UNEXPECTED_FORMAT', 'Unexpected response format from Ollama.', true);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw createAppError('LLM_JSON_PARSE_ERROR', 'LLM returned invalid JSON.', true);
    }

    return validateKnowledgeObject(parsed);
  }

  async healthCheck(): Promise<boolean> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }
}
