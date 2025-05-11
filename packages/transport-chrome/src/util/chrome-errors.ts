const contextLossErrorMessage = 'Extension context invalidated.';
const disconnectedPortErrorMessage = 'Attempting to use a disconnected port object';

export const isContextLossError = (
  reason: unknown,
): reason is Error & { message: typeof contextLossErrorMessage } =>
  reason instanceof Error && reason.message === contextLossErrorMessage;

export const isDisconnectedPortError = (
  reason: unknown,
): reason is Error & { message: typeof disconnectedPortErrorMessage } =>
  reason instanceof Error && reason.message === disconnectedPortErrorMessage;
