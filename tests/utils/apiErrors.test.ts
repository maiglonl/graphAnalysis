import { describe, expect, it } from 'vitest';
import { resolveApiErrorMessage } from '~/utils/apiErrors';

const t = (key: string) => `translated:${key}`;

describe('resolveApiErrorMessage', () => {
  it('translates api error keys from data message', () => {
    expect(resolveApiErrorMessage({ data: { message: 'errors.invalidSymbol' } }, t)).toBe('translated:errors.invalidSymbol');
  });

  it('translates api error keys from message', () => {
    expect(resolveApiErrorMessage({ message: 'errors.providerUnavailable' }, t)).toBe('translated:errors.providerUnavailable');
  });

  it('falls back to default error for unknown messages', () => {
    expect(resolveApiErrorMessage({ message: 'Network Error' }, t)).toBe('translated:errors.analyzeDefault');
  });

  it('falls back to default error for non object values', () => {
    expect(resolveApiErrorMessage(null, t)).toBe('translated:errors.analyzeDefault');
  });
});
