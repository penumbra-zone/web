type DisconnectedPortError = Error & { message: 'Attempting to use a disconnected port object' };

export const isDisconnectedPortError = (e: unknown): e is DisconnectedPortError =>
  typeof e === 'object' &&
  e !== null &&
  'message' in e &&
  e.message === 'Attempting to use a disconnected port object';
