/**
 * Collect timeout and user-provided headers to a JSON-serializable object.
 */
export const normalizeHeader = (timeoutMs?: number, userProvidedHeaders?: HeadersInit) => {
  const headers = new Headers(userProvidedHeaders ?? {});

  if (timeoutMs) {
    headers.set('headerTimeout', `${timeoutMs}`);
  }

  const entries = Array.from(headers);

  return entries.length ? Object.fromEntries(entries) : undefined;
};
