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
import { TransferStore } from './transfer-store';
import { DepositStore } from './deposit-store';
import { WithdrawStore } from './withdraw-store';
import { StakingStore } from './staking-store';
import { StatusStore } from './status-store';
import { PenumbraService } from '../services/penumbra-service';

export class RootStore {
  // Service instances
  penumbraService: PenumbraService;

  // Domain stores
  balancesStore: BalancesStore;
  transactionsStore: TransactionsStore;
  assetsStore: AssetsStore;
  appParametersStore: AppParametersStore;
  transferStore: TransferStore;
  depositStore: DepositStore;
  withdrawStore: WithdrawStore;
  stakingStore: StakingStore;
  statusStore: StatusStore;

  constructor() {
    makeAutoObservable(this);

    // Initialize services
    this.penumbraService = new PenumbraService();

    // Initialize stores with root store reference
    this.balancesStore = new BalancesStore(this);
    this.transactionsStore = new TransactionsStore(this);
    this.assetsStore = new AssetsStore(this);
    this.appParametersStore = new AppParametersStore(this);
    this.transferStore = new TransferStore(this);
    this.depositStore = new DepositStore(this);
    this.withdrawStore = new WithdrawStore(this);
    this.stakingStore = new StakingStore(this);
    this.statusStore = new StatusStore(this);
  }

  /**
   * Initialize all stores
   */
  async initialize() {
    try {
      // Initialize stores that need async setup
      await Promise.all([
        this.balancesStore.initialize(),
        this.assetsStore.initialize(),
        this.appParametersStore.initialize(),
        this.transferStore.initialize(),
        this.depositStore.initialize(),
        this.withdrawStore.initialize(),
        this.stakingStore.initialize(),
        this.statusStore.initialize(),
      ]);
    } catch (error) {
      console.error('Failed to initialize stores:', error);
    }
  }

  /**
   * Dispose all stores and cleanup resources
   */
  dispose() {
    this.balancesStore.dispose();
    this.transactionsStore.dispose();
    this.assetsStore.dispose();
    this.appParametersStore.dispose();
    this.transferStore.dispose();
    this.depositStore.dispose();
    this.withdrawStore.dispose();
    this.stakingStore.dispose();
    this.statusStore.dispose();
  }
}

// Create and export a singleton instance
export const rootStore = new RootStore();

// Export for easier access in components
export const {
  balancesStore,
  transactionsStore,
  assetsStore,
  appParametersStore,
  transferStore,
  depositStore,
  withdrawStore,
  stakingStore,
} = rootStore;
