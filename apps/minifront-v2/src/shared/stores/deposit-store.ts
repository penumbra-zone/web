import { makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from './root-store';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { chains } from 'chain-registry';
// Static import for MsgTransfer (IBC)
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx';
import { EncodeObject } from '@cosmjs/proto-signing';
import { StdFee, GasPrice, calculateFee, SigningStargateClient } from '@cosmjs/stargate';
import { ChainWalletContext } from '@cosmos-kit/core';
import { ibc, cosmos } from 'osmo-query';
import { ViewService } from '@penumbra-zone/protobuf';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';
import { penumbra } from '../lib/penumbra';

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
    this.depositState = {
      ...this.depositState,
      selectedChain: chain,
      selectedAsset: undefined, // Reset asset when chain changes
      amount: '',
    };
  }

  // Asset selection actions
  setSelectedAsset(asset?: ExternalAssetBalance) {
    this.depositState = {
      ...this.depositState,
      selectedAsset: asset,
      amount: '', // Reset amount when asset changes
    };
  }

  // Amount input actions
  setAmount(amount: string) {
    // Prevent negative amounts
    if (Number(amount) < 0) {
      return;
    }
    this.depositState = {
      ...this.depositState,
      amount,
    };
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
    this.depositState = {
      ...this.depositState,
      destinationAccount: account,
    };
    void this.loadDestinationAddress();
  }

  /**
   * Generate Penumbra address for the selected account - exactly like original minifront
   */
  private async getPenumbraAddress(
    account: number,
    chainId?: string,
  ): Promise<string | undefined> {
    if (!chainId) {
      return undefined;
    }
    
    try {
      const { address } = await penumbra.service(ViewService).addressByIndex({ 
        addressIndex: { account } 
      });
      
      if (!address) {
        throw new Error('Address not in addressByIndex response');
      }
      
      return bech32mAddress(address);
    } catch (error) {
      console.error('Failed to generate Penumbra address:', error);
      return undefined;
    }
  }

  // Wallet connection actions - now uses cosmos-kit via component hooks
  async connectWallet() {
    runInAction(() => {
      this.walletState = {
        ...this.walletState,
        isConnecting: true,
        error: undefined,
      };
    });

    // Note: The actual connection logic will be handled by cosmos-kit hooks
    // in the component. This method is called from the UI to trigger the modal.
    // The component using useChain will handle the actual connection.
  }

  // Called by the component after successful cosmos-kit connection
  onWalletConnected(address: string, chainId: string) {
    runInAction(() => {
      this.walletState = {
        ...this.walletState,
        isConnected: true,
        address,
        chainId,
        isConnecting: false,
        error: undefined,
      };
    });

    // Assets are now loaded by the unified assets hook
  }

  // Called by the component when cosmos-kit connection fails
  onWalletConnectionError(error: string) {
    runInAction(() => {
      this.walletState = {
        ...this.walletState,
        error,
        isConnecting: false,
        isConnected: false,
      };
    });
  }

  async disconnectWallet() {
    runInAction(() => {
      this.walletState = {
        ...this.walletState,
        isConnected: false,
        address: undefined,
        chainId: undefined,
        error: undefined,
      };
    });
  }

  // Computed validation
  get validation() {
    const { selectedChain, selectedAsset } = this.depositState;

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
      const { selectedChain, destinationAccount } = this.depositState;
      const penumbraAddress = await this.getPenumbraAddress(destinationAccount, selectedChain?.chainId);
      
      if (penumbraAddress) {
        runInAction(() => {
          this.depositState = {
            ...this.depositState,
            destinationAddress: penumbraAddress,
          };
        });
      }
    } catch (error) {
      console.error('Failed to load destination address:', error);
    }
  }

  /**
   * Get the counterparty channel ID for IBC transfers - exactly like original minifront
   */
  private async getCounterpartyChannelId(
    counterpartyChain: ChainInfo,
    penumbraChainId: string,
  ): Promise<string> {
    const registryClient = new ChainRegistryClient();
    const registry = await registryClient.remote.get(penumbraChainId);

    const counterpartyChannelId = registry.ibcConnections.find(
      c => c.chainId === counterpartyChain.chainId,
    )?.counterpartyChannelId;
    
    if (!counterpartyChannelId) {
      throw new Error(
        `Counterparty channel could not be found in registry for chain id: ${counterpartyChain.chainId}`,
      );
    }

    return counterpartyChannelId;
  }

  /**
   * Estimate fee for IBC transfer - exactly like original minifront
   */
  private async estimateFee({
    chainId,
    client,
    signerAddress,
    message,
  }: {
    chainId: string;
    client: SigningStargateClient;
    signerAddress: string;
    message: EncodeObject;
  }): Promise<StdFee> {
    const feeToken = chains.find(({ chain_id }) => chain_id === chainId)?.fees?.fee_tokens[0];
    const avgGasPrice = feeToken?.average_gas_price;
    
    if (!feeToken) {
      throw new Error(`Fee token not found in registry for ${chainId}`);
    }
    if (!avgGasPrice) {
      throw new Error(`Average gas price not found for ${chainId}`);
    }

    const estimatedGas = await client.simulate(signerAddress, [message], '');
    const gasLimit = Math.round(estimatedGas * 1.5); // Give some padding to the limit due to fluctuations
    const gasPrice = GasPrice.fromString(`${feeToken.average_gas_price}${feeToken.denom}`); // e.g. 132uosmo
    return calculateFee(gasLimit, gasPrice);
  }

  /**
   * Initiate a shield deposit via IBC transfer - following original minifront pattern exactly
   *
   * @param getStargateClient  The cosmos-kit getSigningStargateClient function
   * @param senderAddress     The bech32 address of the connected wallet
   */
  async initiateDeposit(
    getStargateClient: ChainWalletContext['getSigningStargateClient'],
    senderAddress: string,
  ) {
    if (!this.canDeposit) {
      return;
    }

    runInAction(() => {
      this.depositState = {
        ...this.depositState,
        isLoading: true,
        error: undefined,
      };
    });

    try {
      // --- Build MsgTransfer exactly like original minifront ---
      const { selectedAsset, amount, selectedChain, destinationAccount } = this.depositState;

      if (!selectedAsset || !selectedChain) {
        throw new Error('Missing asset or chain information');
      }

      // Get the Penumbra chain ID
      const penumbraChainId = this.rootStore.appParametersStore.chainId;
      if (!penumbraChainId) {
        throw new Error('Penumbra chain id could not be retrieved');
      }

      // Generate the actual Penumbra address like original minifront
      const penumbraAddress = await this.getPenumbraAddress(destinationAccount, selectedChain.chainId);
      if (!penumbraAddress) {
        throw new Error('Penumbra address not available');
      }

      // Get the correct channel ID from registry
      const sourceChannel = await this.getCounterpartyChannelId(selectedChain, penumbraChainId);

      // Fallback exponent 6 until asset metadata parsing is added
      const exponent = 6;
      const scaledAmount = BigInt(Math.floor(parseFloat(amount) * 10 ** exponent)).toString();

      const timeout = BigInt(Math.floor(Date.now() / 1000 + 600) * 1_000_000_000); // +10m ns

      // Create timeout height like original minifront
      const timeoutHeight = {
        revisionNumber: BigInt(1), // Default revision number
        revisionHeight: BigInt(Math.floor(Date.now() / 1000) + 3600), // +1 hour in seconds  
      };

      // Create MsgTransfer params exactly like original minifront
      const params = {
        sourcePort: 'transfer',
        sourceChannel, // Use the correct channel from registry
        sender: senderAddress,
        receiver: penumbraAddress, // Use the dynamically generated address
        token: { denom: selectedAsset.denom, amount: scaledAmount },
        timeoutHeight,
        timeoutTimestamp: timeout,
        memo: '',
      };

      // Use osmo-query to create the properly formatted message like original minifront
      const ibcTransferMsg = ibc.applications.transfer.v1.MessageComposer.withTypeUrl.transfer(params);

      // Get the signing client like original minifront
      const client = await getStargateClient();

      // Estimate fee properly like original minifront
      const fee = await this.estimateFee({
        chainId: selectedChain.chainId,
        client,
        signerAddress: senderAddress,
        message: ibcTransferMsg,
      });

      // Sign and broadcast manually like original minifront
      const signedTx = await client.sign(senderAddress, [ibcTransferMsg], fee, '');
      const result = await client.broadcastTx(cosmos.tx.v1beta1.TxRaw.encode(signedTx).finish());

      // Check transaction result like original minifront
      if (result.code !== 0) {
        throw new Error(`Tendermint error: ${result.code}`);
      }

      runInAction(() => {
        this.depositState = {
          ...this.depositState,
          amount: '',
          isLoading: false,
        };
      });

      await this.rootStore.balancesStore.loadBalances();
    } catch (error) {
      runInAction(() => {
        this.depositState = {
          ...this.depositState,
          error: error instanceof Error ? error.message : 'Deposit failed',
          isLoading: false,
        };
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
