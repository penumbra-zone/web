import { makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from './root-store';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { chains } from 'chain-registry';
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
   * Generate Penumbra address for the selected account
   */
  private async getPenumbraAddress(account: number, chainId?: string): Promise<string | undefined> {
    if (!chainId) {
      return undefined;
    }

    try {
      const { address } = await penumbra.service(ViewService).addressByIndex({
        addressIndex: { account },
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

  // Wallet connection actions
  async connectWallet() {
    runInAction(() => {
      this.walletState = {
        ...this.walletState,
        isConnecting: true,
        error: undefined,
      };
    });

    // Note: Actual connection is handled by cosmos-kit in the component
  }

  // Called after successful wallet connection
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

    // Assets loaded by unified assets hook
  }

  // Called when wallet connection fails
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
        console.warn('Chain ID not available yet, will retry when available');
        // Don't set fallback chains, just wait for chainId
        return;
      }

      // Get supported chains from registry
      const registryClient = new ChainRegistryClient();
      const registry = await registryClient.remote.get(chainId);
      const ibcConnections = registry.ibcConnections;

      // Map all IBC connections to ChainInfo - no artificial filtering
      // The cosmos-kit provider will handle which chains have wallet support
      const registryChains: ChainInfo[] = ibcConnections.map(chain => {
        const chainData = chain as any;
        const chainRegistryInfo = chains.find(c => c.chain_id === chainData.chainId);

        // Use consistent naming logic across both deposit and withdraw stores
        const chainName =
          chainRegistryInfo?.chain_name || chainData.chainId.split('-')[0] || chainData.chainId;
        const displayName =
          chainRegistryInfo?.pretty_name ||
          (chainRegistryInfo?.chain_name
            ? chainRegistryInfo.chain_name.charAt(0).toUpperCase() +
              chainRegistryInfo.chain_name.slice(1)
            : chainData.chainId);

        return {
          chainId: chainData.chainId,
          chainName: chainName,
          displayName: displayName,
          icon:
            chainRegistryInfo?.images?.[0]?.png ||
            `https://raw.githubusercontent.com/cosmos/chain-registry/master/${chainName}/images/${chainName}.png`,
        };
      });

      console.log(
        `Loaded ${registryChains.length} chains from registry for deposits:`,
        registryChains.map(c => c.chainId),
      );

      runInAction(() => {
        this.availableChains = registryChains;
      });
    } catch (error) {
      console.error('Failed to load available chains from registry:', error);
      // Don't set fallback - let the error surface so we can debug
      runInAction(() => {
        this.availableChains = [];
      });
    }
  }

  // Removed getFallbackChains - we now rely entirely on the registry
  // This prevents artificial limitations on supported chains

  async loadDestinationAddress() {
    if (!this.rootStore.penumbraService) {
      return;
    }

    try {
      const { selectedChain, destinationAccount } = this.depositState;
      const penumbraAddress = await this.getPenumbraAddress(
        destinationAccount,
        selectedChain?.chainId,
      );

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
   * Get the counterparty channel ID for IBC transfers
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
   * Estimate fee for IBC transfer
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
    const gasLimit = Math.round(estimatedGas * 1.5);
    const gasPrice = GasPrice.fromString(`${feeToken.average_gas_price}${feeToken.denom}`);
    return calculateFee(gasLimit, gasPrice);
  }

  /**
   * Initiate a shield deposit via IBC transfer
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
      // Build MsgTransfer
      const { selectedAsset, amount, selectedChain, destinationAccount } = this.depositState;

      if (!selectedAsset || !selectedChain) {
        throw new Error('Missing asset or chain information');
      }

      // Get the Penumbra chain ID
      const penumbraChainId = this.rootStore.appParametersStore.chainId;
      if (!penumbraChainId) {
        throw new Error('Penumbra chain id could not be retrieved');
      }

      // Generate the Penumbra address
      const penumbraAddress = await this.getPenumbraAddress(
        destinationAccount,
        selectedChain.chainId,
      );
      if (!penumbraAddress) {
        throw new Error('Penumbra address not available');
      }

      // Get the correct channel ID from registry
      const sourceChannel = await this.getCounterpartyChannelId(selectedChain, penumbraChainId);

      // Use default exponent
      const exponent = 6;
      const scaledAmount = BigInt(Math.floor(parseFloat(amount) * 10 ** exponent)).toString();

      const timeout = BigInt(Math.floor(Date.now() / 1000 + 600) * 1_000_000_000);

      const timeoutHeight = {
        revisionNumber: BigInt(1),
        revisionHeight: BigInt(Math.floor(Date.now() / 1000) + 3600),
      };

      const params = {
        sourcePort: 'transfer',
        sourceChannel,
        sender: senderAddress,
        receiver: penumbraAddress,
        token: { denom: selectedAsset.denom, amount: scaledAmount },
        timeoutHeight,
        timeoutTimestamp: timeout,
        memo: '',
      };

      const ibcTransferMsg =
        ibc.applications.transfer.v1.MessageComposer.withTypeUrl.transfer(params);

      const client = await getStargateClient();

      const fee = await this.estimateFee({
        chainId: selectedChain.chainId,
        client,
        signerAddress: senderAddress,
        message: ibcTransferMsg,
      });

      const signedTx = await client.sign(senderAddress, [ibcTransferMsg], fee, '');
      const result = await client.broadcastTx(cosmos.tx.v1beta1.TxRaw.encode(signedTx).finish());
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
