/**
 * Suppress errors thrown by a disconnected port, when you don't care.
 *
 * @param err something you caught
 * @throws input `err` other than 'Attempting to use a disconnected port object'
 */
export const suppressDisconnectError = (err: unknown) => {
  if (err instanceof Error && err.message === 'Attempting to use a disconnected port object') {
    if (globalThis.__DEV__) {
      console.debug('Suppressed', err);
    }
    return;
  }
  throw err;
};
