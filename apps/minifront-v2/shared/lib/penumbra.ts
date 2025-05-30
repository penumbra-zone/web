import { createPenumbraClient, PenumbraClient } from '@penumbra-zone/client';

export const penumbra = createPenumbraClient();

const reconnect = async () => {
  const providers = PenumbraClient.getProviders();
  const connected = Object.keys(providers).find(origin =>
    PenumbraClient.isProviderConnected(origin),
  );
  if (!connected) {
    return;
  }
  try {
    await penumbra.connect(connected);
  } catch (error) {
    /* no-op */
  }
};
void reconnect();
