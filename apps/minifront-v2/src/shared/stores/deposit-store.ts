import { makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from './root-store';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ChainRegistryClient, Chain } from '@penumbra-labs/registry';
import { chains } from 'chain-registry';

// External wallet asset balance interface
export interface ExternalAssetBalance {
  denom: string;
  amount: string;
  displayDenom: string;
  displayAmount: string;
  metadata?: Metadata;
  icon?: string;
}

// Chain information interface
export interface ChainInfo {
  chainId: string;
  chainName: string;
  displayName: string;
  icon?: string;
  isConnected?: boolean;
}

// Deposit form state
export interface DepositState {
  selectedChain?: ChainInfo;
  selectedAsset?: ExternalAssetBalance;
  amount: string;
  destinationAccount: number;
  destinationAddress: string;
  isLoading: boolean;
  error?: string;
}

// External wallet state
export interface ExternalWalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address?: string;
  chainId?: string;
  error?: string;
}

export class DepositStore {
  private rootStore: RootStore;

  // Deposit form state
  depositState: DepositState = {
    destinationAccount: 0,
    destinationAddress: '',
    amount: '',
    isLoading: false,
  };

  // External wallet state
  walletState: ExternalWalletState = {
    isConnected: false,
    isConnecting: false,
  };

  // Available chains
  availableChains: ChainInfo[] = [];

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // Chain selection actions
  setSelectedChain(chain?: ChainInfo) {
    this.depositState.selectedChain = chain;
    this.depositState.selectedAsset = undefined; // Reset asset when chain changes
    this.depositState.amount = '';
  }

  // Asset selection actions
  setSelectedAsset(asset?: ExternalAssetBalance) {
    this.depositState.selectedAsset = asset;
    this.depositState.amount = ''; // Reset amount when asset changes
  }

  // Amount input actions
  setAmount(amount: string) {
    // Prevent negative amounts
    if (Number(amount) < 0) {
      return;
    }
    this.depositState.amount = amount;
  }

  // Set max amount for external assets
  setMaxAmount() {
    const { selectedAsset } = this.depositState;
    if (selectedAsset) {
      this.setAmount(selectedAsset.displayAmount);
    }
  }

  // Destination account actions
  setDestinationAccount(account: number) {
    this.depositState.destinationAccount = account;
    this.loadDestinationAddress();
  }

  // Wallet connection actions - now uses cosmos-kit via component hooks
  async connectWallet() {
    runInAction(() => {
      this.walletState.isConnecting = true;
      this.walletState.error = undefined;
    });

    // Note: The actual connection logic will be handled by cosmos-kit hooks
    // in the component. This method is called from the UI to trigger the modal.
    // The component using useChain will handle the actual connection.
  }

  // Called by the component after successful cosmos-kit connection
  onWalletConnected(address: string, chainId: string) {
    runInAction(() => {
      this.walletState.isConnected = true;
      this.walletState.address = address;
      this.walletState.chainId = chainId;
      this.walletState.isConnecting = false;
      this.walletState.error = undefined;
    });

    // Assets are now loaded by the unified assets hook
  }

  // Called by the component when cosmos-kit connection fails
  onWalletConnectionError(error: string) {
    runInAction(() => {
      this.walletState.error = error;
      this.walletState.isConnecting = false;
      this.walletState.isConnected = false;
    });
  }

  async disconnectWallet() {
    runInAction(() => {
      this.walletState.isConnected = false;
      this.walletState.address = undefined;
      this.walletState.chainId = undefined;
      this.walletState.error = undefined;
    });
  }

  // Computed validation
  get validation() {
    const { selectedChain, selectedAsset, amount } = this.depositState;

    return {
      chainError: !selectedChain,
      assetError: !selectedAsset,
      amountError: this.isAmountInvalid(),
      connectionError: !this.walletState.isConnected,
      balanceError: this.isAmountMoreThanBalance(),
      decimalError: this.hasIncorrectDecimal(),
    };
  }

  get canDeposit() {
    const { selectedChain, selectedAsset, amount } = this.depositState;
    const validation = this.validation;

    return (
      Boolean(selectedChain) &&
      Boolean(selectedAsset) &&
      Boolean(Number(amount)) &&
      this.walletState.isConnected &&
      !validation.amountError &&
      !validation.balanceError &&
      !validation.decimalError &&
      !this.depositState.isLoading
    );
  }

  // Helper validation methods
  private isAmountInvalid(): boolean {
    const { amount } = this.depositState;
    if (!amount.trim()) {
      return false; // Empty is not invalid, just incomplete
    }

    const numericAmount = parseFloat(amount);
    return isNaN(numericAmount) || numericAmount <= 0;
  }

  private isAmountMoreThanBalance(): boolean {
    const { selectedAsset, amount } = this.depositState;
    if (!selectedAsset || !amount) {
      return false;
    }

    const numericAmount = parseFloat(amount);
    const availableAmount = parseFloat(selectedAsset.displayAmount);

    return numericAmount > availableAmount;
  }

