type DisconnectedPortError = Error & {
  message: 'Attempting to use a disconnected port object';
};

export const isDisconnectedPortError = (e: unknown): e is DisconnectedPortError =>
  e instanceof Error && e.message === 'Attempting to use a disconnected port object';

/**
 * Return disconnected port errors, rethrow any other error.
 *
 * @returns a disconnected port error
 * @throws any other error
 */
export const captureDisconnectedPortError = (e: unknown): DisconnectedPortError => {
  if (isDisconnectedPortError(e)) {
    if (globalThis.__DEV__) {
      console.debug('Suppressed disconnected port error', e);
    }
    return e;
  } else {
    throw e;
  }
};
