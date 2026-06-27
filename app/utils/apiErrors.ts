export function resolveApiErrorMessage(error: unknown, t: (key: string) => string): string {
  const messageKey = getErrorMessageKey(error);

  return messageKey?.startsWith('errors.')
    ? t(messageKey)
    : t('errors.analyzeDefault');
}

function getErrorMessageKey(error: unknown): string | null {
  if (!isRecord(error)) return null;

  const data = error.data;
  const message = error.message;

  if (isRecord(data) && typeof data.message === 'string') {
    return data.message;
  }

  return typeof message === 'string' ? message : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
