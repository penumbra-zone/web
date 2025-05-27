/**
 * RootStore - The central store that manages all domain stores
 *
 * This store follows the dependency injection pattern, allowing stores
 * to access each other through the root store reference. This makes
 * testing easier and prevents circular dependencies.
 */

import { makeAutoObservable } from 'mobx';
import { BalancesStore } from './balances-store';
import { TransactionsStore } from './transactions-store';
import { AssetsStore } from './assets-store';
import { AppParametersStore } from './app-parameters-store';
import { PenumbraService } from '../services/penumbra-service';

export class RootStore {
  // Service instances
  penumbraService: PenumbraService;

  // Domain stores
  balancesStore: BalancesStore;
  transactionsStore: TransactionsStore;
  assetsStore: AssetsStore;
  appParametersStore: AppParametersStore;

  constructor() {
    makeAutoObservable(this);

    // Initialize services
    this.penumbraService = new PenumbraService();

    // Initialize stores with root store reference
    this.balancesStore = new BalancesStore(this);
    this.transactionsStore = new TransactionsStore(this);
    this.assetsStore = new AssetsStore(this);
    this.appParametersStore = new AppParametersStore(this);
  }

  /**
   * Initialize all stores - called when the app starts
   */
  async initialize() {
    // Initialize app parameters first as other stores may depend on it
    await this.appParametersStore.initialize();

    // Initialize other stores in parallel
    await Promise.all([
      this.balancesStore.initialize(),
      this.transactionsStore.initialize(),
      this.assetsStore.initialize(),
    ]);
  }

  /**
   * Clean up all stores - called when the app unmounts
   */
  dispose() {
    this.balancesStore.dispose();
    this.transactionsStore.dispose();
    this.assetsStore.dispose();
    this.appParametersStore.dispose();
  }
}

// Create a singleton instance
export const rootStore = new RootStore();

// Export for easier access in components
export const { balancesStore, transactionsStore, assetsStore, appParametersStore } = rootStore;
