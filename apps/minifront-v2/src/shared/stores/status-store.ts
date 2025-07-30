/**
 * StatusStore - Manages blockchain sync status and block height information
 *
 * This store tracks the sync status of the blockchain, including current sync height,
 * latest known block height, and handles error states during sync operations.
 */

import { makeAutoObservable, runInAction } from 'mobx';
import {
  StatusResponse,
  StatusStreamResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { RootStore } from './root-store';
import { penumbra } from '../lib/penumbra';
import { PenumbraState } from '@penumbra-zone/client';

export interface SyncStatus {
  syncHeight: bigint;
  latestKnownBlockHeight: bigint;
}

export class StatusStore {
  // Observable state
  initialStatus: StatusResponse | null = null;
  statusStream: StatusStreamResponse | null = null;
  loading = false;
  error: Error | null = null;
  streamError: Error | null = null;
  streamRunning = false;

  // Reconnection timeout
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private readonly RECONNECT_TIMEOUT = 5000; // 5 seconds

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    // Listen for connection state changes to retry loading
    penumbra.onConnectionStateChange(event => {
      if (event.state === PenumbraState.Connected) {
        // Clear errors and reload fresh data when reconnecting
        runInAction(() => {
          this.error = null;
          this.streamError = null;
          this.initialStatus = null;
          this.statusStream = null;
        });
        void this.initialize();
      }
    });
  }

  /**
   * Initialize the store and load initial data
   */
  async initialize() {
    if (!penumbra.connected) {
      // Connection not ready yet, will retry when connection is established
      return;
    }

    await this.loadInitialStatus();
    void this.startStatusStream();
  }

  /**
   * Clean up the store
   */
  dispose() {
    this.initialStatus = null;
    this.statusStream = null;
    this.loading = false;
    this.error = null;
    this.streamError = null;
    this.streamRunning = false;
    this.clearReconnectTimer();
  }

  /**
   * Load initial status from the service
   */
  async loadInitialStatus() {
    if (!penumbra.connected) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const response = await this.rootStore.penumbraService.getStatus();

      runInAction(() => {
        this.initialStatus = response;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error as Error;
        this.loading = false;
        // Clear initial status when there's an error to prevent showing stale data
        this.initialStatus = null;
      });
    }
  }

  /**
   * Start the status stream
   */
  async startStatusStream() {
    if (!penumbra.connected || this.streamRunning) {
      return;
    }

    runInAction(() => {
      this.streamRunning = true;
      this.streamError = null;
    });

    try {
      const stream = this.rootStore.penumbraService.getStatusStream();

      for await (const response of stream) {
        runInAction(() => {
          this.statusStream = response;
          this.streamError = null;
        });
      }
    } catch (error) {
      runInAction(() => {
        this.streamError = error as Error;
        this.streamRunning = false;
        // Clear stream data when there's an error to prevent showing stale data
        this.statusStream = null;
      });

      console.warn('Status stream error:', error);
      this.scheduleReconnect();
    }

    runInAction(() => {
      this.streamRunning = false;
    });

    // If we reach here without an error, schedule a reconnect
    if (!this.streamError) {
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule a reconnect attempt
   */
  private scheduleReconnect() {
    this.clearReconnectTimer();

    this.reconnectTimer = setTimeout(() => {
      if (!this.streamRunning) {
        void this.startStatusStream();
      }
    }, this.RECONNECT_TIMEOUT);
  }

  /**
   * Clear the reconnect timer
   */
  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  /**
   * Get the current sync status combining initial and stream data
   */
  get syncStatus(): SyncStatus | null {
    const initial = this.initialStatus;
    const stream = this.statusStream;

    // If we have a connection error, don't return stale data
    if (this.hasConnectionError) {
      return null;
    }

    if (!initial && !stream) {
      return null;
    }

    // Combine data from both sources, preferring stream data
    const syncHeight = stream?.fullSyncHeight ?? initial?.fullSyncHeight ?? 0n;
    const latestKnownBlockHeight =
      stream?.latestKnownBlockHeight ?? initial?.latestKnownBlockHeight ?? 0n;

    return {
      syncHeight,
      latestKnownBlockHeight,
    };
  }

  /**
   * Check if the blockchain is fully synced
   */
  get isSynced(): boolean {
    // If we have connection errors, we can't be considered synced
    if (this.hasConnectionError) {
      return false;
    }

    const status = this.syncStatus;
    if (!status) {
      return false;
    }

    return status.latestKnownBlockHeight > 0n && status.syncHeight >= status.latestKnownBlockHeight;
  }

  /**
   * Get sync progress as a percentage (0-100)
   */
  get syncProgress(): number {
    const status = this.syncStatus;
    if (!status || status.latestKnownBlockHeight === 0n) {
      return 0;
    }

    return Math.min(100, (Number(status.syncHeight) / Number(status.latestKnownBlockHeight)) * 100);
  }

  /**
   * Check if there's a connection error
   */
  get hasConnectionError(): boolean {
    return this.error !== null || this.streamError !== null;
  }

  /**
   * Get the current error (initial or stream)
   */
  get currentError(): Error | null {
    return this.streamError ?? this.error;
  }

  /**
   * Refresh status data
   */
  async refresh() {
    await this.loadInitialStatus();
    if (!this.streamRunning) {
      void this.startStatusStream();
    }
  }

  /**
   * Manually restart the status stream
   */
  async restartStream() {
    this.clearReconnectTimer();
    runInAction(() => {
      this.streamRunning = false;
      this.streamError = null;
      // Clear stale data before restarting
      this.statusStream = null;
      this.initialStatus = null;
    });
    await this.loadInitialStatus();
    await this.startStatusStream();
  }
}
