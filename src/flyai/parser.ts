import { FlyaiError } from '../errors/errors.js';

export function parseFlyaiOutput(stdout: string): Record<string, unknown> {
  let result: unknown;
  try {
    result = JSON.parse(stdout.trim());
  } catch {
    throw new FlyaiError('INVALID_OUTPUT', 'FlyAI returned invalid JSON');
  }
  if (typeof result !== 'object' || result === null || Array.isArray(result)) {
    throw new FlyaiError('INVALID_OUTPUT', 'FlyAI returned a non-object JSON value');
  }
  const record = result as Record<string, unknown>;
  if (record.status !== 0) {
    throw new FlyaiError('UPSTREAM_ERROR', 'FlyAI reported a search error');
  }
  return record;
}
