import { ConnectError, Code } from '@connectrpc/connect';

export const isTransportCancelledError = (
  reason: unknown,
): reason is ConnectError & { code: typeof Code.Canceled } =>
  reason instanceof ConnectError && reason.code === Code.Canceled;