  private hasIncorrectDecimal(): boolean {
    const { selectedAsset, amount } = this.depositState;
    if (!selectedAsset || !amount) {
      return false;
    }

    // Most assets have 6 decimals, but this could be configurable per asset
    const maxDecimals = 6;
    const decimals = amount.includes('.') ? (amount.split('.')[1]?.length ?? 0) : 0;

    return decimals > maxDecimals;
  }

  // Async operations
  async loadAvailableChains() {
    try {
      // Get chain ID from app parameters
      const chainId = this.rootStore.appParametersStore.chainId;
      if (!chainId) {
        console.warn('Chain ID not available yet, using fallback chains');
        // Fallback to supported chains if chain ID not available
        runInAction(() => {
          this.availableChains = this.getFallbackChains();
        });
        return;
      }

      // Get supported chains from registry
      const registryClient = new ChainRegistryClient();
      const registry = await registryClient.remote.get(chainId);
      const ibcConnections = registry.ibcConnections;

      // Map IBC connections to ChainInfo with cosmos-kit support check
      const supportedChainIds = new Set([
        'cosmoshub-4', // Cosmos Hub
        'injective-1', // Injective
        'neutron-1', // Neutron
        'noble-1', // Noble
        'osmosis-1', // Osmosis
        'stride-1', // Stride
      ]);

      const registryChains: ChainInfo[] = ibcConnections
        .filter(chain => supportedChainIds.has((chain as any).chainId))
        .map(chain => {
          const chainData = chain as any;
          const chainRegistryInfo = chains.find(c => c.chain_id === chainData.chainId);
          const cosmosKitChainName =
            chainRegistryInfo?.chain_name || chainData.chainId.split('-')[0] || chainData.chainId;
          return {
            chainId: chainData.chainId,
            chainName: cosmosKitChainName,
            displayName: chainRegistryInfo?.pretty_name || cosmosKitChainName,
            icon:
              chainRegistryInfo?.images?.[0]?.png ||
              `https://raw.githubusercontent.com/cosmos/chain-registry/master/${cosmosKitChainName}/images/${cosmosKitChainName}.png`,
          };
        });

      runInAction(() => {
        this.availableChains =
          registryChains.length > 0 ? registryChains : this.getFallbackChains();
      });
    } catch (error) {
      console.error('Failed to load available chains from registry:', error);
      // Fallback to hardcoded chains on error
      runInAction(() => {
        this.availableChains = this.getFallbackChains();
      });
    }
  }

  private getFallbackChains(): ChainInfo[] {
    return [
      {
        chainId: 'cosmoshub-4',
        chainName: 'cosmoshub',
        displayName: 'Cosmos Hub',
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
      },
      {
        chainId: 'injective-1',
        chainName: 'injective',
        displayName: 'Injective',
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.png',
      },
      {
        chainId: 'neutron-1',
        chainName: 'neutron',
        displayName: 'Neutron',
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ntrn.png',
      },
      {
        chainId: 'noble-1',
        chainName: 'noble',
        displayName: 'Noble',
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/stake.png',
      },
      {
        chainId: 'osmosis-1',
        chainName: 'osmosis',
        displayName: 'Osmosis',
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png',
      },
      {
        chainId: 'stride-1',
        chainName: 'stride',
        displayName: 'Stride',
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.png',
      },
    ];
  }

  async loadDestinationAddress() {
    if (!this.rootStore.penumbraService) {
      return;
    }

    try {
      // TODO: Generate IBC deposit address for the selected account
      // This should use ViewService.ephemeralAddress for privacy
      const mockAddress = `penumbra1234...${this.depositState.destinationAccount}`;

      runInAction(() => {
        this.depositState.destinationAddress = mockAddress;
      });
    } catch (error) {
      console.error('Failed to load destination address:', error);
    }
  }

  async initiateDeposit() {
    if (!this.canDeposit) {
      return;
    }

    runInAction(() => {
      this.depositState.isLoading = true;
      this.depositState.error = undefined;
    });

    try {
      // TODO: Implement actual IBC transfer using cosmos-kit signing
      // This should:
      // 1. Create IBC transfer message
      // 2. Sign with external wallet via cosmos-kit
      // 3. Broadcast transaction
      // 4. Monitor for confirmation

      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction

      runInAction(() => {
        this.depositState.amount = '';
        this.depositState.isLoading = false;
      });

      // Refresh balances after successful deposit
      await this.rootStore.balancesStore.loadBalances();
    } catch (error) {
      runInAction(() => {
        this.depositState.error = error instanceof Error ? error.message : 'Deposit failed';
        this.depositState.isLoading = false;
      });
    }
  }

  // Lifecycle methods
  async initialize() {
    await this.loadAvailableChains();
    await this.loadDestinationAddress();
  }

  dispose() {
    // Cleanup subscriptions if any
  }
}
