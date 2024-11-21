import { PenumbraClient, PenumbraProvider } from '@penumbra-zone/client';
import { PenumbraClientOptions } from '@penumbra-zone/client/client';

export interface PenumbraContextInput {
  client?: PenumbraClient | PenumbraClientOptions;
  provider?: PenumbraProvider | string;
}

export const resolvePenumbraContextInput = (input: PenumbraContextInput): PenumbraClient => {
  let client = input.client instanceof PenumbraClient ? input.client : undefined;
  const options = input.client instanceof PenumbraClient ? undefined : input.client;

  const providerOrigin =
    typeof input.provider === 'string'
      ? input.provider
      : input.provider && new URL(input.provider.manifest).origin;

  client ??= new PenumbraClient(providerOrigin, options);

  if (providerOrigin) {
    void client.attach(providerOrigin);
  }

  return client;
};
