const disconnectedPortErrorMessage = 'Attempting to use a disconnected port object';

export const isDisconnectedPortError = (
  reason: unknown,
): reason is Error & { message: typeof disconnectedPortErrorMessage } =>
  reason instanceof Error && reason.message === disconnectedPortErrorMessage;
