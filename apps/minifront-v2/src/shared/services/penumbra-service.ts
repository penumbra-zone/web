/**
 * PenumbraService - Centralized service for all Penumbra blockchain interactions
 *
 * This service provides a clean interface to interact with the Penumbra blockchain
 * through the Penumbra client. It encapsulates all the service access logic,
 * making it easy to use throughout the application.
 */

import { ViewService, SctService, StakeService } from '@penumbra-zone/protobuf';
import {
  BalancesRequest,
  TransactionInfoRequest,
  AssetsRequest,
  AppParametersRequest,
  GasPricesRequest,
  TransactionInfoByHashRequest,
  DelegationsByAddressIndexRequest,
  DelegationsByAddressIndexRequest_Filter,
  TransactionPlannerRequest,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { TimestampByHeightRequest } from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { penumbra } from '../lib/penumbra';

import { ValidatorInfoRequest } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';

// Error detection functions (from legacy minifront)
const userDeniedTransaction = (e: unknown): boolean =>
  e instanceof Error && e.message.startsWith('[permission_denied]');

const unauthenticated = (e: unknown): boolean =>
  e instanceof Error && e.message.includes('unauthenticated');

export class PenumbraService {
  /**
   * Get a stream of balance responses
   * @param params - Optional parameters to filter balances
   * @returns Async iterable of balance responses
   */
  getBalancesStream(params?: Partial<BalancesRequest>) {
    const request = new BalancesRequest(params ?? {});
    return penumbra.service(ViewService).balances(request);
  }

  /**
   * Get a stream of transaction info
   * @param params - Optional parameters to filter transactions
   * @returns Async iterable of transaction info responses
   */
  getTransactionInfoStream(params?: Partial<TransactionInfoRequest>) {
    const request = new TransactionInfoRequest(params ?? {});
    return penumbra.service(ViewService).transactionInfo(request);
  }

  /**
   * Get transaction info by hash
   * @param hash - Transaction hash as hex string
   * @returns Promise of transaction info response
   */
  async getTransactionInfoByHash(hash: string) {
    // Convert hex string to Uint8Array
    const hashBytes = new Uint8Array(hash.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) ?? []);

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
    const request = new AssetsRequest(params ?? {});
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
   * Get delegations by address index
   * @param account - Account number to get delegations for
   * @param filter - Filter for delegation types (default: ALL to show all validators)
   * @returns Async iterable of delegation responses
   */
  getDelegationsByAddressIndex(
    account: number,
    filter: DelegationsByAddressIndexRequest_Filter = DelegationsByAddressIndexRequest_Filter.ALL,
  ) {
    const request = new DelegationsByAddressIndexRequest({
      addressIndex: new AddressIndex({ account }),
      filter,
    });
    return penumbra.service(ViewService).delegationsByAddressIndex(request);
  }

  /**
   * Get validator info stream
   * @param showInactive - Whether to include inactive validators
   * @returns Async iterable of validator info responses
   */
  getValidatorInfoStream(showInactive: boolean = true) {
    const request = new ValidatorInfoRequest({ showInactive });
    return penumbra.service(StakeService).validatorInfo(request);
  }

  /**
   * Plan, build, and broadcast a transaction
   * @param request - Transaction planner request
   * @returns Promise that resolves when transaction is broadcast, or undefined if user cancelled
   */
  async planBuildBroadcast(request: TransactionPlannerRequest): Promise<any> {
    try {
      // Plan the transaction
      const planResponse = await penumbra.service(ViewService).transactionPlanner(request);
      if (!planResponse.plan) {
        throw new Error('Failed to create transaction plan');
      }

      // Build the transaction with user authorization, handling the stream properly
      const buildStream = penumbra.service(ViewService).authorizeAndBuild({
        transactionPlan: planResponse.plan,
      });

      let transaction;
      for await (const { status } of buildStream) {
        if (status.case === 'complete' && status.value.transaction) {
          transaction = status.value.transaction;
          break;
        }
        // Handle other status cases if needed (e.g., progress, error)
      }

      if (!transaction) {
        throw new Error('Failed to build transaction');
      }

      // Broadcast the transaction, handling the stream properly
      const broadcastStream = penumbra.service(ViewService).broadcastTransaction({
        transaction,
        awaitDetection: true,
      });

      for await (const { status } of broadcastStream) {
        if (status.case === 'confirmed') {
          break;
        }
        // Handle other status cases if needed
      }

      return { success: true };
    } catch (e) {
      if (userDeniedTransaction(e)) {
        // User cancelled - return undefined instead of throwing
        console.log('User cancelled transaction');
        return undefined;
      } else if (unauthenticated(e)) {
        throw new Error('Authentication required. Please check your wallet connection.');
      } else {
        // Re-throw actual errors
        throw e;
      }
    }
  }

  /**
   * Get the underlying view service client for advanced usage
   * @returns The view service client
   */
  getViewClient() {
    return penumbra.service(ViewService);
  }

  /**
   * Get the underlying stake service client for advanced usage
   * @returns The stake service client
   */
  getStakeClient() {
    return penumbra.service(StakeService);
  }

  /**
   * Get the timestamp for a specific block height
   * @param height - The block height to get timestamp for
   * @returns Promise of Date object or undefined
   */
  async getBlockTimestamp(height: bigint): Promise<Date | undefined> {
    const request = new TimestampByHeightRequest({ height });
    const { timestamp } = await penumbra.service(SctService).timestampByHeight(request);
    return timestamp?.toDate();
  }
}

// Export a singleton instance for convenience
export const penumbraService = new PenumbraService();
