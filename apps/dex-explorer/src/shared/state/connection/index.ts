import { PenumbraRequestFailure, PenumbraState, PenumbraManifest } from '@penumbra-zone/client';
import { penumbra, PRAX_ORIGIN } from '@/shared/penumbra';
import { makeAutoObservable } from 'mobx';

class ConnectionStateStore {
  connected = false;
  manifest: PenumbraManifest | undefined;

  constructor() {
    makeAutoObservable(this);

    if (typeof window !== 'undefined') {
      this.setup();
    }
  }

  private setManifest(manifest: PenumbraManifest | undefined) {
    this.manifest = manifest;
  }

  private setConnected(connected: boolean) {
    this.connected = connected;
  }

  async reconnect() {
    await penumbra.attach(PRAX_ORIGIN);
    if (!penumbra.connected) {
      return;
    }

    try {
      await penumbra.connect();
      this.setConnected(true);
    } catch (error) {
      /* no-op */
    }
  }

  async connect() {
    try {
      await penumbra.connect();
    } catch (error) {
      if (error instanceof Error && error.cause) {
        if (error.cause === PenumbraRequestFailure.Denied) {
          // TODO: replace these alerts with toasts
          alert(
            'Connection denied: you may need to un-ignore this site in your extension settings.',
          );
        }
        if (error.cause === PenumbraRequestFailure.NeedsLogin) {
          alert('Not logged in: please login into the extension and try again');
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
