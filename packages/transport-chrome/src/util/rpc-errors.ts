import { ConnectError, Code } from '@connectrpc/connect';

export const isCanceledError = (
  reason: unknown,
): reason is ConnectError & { code: typeof Code.Canceled } =>
  reason instanceof ConnectError && reason.code === Code.Canceled;

export const isUnavailableError = (
  reason: unknown,
): reason is ConnectError & { code: typeof Code.Unavailable } =>
  reason instanceof ConnectError && reason.code === Code.Unavailable;
