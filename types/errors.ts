export interface AppError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
  recoverable: boolean;
}

export function createAppError(
  code: string,
  message: string,
  recoverable: boolean,
  context?: Record<string, unknown>,
): AppError {
  return { code, message, recoverable, context };
}

export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'recoverable' in value
  );
}
