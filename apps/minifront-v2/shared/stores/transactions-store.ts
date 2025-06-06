/**
 * TransactionsStore - Manages transaction data and related operations
 *
 * This store handles fetching, caching, and updating transaction information.
 * It provides computed values for easy access to transaction data in components.
 */

import { makeAutoObservable, runInAction } from 'mobx';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { RootStore } from './root-store';

export class TransactionsStore {
  // Observable state
  transactions: TransactionInfo[] = [];
  loading = false;
  error: Error | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  /**
   * Initialize the store and load initial data
   */
  async initialize() {
    await this.loadTransactions();
  }

  /**
   * Clean up the store
   */
  dispose() {
    this.transactions = [];
    this.loading = false;
    this.error = null;
  }

  /**
   * Load transactions from the service using the same pattern as transactions-v2.ts
   */
  async loadTransactions() {
    this.loading = true;
    this.error = null;

    try {
      const txInfos: TransactionInfo[] = [];
      const txInfoStream = this.rootStore.penumbraService.getTransactionInfoStream({});

      for await (const txInfoResponse of txInfoStream) {
        if (txInfoResponse.txInfo) {
          txInfos.push(txInfoResponse.txInfo);
        }
      }

      // Sort by height (newest first)
      txInfos.sort((a, b) => Number(b.height) - Number(a.height));

      runInAction(() => {
        this.transactions = txInfos;
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
   * Get transaction by hash
   */
  getTransactionByHash(hash: string): TransactionInfo | undefined {
    return this.transactions.find(tx => {
      const txHash = tx.id?.inner ? uint8ArrayToHex(tx.id.inner) : '';
      return txHash === hash;
    });
  }

  /**
   * Get transactions sorted by height (newest first)
   */
  get sortedTransactions(): TransactionInfo[] {
    return [...this.transactions].sort((a, b) => Number(b.height - a.height));
  }

  /**
   * Get recent transactions (last 10)
   */
  get recentTransactions(): TransactionInfo[] {
    return this.sortedTransactions.slice(0, 10);
  }

  /**
   * Check if there are any transactions
   */
  get hasTransactions(): boolean {
    return this.transactions.length > 0;
  }
}
