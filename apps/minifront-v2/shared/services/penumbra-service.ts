/**
 * PenumbraService - Centralized service for all Penumbra blockchain interactions
 *
 * This service provides a clean interface to interact with the Penumbra blockchain
 * through the Penumbra client. It encapsulates all the service access logic,
 * making it easy to use throughout the application.
 */

import { ViewService } from '@penumbra-zone/protobuf';
import {
  BalancesRequest,
  TransactionInfoRequest,
  AssetsRequest,
  AppParametersRequest,
  GasPricesRequest,
  TransactionInfoByHashRequest,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { penumbra } from '../lib/penumbra';

export class PenumbraService {
  constructor() {
    // Service is initialized with the global penumbra client
  }

  /**
   * Get a stream of balance responses
   * @param params - Optional parameters to filter balances
   * @returns Async iterable of balance responses
   */
  getBalancesStream(params?: Partial<BalancesRequest>) {
    const request = new BalancesRequest(params || {});
    return penumbra.service(ViewService).balances(request);
  }

  /**
   * Get a stream of transaction info
   * @param params - Optional parameters to filter transactions
   * @returns Async iterable of transaction info responses
   */
  getTransactionInfoStream(params?: Partial<TransactionInfoRequest>) {
    const request = new TransactionInfoRequest(params || {});
    return penumbra.service(ViewService).transactionInfo(request);
  }

  /**
   * Get transaction info by hash
   * @param hash - Transaction hash as hex string
   * @returns Promise of transaction info response
   */
  async getTransactionInfoByHash(hash: string) {
    // Convert hex string to Uint8Array
    const hashBytes = new Uint8Array(hash.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);

    const request = new TransactionInfoByHashRequest({
      id: { inner: hashBytes },
    });

    return penumbra.service(ViewService).transactionInfoByHash(request);
  }

  /**
   * Get all assets
   * @param params - Optional parameters to filter assets
   * @returns Async iterable of assets responses
   */
  getAssetsStream(params?: Partial<AssetsRequest>) {
    const request = new AssetsRequest(params || {});
    return penumbra.service(ViewService).assets(request);
  }

  /**
   * Get app parameters including chain ID and staking token metadata
   * @returns Promise of app parameters response
   */
  async getAppParameters() {
    const request = new AppParametersRequest({});
    return penumbra.service(ViewService).appParameters(request);
  }

  /**
   * Get current gas prices
   * @returns Promise of gas prices response
   */
  async getGasPrices() {
    const request = new GasPricesRequest({});
    return penumbra.service(ViewService).gasPrices(request);
  }

  /**
   * Get the underlying view service client for advanced usage
   * @returns The view service client
   */
  getViewClient() {
    return penumbra.service(ViewService);
  }
}

// Export a singleton instance for convenience
export const penumbraService = new PenumbraService();
