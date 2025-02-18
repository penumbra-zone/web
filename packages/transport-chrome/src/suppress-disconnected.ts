export const rethrowOrSuppressDisconnectedPortError = (e: unknown) => {
  if (!(e instanceof Error && e.message === 'Attempting to use a disconnected port object')) {
    throw e;
  } else if (globalThis.__DEV__) {
    console.debug('Suppressed disconnected port error', e);
  }
};
