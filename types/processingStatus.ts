import type { AppError } from './errors';

export type ProcessingStatus =
  | { kind: 'idle' }
  | { kind: 'queued'; capturedAt: string }
  | { kind: 'extracting' }
  | { kind: 'processing' }
  | { kind: 'complete' }
  | { kind: 'failed'; error: AppError };
