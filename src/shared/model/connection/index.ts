import {
  PenumbraRequestFailure,
  PenumbraState,
  PenumbraManifest,
  PenumbraClient,
} from '@penumbra-zone/client';
import { makeAutoObservable } from 'mobx';
import { openToast } from '@penumbra-zone/ui/Toast';
import { penumbra } from '@/shared/const/penumbra';
import { ViewService } from '@penumbra-zone/protobuf';
import { envQueryFn } from '@/shared/api/env/env';

class ConnectionStateStore {
  connected = false;
  manifest: PenumbraManifest | undefined;

  /** Index of the selected subaccount */
  subaccount = 0;

  constructor() {
    makeAutoObservable(this);
  }

  private setManifest(manifest: PenumbraManifest | undefined) {
    this.manifest = manifest;
  }

  private setConnected(connected: boolean) {
    this.connected = connected;
  }

  setSubaccount = (subaccount: string) => {
    this.subaccount = parseInt(subaccount, 10);
  };

  async reconnect() {
    const providers = PenumbraClient.getProviders();
    const connected = Object.keys(providers).find(origin =>
      PenumbraClient.isProviderConnected(origin),
    );

    if (!connected) {
      return;
    }

    try {
      await penumbra.connect(connected);
      this.setConnected(true);
      await this.checkWrongChain();
    } catch (error) {
      /* no-op */
    }
  }

  async connect(provider: string) {
    try {
      await penumbra.connect(provider);
      await this.checkWrongChain();
    } catch (error) {
      if (error instanceof Error && error.cause) {
        if (error.cause === PenumbraRequestFailure.Denied) {
          openToast({
            type: 'error',
            message: 'Connection denied',
            description: 'You may need to un-ignore this site in your extension settings.',
          });
        }
        if (error.cause === PenumbraRequestFailure.NeedsLogin) {
          openToast({
            type: 'error',
            message: 'Not logged in',
            description: 'Please login into the extension and try again.',
          });
        }
      }
    }
  }

  async disconnect() {
    if (!penumbra.connected) {
      return;
    }

    try {
      await penumbra.disconnect();
    } catch (error) {
      console.error(error);
    } finally {
      window.location.reload();
    }
  }

  // Checks if the connected wallet's chainId is the same as DEX's chainId. Disconnects if not.
  async checkWrongChain() {
    const [parameters, env] = await Promise.all([
      penumbra.service(ViewService).appParameters({}),
      await envQueryFn(),
    ]);

    const walletChainId = parameters.parameters?.chainId;
    const dexChainId = env.PENUMBRA_CHAIN_ID;

    if (!walletChainId || walletChainId !== dexChainId) {
      alert(
        `Connection denied. Your wallet is connected to the wrong chain "${walletChainId}". Please connect to "${dexChainId}".`,
      );
      void this.disconnect();
    }
  }

  setup() {
    this.setManifest(penumbra.manifest);

    // If Prax is connected on page load, reconnect to ensure the connection is still active
    void this.reconnect();

    penumbra.onConnectionStateChange(event => {
      this.setManifest(penumbra.manifest);
      this.setConnected(event.state === PenumbraState.Connected);
    });
  }
}

export const connectionStore = new ConnectionStateStore();
