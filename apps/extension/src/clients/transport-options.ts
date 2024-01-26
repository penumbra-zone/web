import { CommonTransportOptions } from '@connectrpc/connect/protocol';
import { typeRegistry } from '@penumbra-zone/types/src/registry';

export const transportOptions: Partial<CommonTransportOptions> = {
  defaultTimeoutMs: 10000,
  jsonOptions: { typeRegistry },
};
