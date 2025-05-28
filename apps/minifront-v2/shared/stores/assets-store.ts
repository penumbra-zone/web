/**
 * AssetsStore - Manages asset metadata and related operations
 *
 * This store handles fetching, caching, and updating asset metadata.
 * It provides computed values for easy access to asset data in components.
 */

import { makeAutoObservable, runInAction } from 'mobx';
import { AssetsResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getDenomMetadata } from '@penumbra-zone/getters/assets-response';
import { RootStore } from './root-store';

export class AssetsStore {
  // Observable state
  assetsResponses: AssetsResponse[] = [];
  loading = false;
  error: Error | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  /**
   * Initialize the store and load initial data
   */
  async initialize() {
    await this.loadAssets();
  }

  /**
   * Clean up the store
   */
  dispose() {
    this.assetsResponses = [];
    this.loading = false;
    this.error = null;
  }

  /**
   * Load assets from the service
   */
  async loadAssets() {
    this.loading = true;
    this.error = null;

    try {
      const responses: AssetsResponse[] = [];
      const stream = this.rootStore.penumbraService.getAssetsStream();

      for await (const response of stream) {
        responses.push(response);
      }

      runInAction(() => {
        this.assetsResponses = responses;
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
   * Get all asset metadata
   */
  get allAssets(): Metadata[] {
    return this.assetsResponses
      .map(response => getDenomMetadata(response))
      .filter((metadata): metadata is Metadata => Boolean(metadata));
  }

  /**
   * Get asset metadata by asset ID
   */
  getAssetById(assetId: string): Metadata | undefined {
    return this.allAssets.find(asset => asset.penumbraAssetId?.inner.toString() === assetId);
  }

  /**
   * Get asset metadata by display denomination
   */
  getAssetByDenom(denom: string): Metadata | undefined {
    return this.allAssets.find(asset => asset.display === denom || asset.symbol === denom);
  }

  /**
   * Get assets sorted by symbol
   */
  get sortedAssets(): Metadata[] {
    return [...this.allAssets].sort((a, b) =>
      (a.symbol || a.display || '').localeCompare(b.symbol || b.display || ''),
    );
  }

  /**
   * Check if assets are loaded
   */
  get hasAssets(): boolean {
    return this.allAssets.length > 0;
  }

  /**
   * Get the native token metadata (penumbra)
   */
  get nativeToken(): Metadata | undefined {
    // This would need to be implemented based on how native token is identified
    return this.allAssets.find(asset => asset.symbol === 'UM' || asset.display === 'penumbra');
  }
}
