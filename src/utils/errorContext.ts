import type { ErrorContext } from '../types/errors';

export function createErrorContext(
  component: string,
  action: string,
  additionalData?: Record<string, unknown>
): ErrorContext {
  return {
    component,
    action,
    timestamp: new Date().toISOString(),
    ...(additionalData ? { additionalData } : {}),
  };
}
