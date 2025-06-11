/**
 * AppParametersStore - Manages application parameters and chain information
 *
 * This store handles fetching and caching chain parameters, gas prices,
 * and other global application state.
 */

import { makeAutoObservable, runInAction } from 'mobx';
import {
  AppParametersResponse,
  GasPricesResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { RootStore } from './root-store';
import { penumbra } from '../lib/penumbra';
import { PenumbraState } from '@penumbra-zone/client';

export class AppParametersStore {
  // Observable state
  appParameters: AppParametersResponse | null = null;
  gasPrices: GasPricesResponse | null = null;
  loading = false;
  error: Error | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    // Listen for connection state changes to retry loading
    penumbra.onConnectionStateChange(event => {
      if (event.state === PenumbraState.Connected) {
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

    await Promise.all([this.loadAppParameters(), this.loadGasPrices()]);
  }

  /**
   * Clean up the store
   */
  dispose() {
    this.appParameters = null;
    this.gasPrices = null;
    this.loading = false;
    this.error = null;
  }

  /**
   * Load app parameters from the service
   */
  async loadAppParameters() {
    if (!penumbra.connected) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const response = await this.rootStore.penumbraService.getAppParameters();

      runInAction(() => {
        this.appParameters = response;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error as Error;
        this.loading = false;
      });
    }
  }

  /**
   * Load gas prices from the service
   */
  async loadGasPrices() {
    if (!penumbra.connected) {
      return;
    }

    try {
      const response = await this.rootStore.penumbraService.getGasPrices();

      runInAction(() => {
        this.gasPrices = response;
      });
    } catch (error) {
      console.warn('Failed to load gas prices:', error);
      // Don't set error state for gas prices as it's not critical
    }
  }

  /**
   * Get chain ID
   */
  get chainId(): string {
    return this.appParameters?.parameters?.chainId ?? '';
  }

  /**
   * Get staking token metadata
   */
  get stakingToken() {
    return this.appParameters?.parameters?.stakeParams;
  }

  /**
   * Check if app parameters are loaded
   */
  get isLoaded(): boolean {
    return this.appParameters !== null;
  }

  /**
   * Get current gas prices as a map
   */
  get gasPricesMap(): Map<string, bigint> {
    const map = new Map<string, bigint>();

    if (this.gasPrices) {
      // Add gas prices from both gasPrices and altGasPrices
      const allGasPrices = [
        ...(this.gasPrices.gasPrices ? [this.gasPrices.gasPrices] : []),
        ...(this.gasPrices.altGasPrices ?? []),
      ];

      for (const gasPrice of allGasPrices) {
        if (gasPrice.assetId && gasPrice.blockSpacePrice) {
          const assetId = Array.from(gasPrice.assetId.inner).toString();
          map.set(assetId, gasPrice.blockSpacePrice);
        }
      }
    }

    return map;
  }

  /**
   * Get gas price for a specific asset
   */
  getGasPriceForAsset(assetId: string): bigint | undefined {
    return this.gasPricesMap.get(assetId);
  }

  /**
   * Refresh all parameters
   */
  async refresh() {
    await this.initialize();
  }
}
