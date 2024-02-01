import { CommonTransportOptions } from '@connectrpc/connect/protocol';
import { jsonOptions } from '@penumbra-zone/types/src/json-options';

export const transportOptions = {
  defaultTimeoutMs: 10000,
  jsonOptions,
} satisfies Partial<CommonTransportOptions>;
